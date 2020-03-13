import { AssetStatuses, Exchanges, AssetClasses } from '../types';

export interface Asset {
  id: string;
  class: AssetClasses;
  exchange: Exchanges;
  symbol: string;
  status: AssetStatuses;
  tradable: boolean;
  marginable: boolean;
  shortable: boolean;
  easy_to_borrow: boolean;
}
