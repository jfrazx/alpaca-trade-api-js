import { omitBy, isNil } from 'lodash';

import { toDateString } from '../utils/dateformat';
import { CalendarParams } from '../interfaces';
import { Alpaca } from '../alpaca-trade-api';

export function get(
  this: Alpaca,
  { start = null, end = null }: CalendarParams = {},
) {
  const queryParams: CalendarParams = omitBy(
    {
      start: toDateString(start),
      end: toDateString(end),
    },
    isNil,
  );

  return this.httpRequest('/calendar', queryParams);
}
