import { Timeframes } from '../../types';

export interface PortfolioHistoryParams {
  period?: string;
  timeframe?: Timeframes;
  date_start?: string;
  date_end?: string;
  extended_hours?: boolean;
}
