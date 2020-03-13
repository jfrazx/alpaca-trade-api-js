import { omitBy, isNil } from 'lodash';

import { OrderParams, OrdersListParams, Order } from '../interfaces';
import { Alpaca } from '../alpaca-trade-api';
import { HttpMethod } from '../enums';

export function getAll(
  this: Alpaca,
  { status, until, after, limit, direction, nested }: OrdersListParams = {},
) {
  const queryParams: OrdersListParams = omitBy(
    {
      status,
      until,
      after,
      limit,
      direction,
      nested,
    },
    isNil,
  );

  return this.httpRequest<OrdersListParams, Order[]>('/orders', queryParams);
}

export function getOne(this: Alpaca, id) {
  return this.httpRequest(`/orders/${id}`);
}

export function getByClientOrderId(this: Alpaca, clientOrderId: string) {
  const queryParams = { client_order_id: clientOrderId };
  return this.httpRequest('/orders:by_client_order_id', queryParams);
}

export function post(this: Alpaca, order: OrderParams) {
  return this.httpRequest('/orders', null, order, HttpMethod.Post);
}

export function cancel(this: Alpaca, id: string) {
  return this.httpRequest('/orders/' + id, null, null, HttpMethod.Delete);
}

export function cancelAll(this: Alpaca) {
  return this.httpRequest('/orders', null, null, HttpMethod.Delete);
}

export function patchOrder(this: Alpaca, id: string, newOrder: OrderParams) {
  return this.httpRequest(`/orders/${id}`, null, newOrder, HttpMethod.Patch);
}
