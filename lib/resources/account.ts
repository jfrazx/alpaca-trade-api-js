import { omitBy, isNil } from 'lodash';

import { Alpaca } from '../alpaca-trade-api';
import { HttpMethod } from '../enums';
import {
  AccountConfiguration,
  ActivitiesParams,
  TradeActivity,
  NontradeActivity,
  PortfolioHistoryParams,
  PortfolioHistory,
  Account,
} from '../interfaces';

export function get(this: Alpaca) {
  return this.httpRequest<never, Account>('/account');
}

export function updateConfigs(
  this: Alpaca,
  configs: Partial<AccountConfiguration>,
) {
  return this.httpRequest<any, AccountConfiguration>(
    '/account/configurations',
    {},
    configs,
    HttpMethod.Patch,
  );
}

export function getConfigs(this: Alpaca) {
  return this.httpRequest<never, AccountConfiguration>(
    '/account/configurations',
  );
}

export function getActivities(
  this: Alpaca,
  { activityTypes, until, after, direction, date, pageSize },
) {
  if (Array.isArray(activityTypes)) {
    activityTypes = activityTypes.join(',');
  }
  const queryParams: ActivitiesParams = omitBy(
    {
      activity_types: activityTypes,
      until,
      after,
      direction,
      date,
      page_size: pageSize,
    },
    isNil,
  );
  return this.httpRequest<
    ActivitiesParams,
    (TradeActivity | NontradeActivity)[]
  >('/account/activities', queryParams);
}

export function getPortfolioHistory(
  this: Alpaca,
  { date_start, date_end, period, timeframe, extended_hours },
) {
  const queryParams: PortfolioHistoryParams = omitBy(
    {
      date_start,
      date_end,
      period,
      timeframe,
      extended_hours,
    },
    isNil,
  );
  return this.httpRequest<PortfolioHistoryParams, PortfolioHistory>(
    '/account/portfolio/history',
    queryParams,
  );
}
