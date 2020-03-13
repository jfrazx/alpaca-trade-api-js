import { RequestPromise } from 'request-promise';

import { Alpaca } from '../../alpaca-trade-api';
import { Timeframes } from '../../types';
import { Bars } from '../../interfaces';

// timeframe is one of
// minute, 1Min, 5Min, 15Min, day or 1D.
// minute is an alias of 1Min. Similarly, day is of 1D.
// Symbols may be a string or an array
// options: limit, start, end, after, until
/**
 * @todo options
 *
 * @export
 * @param {Timeframes} timeframe
 * @param {(string | string[])} symbols
 * @param {*} [options={}]
 * @returns
 */
export function getBars(
  this: Alpaca,
  timeframe: Timeframes,
  symbols: string | string[],
  options = {},
): RequestPromise<Bars> {
  symbols = typeof symbols === 'string' ? symbols : symbols.join(',');
  return this.dataHttpRequest(
    `/bars/${timeframe}`,
    Object.assign({ symbols }, options),
  );
}
