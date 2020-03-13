import { ActivityTypes, OrderSides, FillTypes } from '../types';

export interface TradeActivity {
  activity_type: ActivityTypes;
  id: string;
  cum_qty: string;
  leaves_qty: string;
  price: string;
  qty: string;
  side: OrderSides;
  symbol: string;
  transaction_time: string;
  order_id: string;
  type: FillTypes;
}
