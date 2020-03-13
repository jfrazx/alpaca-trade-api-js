import requestPromise, { RequestPromise } from 'request-promise';
import urljoin from 'urljoin';

import { ApiVersion, HttpMethod } from './enums';
import { Alpaca } from './alpaca-trade-api';
import { HttpMethods } from './types';

export function httpRequest<Q, T>(
  this: Alpaca,
  endpoint: string,
  queryParams: Q = {} as Q,
  body?: any,
  method: HttpMethods = HttpMethod.Get,
): RequestPromise<T> {
  const { baseUrl, keyId, secretKey, apiVersion, oauth } = this.configuration;

  return requestPromise({
    method,
    uri: urljoin(baseUrl, apiVersion, endpoint) as string,
    qs: queryParams,
    headers: generateHeaders(method, oauth, keyId, secretKey),
    body,
    json: true,
  });
}

export function dataHttpRequest<Q, T>(
  this: Alpaca,
  endpoint: string,
  queryParams: Q = {} as Q,
  body?: any,
  method: HttpMethods = HttpMethod.Get,
): RequestPromise<T> {
  const { dataBaseUrl, keyId, secretKey, oauth } = this.configuration;

  return requestPromise({
    method,
    uri: urljoin(dataBaseUrl, ApiVersion.V1, endpoint),
    qs: queryParams,
    headers: generateHeaders(method, oauth, keyId, secretKey),
    body,
    json: true,
  });
}

/**
 * @todo
 */
export function polygonHttpRequest<Q, T>(
  this: Alpaca,
  endpoint: string,
  queryParams = {} as Q,
  body?: any,
  method: HttpMethods = HttpMethod.Get,
  apiVersion: ApiVersion = ApiVersion.V1,
): RequestPromise<T> {
  const { baseUrl, keyId, polygonBaseUrl } = this.configuration;

  (queryParams as any).apiKey = keyId;
  (queryParams as any).staging = baseUrl.indexOf('staging') > -1;

  console.log(urljoin(polygonBaseUrl, apiVersion, endpoint), queryParams, body);

  return requestPromise({
    method,
    uri: urljoin(polygonBaseUrl, apiVersion, endpoint),
    qs: queryParams,
    headers: {
      'content-type': 'application/json',
    },
    body,
    json: true,
  });
}

function generateHeaders(
  method: HttpMethods,
  oauth: string,
  keyId: string,
  secretKey: string,
) {
  return {
    'content-type':
      method !== HttpMethod.Delete ? 'application/json' : undefined,
    ...(oauth === ''
      ? {
          'APCA-API-KEY-ID': keyId,
          'APCA-API-SECRET-KEY': secretKey,
        }
      : { Authorization: `Bearer ${oauth}` }),
  };
}
