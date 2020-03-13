import { OrderStatuses, OrderTypes, OrderSides } from '../types';

export interface Order {
  id: string;
  client_order_id: string;
  created_at: string;
  updated_at: string | null;
  submitted_at: string | null;
  filled_at: string | null;
  expired_at: string | null;
  canceled_at: string | null;
  failed_at: string | null;
  asset_id: string;
  symbol: string;
  asset_class: string;
  qty: string;
  filled_qty: string;
  type: OrderTypes;
  side: OrderSides;
  time_in_force: string;
  limit_price: string | null;
  stop_price: string | null;
  filled_avg_price: string | null;
  status: OrderStatuses;
  extended_hours: boolean;
  legs: Order[] | null;
}
