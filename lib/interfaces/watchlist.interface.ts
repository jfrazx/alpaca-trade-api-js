import { Asset } from './asset.interface';

export interface Watchlist {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  account_id: string;
  assets: Asset[];
}
