import * as dotenv from 'dotenv';

dotenv.config();

import { AlpacaConfig, AlpacaConfigOptions } from './interfaces';
import { AlpacaStreamClient } from './resources/websockets';
import { Market } from './enums';
import {
  apcaDataBaseUrl,
  polygonApiBaseUrl,
  apcaApiSecretKey,
  apcaApiBaseUrl,
  apcaApiVersion,
  apcaApiKeyId,
  apcaApiOauth,
} from './config';

import * as calendar from './resources/calendar';
import * as position from './resources/position';
import * as account from './resources/account';
import * as polygon from './resources/polygon';
import * as asset from './resources/asset';
import * as clock from './resources/clock';
import * as order from './resources/order';
import * as bars from './resources/data';
import * as api from './api';

export class Alpaca {
  readonly configuration: AlpacaConfig;
  websocket: AlpacaStreamClient;

  constructor({
    paper = true,
    dataBaseUrl = apcaDataBaseUrl,
    baseUrl = apcaApiBaseUrl,
    polygonBaseUrl = polygonApiBaseUrl,
    keyId = apcaApiKeyId,
    secretKey = apcaApiSecretKey,
    apiVersion = apcaApiVersion,
    oauth = apcaApiOauth,
  }: AlpacaConfigOptions = {}) {
    this.configuration = {
      baseUrl: baseUrl || (paper ? Market.Paper : Market.Live),
      dataBaseUrl,
      polygonBaseUrl,
      keyId,
      secretKey,
      apiVersion,
      oauth,
    };

    this.websocket = new AlpacaStreamClient({
      url: this.configuration.baseUrl,
      apiKey: this.configuration.keyId,
      secretKey: this.configuration.secretKey,
      oauth: this.configuration.oauth,
    });
  }

  // Helper methods
  httpRequest = api.httpRequest;
  dataHttpRequest = api.dataHttpRequest;
  polygonHttpRequest = api.polygonHttpRequest;

  // Account
  getAccount = account.get;
  updateAccountConfigurations = account.updateConfigs;
  getAccountConfigurations = account.getConfigs;
  getAccountActivities = account.getActivities;
  getPortfolioHistory = account.getPortfolioHistory;

  // Positions
  getPositions = position.getAll;
  getPosition = position.getOne;
  closeAllPositions = position.closeAll;
  closePosition = position.closeOne;

  // Calendar
  getCalendar = calendar.get;

  // Clock
  getClock = clock.get;

  // Asset
  getAssets = asset.getAll;
  getAsset = asset.getOne;

  // Order
  getOrders = order.getAll;
  getOrder = order.getOne;
  getOrderByClientId = order.getByClientOrderId;
  createOrder = order.post;
  replaceOrder = order.patchOrder;
  cancelOrder = order.cancel;
  cancelAllOrders = order.cancelAll;

  // Bars
  getBars = bars.getBars;

  // Polygon
  getExchanges = polygon.exchanges;
  getSymbolTypeMap = polygon.symbolTypeMap;
  getHistoricTrades = polygon.historicTrades;
  getHistoricTradesV2 = polygon.historicTradesV2;
  getHistoricQuotes = polygon.historicQuotes;
  getHistoricQuotesV2 = polygon.historicQuotesV2;
  getHistoricAggregates = polygon.historicAggregates;
  getHistoricAggregatesV2 = polygon.historicAggregatesV2;
  getLastTrade = polygon.lastTrade;
  getLastQuote = polygon.lastQuote;
  getConditionMap = polygon.conditionMap;
  getCompany = polygon.company;
  getAnalysts = polygon.analysts;
  getDividends = polygon.dividends;
  getEarnings = polygon.earnings;
  getFinancials = polygon.financials;
  getSplits = polygon.splits;
  getNews = polygon.news;
  getSymbol = polygon.getSymbol;
}
