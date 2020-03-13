export interface Bar {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

export interface Bars {
  [symbol: string]: Bar[];
}
