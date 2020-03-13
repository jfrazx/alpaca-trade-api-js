export interface PolygonArticle {
  symbols: string[];
  title: string;
  url: string;
  source: string;
  summary: string;
  image?: string;
  timestamp: string;
  keywords?: string[];
}

export type PolygonNews = PolygonArticle[];
