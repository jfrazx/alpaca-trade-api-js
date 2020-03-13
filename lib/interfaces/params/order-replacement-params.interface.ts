import { TimesInForce } from '../../types';

export interface OrderReplacementParams {
  client_order_id: string;
  limit_price?: string | number;
  stop_price?: string | number;
  time_in_force: TimesInForce;
  qty: string | number;
}
