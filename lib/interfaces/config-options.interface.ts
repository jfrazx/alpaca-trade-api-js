export interface AlpacaConfigOptions {
  baseUrl?: string;
  paper?: boolean;
  dataBaseUrl?: string;
  polygonBaseUrl?: string;
  keyId?: string;
  secretKey?: string;
  apiVersion?: string;
  oauth?: string;
}

export interface AlpacaCORSConfigOptions {
  secretKey?: string;
  baseUrl?: string;
  keyId?: string;
}
