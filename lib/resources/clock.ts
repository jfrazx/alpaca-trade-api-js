import { Alpaca } from '../alpaca-trade-api';
import { Clock } from '../interfaces';

export function get(this: Alpaca) {
  return this.httpRequest<never, Clock>('/clock');
}
