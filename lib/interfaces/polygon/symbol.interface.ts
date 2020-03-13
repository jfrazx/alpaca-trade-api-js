export interface PolygonSymbol {
  symbol: {
    symbol: string;
    name: string;
    type: string;
    updated: string;
    isOTC: boolean;
    primaryExchange: number;
    exchSym: string;
    active: boolean;
    url: string;
  };
  endpoints: {
    company: string;
    dividends: string;
    earnings: string;
    analysts: string;
    changes: string;
    splits: string;
    news: string;
  };
}
