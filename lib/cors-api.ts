import { AlpacaCORSConfig, AlpacaCORSConfigOptions } from './interfaces';
import { HttpMethod, Market } from './enums';
import { HttpMethods } from './types';

export class AlpacaCORS implements AlpacaCORSConfig {
  keyId: string;
  secretKey: string;
  baseUrl: string;

  constructor(config: AlpacaCORSConfigOptions = {}) {
    this.keyId = config.keyId || '';
    this.secretKey = config.secretKey || '';
    this.baseUrl = config.baseUrl || Market.Paper;
  }

  // json helper
  httpRequestJson(method: HttpMethods, args: any, body?: any) {
    return this.httpRequestJson(method, args, body).then(response =>
      response.json(),
    );
  }

  // Helper functions
  httpRequest(method: HttpMethods, args, body?: any) {
    return fetch(
      `https://cors-anywhere.herokuapp.com/${this.baseUrl}/v2/${args}`,
      {
        method,
        mode: 'cors',
        headers: {
          'APCA-API-KEY-ID': this.keyId,
          'APCA-API-SECRET-KEY': this.secretKey,
        },
        body,
      },
    );
  }

  dataHttpRequest(method: HttpMethods, args, body?) {
    return fetch(
      `https://cors-anywhere.herokuapp.com/https://data.alpaca.markets/v1/${args}`,
      {
        method,
        mode: 'cors',
        headers: {
          'APCA-API-KEY-ID': this.keyId,
          'APCA-API-SECRET-KEY': this.secretKey,
        },
        body,
      },
    );
  }

  argsFormatter(
    type: string,
    path: string[] = [],
    query?: { [k: string]: string },
  ) {
    let str = path.reduce((memo, element) => `${memo}/${element}`, type);

    if (query) {
      if (type) {
        str += '?';
      }
      str += Object.entries(query)
        .map(
          ([element, value]) =>
            `${encodeURIComponent(element)}=${encodeURIComponent(value)}`,
        )
        .join('&');
    }
    return str;
  }

  // Account methods
  getAccount() {
    return this.httpRequestJson(HttpMethod.Get, this.argsFormatter('account'));
  }

  // Order methods
  createOrder(body) {
    return this.httpRequestJson(
      HttpMethod.Post,
      this.argsFormatter('orders'),
      JSON.stringify(body),
    );
  }

  getOrders(query?) {
    return this.httpRequestJson(
      HttpMethod.Get,
      this.argsFormatter('orders', [], query),
    );
  }

  getOrder(path: string) {
    return this.httpRequestJson(
      HttpMethod.Get,
      this.argsFormatter('orders', [path]),
    );
  }

  getOrderByClientId(query) {
    return this.httpRequestJson(
      HttpMethod.Get,
      this.argsFormatter('orders:by_client_order_id', [], query),
    );
  }

  cancelOrder(path: string) {
    return this.httpRequestJson(
      HttpMethod.Delete,
      this.argsFormatter('orders', [path]),
    );
  }

  // Position methods
  getPosition(path: string) {
    return this.httpRequestJson(
      HttpMethod.Get,
      this.argsFormatter('positions', [path]),
    );
  }

  getPositions() {
    return this.httpRequestJson(
      HttpMethod.Get,
      this.argsFormatter('positions'),
    );
  }

  // Asset methods
  getAssets(query?) {
    return this.httpRequestJson(
      HttpMethod.Get,
      this.argsFormatter('assets', [], query),
    );
  }

  getAsset(path: string) {
    return this.httpRequestJson(
      HttpMethod.Get,
      this.argsFormatter('assets', [path]),
    );
  }

  // Calendar methods
  getCalendar(query?) {
    return this.httpRequestJson(
      HttpMethod.Get,
      this.argsFormatter('calendar', [], query),
    );
  }

  // Clock methods
  getClock() {
    return this.httpRequestJson(HttpMethod.Get, this.argsFormatter('clock'));
  }

  // Bars methods
  getBars(path, query1: string | string[], query2?) {
    const symbols = typeof query1 === 'string' ? query1 : query1.join(',');

    return this.dataHttpRequest(
      HttpMethod.Get,
      this.argsFormatter('bars', [path], Object.assign({ symbols }, query2)),
    )
      .then(resp => resp.json())
      .then(resp => resp)
      .catch(err => err);
  }
}
