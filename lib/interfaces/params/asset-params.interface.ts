import { AssetStatuses, AssetClasses } from '../../types';

export interface AssetParams {
  status?: AssetStatuses;
  asset_class?: AssetClasses;
}
