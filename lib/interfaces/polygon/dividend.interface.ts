export interface PolygonDividend {
  symbol: string;
  type: string;
  exDate: string;
  paymentDate?: string;
  recordDate?: string;
  declaredDate?: string;
  amount: number;
  qualified?: string;
  flag?: string;
}
