import { Datelike, Directions, OrderStatuses } from '../../types';

export interface OrdersListParams {
  direction?: Directions;
  status?: OrderStatuses;
  after?: Datelike;
  nested?: boolean;
  until?: Datelike;
  limit?: number;
}
