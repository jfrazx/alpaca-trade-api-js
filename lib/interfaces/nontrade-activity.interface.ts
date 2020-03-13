import { ActivityTypes } from '../types';

export interface NontradeActivity {
  activity_type: ActivityTypes;
  id: string;
  date: string;
  net_amount: string;
  symbol: string;
  qty: string;
  per_share_amount: string;
}
