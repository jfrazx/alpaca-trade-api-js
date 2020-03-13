import { Envirator, EnvManyResult } from '@status/envirator';

import { ApiVersion } from '../enums';

export const env = new Envirator({
  productionDefaults: true,
  keyToJsProp: true,
});

export const {
  apcaDataBaseUrl,
  polygonApiBaseUrl,
  apcaApiSecretKey,
  apcaApiBaseUrl,
  apcaApiVersion,
  apcaApiKeyId,
  apcaApiOauth,
}: EnvManyResult<string> = env.provideMany([
  { key: 'APCA_API_BASE_URL', warnOnly: true },
  { key: 'APCA_DATA_BASE_URL', defaultValue: 'https://data.alpaca.markets' },
  { key: 'POLYGON_API_BASE_URL', defaultValue: 'https://api.polygon.io' },
  { key: 'APCA_API_SECRET_KEY', defaultValue: '' },
  { key: 'APCA_API_VERSION', defaultValue: ApiVersion.V2 },
  { key: 'APCA_API_KEY_ID', defaultValue: '' },
  { key: 'APCA_API_OAUTH', defaultValue: '' },
]);
