import {
  OrderSides,
  OrderTypes,
  OrderClasses,
  TimesInForce,
} from '../../types';

interface IOrderParams {
  symbol: string;
  qty: string | number;
  time_in_force: TimesInForce;
  side: OrderSides;
  type: OrderTypes;
  extended_hours?: boolean;
  client_order_id?: string;
  order_class?: OrderClasses;
  take_profit?: {
    limit_price: string | number;
  };
  stop_loss?: {
    stop_price: string | number;
    limit_price?: string | number;
  };
}

interface MarketPrice {
  type: 'market';
  stop_price?: string | number;
  limit_price?: string | number;
}

interface StopPrice {
  type: 'stop';
  stop_price: string | number;
}

interface LimitPrice {
  type: 'limit';
  limit_price: string | number;
}

interface StopLimitPrice {
  type: 'stop_limit';
  stop_price: string | number;
  limit_price: string | number;
}

export type OrderParams =
  | (IOrderParams & StopLimitPrice)
  | (IOrderParams & MarketPrice)
  | (IOrderParams & LimitPrice)
  | (IOrderParams & StopPrice);
