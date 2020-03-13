// import { Alpaca } from '@alpacahq/alpaca-trade-api';
import { Alpaca, OrderSide, TimeInForce, Bars, Bar } from '../lib';
import { OrderSides } from 'types';

const API_KEY = 'YOUR_API_KEY_HERE';
const API_SECRET = 'YOUR_API_SECRET_HERE';
const PAPER = true;

class MeanReversion {
  private alpaca: Alpaca;
  private runningAverage = 0;
  timeToClose = null;
  lastOrder = null;
  stock: string;

  constructor(keyId: string, secretKey: string, paper: boolean) {
    this.alpaca = new Alpaca({
      keyId,
      secretKey,
      paper,
    });

    // Stock that the algo will trade.
    this.stock = 'AAPL';
  }

  async run() {
    // First, cancel any existing orders so they don't impact our buying power.

    await this.alpaca
      .getOrders({
        status: 'all',
        direction: 'asc',
      })
      .then(orders => {
        orders.forEach(async order => {
          this.alpaca.cancelOrder(order.id).catch(err => {
            console.log(err.error);
          });
        });
      })
      .catch(err => {
        console.log(err.error);
      });

    // Wait for market to open.
    console.log('Waiting for market to open...');
    await this.awaitMarketOpen();

    console.log('Market opened.');

    // Get the running average of prices of the last 20 minutes, waiting until we have 20 bars from market open.
    const promBars = new Promise((resolve, reject) => {
      const barChecker = setInterval(async () => {
        await this.alpaca
          .getCalendar({ start: Date.now() })
          .then(async resp => {
            // const [{ open: marketOpen }] = resp;
            const marketOpen = resp[0].open;
            await this.alpaca
              .getBars('minute', this.stock, { start: marketOpen })
              .then(resp => {
                const bars = resp[this.stock];
                if (bars.length >= 20) {
                  clearInterval(barChecker);
                  resolve();
                }
              })
              .catch(err => {
                console.log(err.error);
              });
          });
      }, 60000);
    });
    console.log('Waiting for 20 bars...');
    await promBars;
    console.log('We have 20 bars.');
    // Rebalance our portfolio every minute based off running average data.
    const spin = setInterval(async () => {
      // Clear the last order so that we only have 1 hanging order.
      if (this.lastOrder !== null)
        await this.alpaca.cancelOrder(this.lastOrder.id).catch(err => {
          console.log(err.error);
        });

      // Figure out when the market will close so we can prepare to sell beforehand.
      var closingTime;
      var currTime;
      await this.alpaca
        .getClock()
        .then(resp => {
          closingTime = new Date(
            resp.next_close.substring(0, resp.next_close.length - 6),
          );
          currTime = new Date(
            resp.timestamp.substring(0, resp.timestamp.length - 6),
          );
        })
        .catch(err => {
          console.log(err.error);
        });
      this.timeToClose = closingTime - currTime;

      if (this.timeToClose < 60000 * 15) {
        // Close all positions when 15 minutes til market close.
        console.log('Market closing soon.  Closing positions.');
        try {
          await this.alpaca
            .getPosition(this.stock)
            .then(async resp => {
              const positionQuantity = resp.qty;

              await this.submitMarketOrder(
                positionQuantity,
                this.stock,
                OrderSide.Sell,
              );
            })
            .catch(err => {
              console.log(err.error);
            });
        } catch (err) {
          /*console.log(err.error);*/
        }
        clearInterval(spin);
        console.log('Sleeping until market close (15 minutes).');
        setTimeout(() => {
          // Run script again after market close for next trading day.
          this.run();
        }, 60000 * 15);
      } else {
        // Rebalance the portfolio.
        await this.rebalance();
      }
    }, 60000);
  }

  // Spin until the market is open
  awaitMarketOpen() {
    return new Promise((resolve, _reject) => {
      let isOpen = false;
      const marketChecker = setInterval(async () => {
        await this.alpaca
          .getClock()
          .then(async resp => {
            isOpen = resp.is_open;
            if (isOpen) {
              clearInterval(marketChecker);
              resolve();
            } else {
              let openTime, currTime;
              return this.alpaca
                .getClock()
                .then(resp => {
                  openTime = new Date(
                    resp.next_open.substring(0, resp.next_close.length - 6),
                  );
                  currTime = new Date(
                    resp.timestamp.substring(0, resp.timestamp.length - 6),
                  );
                })
                .then(() => {
                  this.timeToClose = Math.floor(
                    (openTime - currTime) / 1000 / 60,
                  );
                  console.log(
                    this.timeToClose + ' minutes til next market open.',
                  );
                });
            }
          })
          .catch(({ error }) => console.log(error));
      }, 60000);
    });
  }

  // Rebalance our position after an update.
  async rebalance() {
    const position = await this.alpaca.getPosition(this.stock);

    const { qty: positionQuantity, market_value: positionValue } = position;

    // Get the new updated price and running average.
    const bars: Bar[] = await this.alpaca
      .getBars('minute', this.stock, { limit: 20 })
      .then(resp => resp[this.stock] as Bar[])
      .catch(({ error }) => console.log(error));

    const currPrice: number = bars[bars.length - 1].c;

    const runningAverage = bars.reduce((memo, { c }) => memo + c, 0);
    this.runningAverage = runningAverage / 20;

    if (currPrice > this.runningAverage) {
      // Sell our position if the price is above the running average, if any.
      if (parseInt(positionQuantity, 10) > 0) {
        console.log('Setting position to zero.');
        await this.submitLimitOrder(
          positionQuantity,
          this.stock,
          currPrice,
          'sell',
        );
      } else console.log('No position in the stock.  No action required.');
    } else if (currPrice < this.runningAverage) {
      // Determine optimal amount of shares based on portfolio and market data.
      let portfolioValue;
      let buyingPower;
      await this.alpaca
        .getAccount()
        .then(resp => {
          portfolioValue = resp.portfolio_value;
          buyingPower = resp.buying_power;
        })
        .catch(err => {
          console.log(err.error);
        });
      const portfolioShare =
        ((this.runningAverage - currPrice) / currPrice) * 200;
      const targetPositionValue = portfolioValue * portfolioShare;
      let amountToAdd = targetPositionValue - positionValue;

      // Add to our position, constrained by our buying power; or, sell down to optimal amount of shares.
      if (amountToAdd > 0) {
        if (amountToAdd > buyingPower) amountToAdd = buyingPower;
        const qtyToBuy = Math.floor(amountToAdd / currPrice);
        await this.submitLimitOrder(qtyToBuy, this.stock, currPrice, 'buy');
      } else {
        amountToAdd *= -1;
        let qtyToSell = Math.floor(amountToAdd / currPrice);
        if (qtyToSell > positionQuantity) qtyToSell = positionQuantity;
        await this.submitLimitOrder(qtyToSell, this.stock, currPrice, 'sell');
      }
    }
  }

  // Submit a limit order if quantity is above 0.
  async submitLimitOrder(quantity, stock, price, side) {
    if (quantity > 0) {
      await this.alpaca
        .createOrder({
          symbol: stock,
          qty: quantity,
          side,
          type: 'limit',
          time_in_force: 'day',
          limit_price: price,
        })
        .then(resp => {
          this.lastOrder = resp;
          console.log(
            'Limit order of |' +
              quantity +
              ' ' +
              stock +
              ' ' +
              side +
              '| sent.',
          );
        })
        .catch(() => {
          console.log(
            'Order of |' +
              quantity +
              ' ' +
              stock +
              ' ' +
              side +
              '| did not go through.',
          );
        });
    } else {
      console.log(
        'Quantity is <=0, order of |' +
          quantity +
          ' ' +
          stock +
          ' ' +
          side +
          '| not sent.',
      );
    }
  }

  // Submit a market order if quantity is above 0.
  async submitMarketOrder(quantity: number, stock: string, side: OrderSides) {
    if (quantity > 0) {
      await this.alpaca
        .createOrder({
          symbol: stock,
          qty: quantity,
          side,
          type: 'market',
          time_in_force: TimeInForce.Day,
        })
        .then(resp => {
          this.lastOrder = resp;
          console.log(
            'Market order of |' +
              quantity +
              ' ' +
              stock +
              ' ' +
              side +
              '| completed.',
          );
        })
        .catch(err => {
          console.log(
            'Order of |' +
              quantity +
              ' ' +
              stock +
              ' ' +
              side +
              '| did not go through.',
          );
        });
    } else {
      console.log(
        'Quantity is <=0, order of |' +
          quantity +
          ' ' +
          stock +
          ' ' +
          side +
          '| not sent.',
      );
    }
  }
}

// Run the mean reversion class.
const mr = new MeanReversion(API_KEY, API_SECRET, PAPER);

mr.run();
