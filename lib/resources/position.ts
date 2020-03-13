import { Alpaca } from '../alpaca-trade-api';
import { Position } from '../interfaces';
import { HttpMethod } from '../enums';

export function getAll(this: Alpaca) {
  return this.httpRequest<never, Position[]>('/positions');
}

export function getOne(this: Alpaca, symbol: string) {
  return this.httpRequest<never, Position>(`/positions/${symbol}`);
}

export function closeAll(this: Alpaca) {
  return this.httpRequest('/positions', {}, null, HttpMethod.Delete);
}

export function closeOne(this: Alpaca, symbol: string) {
  return this.httpRequest(`/positions/${symbol}`, {}, null, HttpMethod.Delete);
}
