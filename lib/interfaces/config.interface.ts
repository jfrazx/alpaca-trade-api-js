export interface AlpacaConfig extends AlpacaCORSConfig {
  dataBaseUrl: string;
  polygonBaseUrl: string;
  oauth: string;
  apiVersion: string;
}

export interface AlpacaCORSConfig {
  secretKey: string;
  baseUrl: string;
  keyId: string;
}
