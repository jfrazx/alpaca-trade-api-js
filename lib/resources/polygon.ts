import { HttpMethod, ApiVersion } from '../enums';
import { Alpaca } from '../alpaca-trade-api';
import { toDateString } from '../utils';
import { Datelike } from '../types';

import { PolygonNews, PolygonDividend } from '../interfaces';

import {} from 'polygon.io';

export function exchanges(this: Alpaca) {
  return this.polygonHttpRequest('/meta/exchanges');
}

export function symbolTypeMap(this: Alpaca) {
  return this.polygonHttpRequest('/meta/symbol-types');
}

// options: limit, offset
/*
 * @deprecated Will be removed in a future release, and will be removed from the Polygon API. Please use historicTradesV2 instead.
 */
export function historicTrades(
  this: Alpaca,
  symbol: string,
  date: Datelike,
  options = {},
) {
  console.warn(
    'Calling deprecated function historicTrades. Please use historicTradesV2 instead.',
  );
  const path = `/historic/trades/${symbol}/${toDateString(date)}`;
  return this.polygonHttpRequest(path, options);
}

// options: limit, timestamp, timestamp_limit, reverse
export function historicTradesV2(
  this: Alpaca,
  symbol: string,
  date: Datelike,
  options = {},
) {
  const path = `/ticks/stocks/trades/${symbol}/${toDateString(date)}`;
  return this.polygonHttpRequest(
    path,
    options,
    null,
    HttpMethod.Get,
    ApiVersion.V2,
  );
}

// options: limit, offset
/*
 * @deprecated Will be removed in a future release, and will be removed from the Polygon API. Please use historicQuotesV2 instead.
 */
export function historicQuotes(
  this: Alpaca,
  symbol: string,
  date,
  options = {},
) {
  console.warn(
    'Calling deprecated function historicQuotes. Please use historicQuotesV2 instead.',
  );
  const path = `/historic/quotes/${symbol}/${toDateString(date)}`;
  return this.polygonHttpRequest(path, options);
}

// options: limit, timestamp, timestamp_limit, reverse
export function historicQuotesV2(
  this: Alpaca,
  symbol: string,
  date,
  options = {},
) {
  const path = `ticks/stocks/nbbo/${symbol}/${toDateString(date)}`;
  return this.polygonHttpRequest(
    path,
    options,
    null,
    HttpMethod.Get,
    ApiVersion.V2,
  );
}

// size: 'day', 'minute'
// options: from, to, limit, unadjusted
export function historicAggregates(
  this: Alpaca,
  size,
  symbol: string,
  options = {},
) {
  const path = `/historic/agg/${size}/${symbol}`;
  return this.polygonHttpRequest(path, options);
}

// size: 'day', 'minute'
// from, to: YYYY-MM-DD or unix millisecond timestamps
// options: unadjusted
export function historicAggregatesV2(
  this: Alpaca,
  symbol: string,
  multiplier: number,
  size,
  from: Datelike,
  to: Datelike,
  options = {},
) {
  const path = `/aggs/ticker/${symbol}/range/${multiplier}/${size}/${from}/${to}`;
  return this.polygonHttpRequest(
    path,
    options,
    null,
    HttpMethod.Get,
    ApiVersion.V2,
  );
}

export function lastTrade(this: Alpaca, symbol: string) {
  const path = `/last/stocks/${symbol}`;
  return this.polygonHttpRequest(path);
}

export function lastQuote(this: Alpaca, symbol: string) {
  const path = `/last_quote/stocks/${symbol}`;
  return this.polygonHttpRequest(path);
}

export function conditionMap(this: Alpaca, ticktype = 'trades') {
  const path = `/meta/conditions/${ticktype}`;
  return this.polygonHttpRequest(path);
}

const symbolMeta = <T>(resource = '') =>
  function(this: Alpaca, symbol: string) {
    return this.polygonHttpRequest<never, T>(
      `/meta/symbols/${symbol}${resource ? `/${resource}` : resource}`,
    );
  };
const symbolReference = <T>(reference: string) =>
  function(this: Alpaca, symbol: string) {
    return this.polygonHttpRequest<unknown, T>(
      `/reference/${reference}/${symbol}`,
      {},
      null,
      HttpMethod.Get,
      ApiVersion.V2,
    );
  };

export const getSymbol = symbolMeta();
export const company = symbolMeta('company');
export const analysts = symbolMeta('analysts');
export const news = symbolMeta<PolygonNews>('news');

export const dividends = symbolReference<PolygonDividend[]>('dividends');
export const financials = symbolReference('financials');
export const earnings = symbolReference('earnings');
export const splits = symbolReference('splits');
