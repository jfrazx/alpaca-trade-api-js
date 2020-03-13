import { Alpaca } from '../alpaca-trade-api';
import { AssetParams, Asset } from '../interfaces';

export function getAll(this: Alpaca, options: AssetParams = {}) {
  return this.httpRequest<AssetParams, Asset[]>('/assets', options);
}

export function getOne(this: Alpaca, symbol: string) {
  return this.httpRequest<never, Asset>(`/assets/${symbol}`);
}
