export interface LatestNews {
  stockCandleId: number;
  newsId: number;
  newsTitle: string;
  newsContent: string;
  newsDate: string;
  newsThumbnailUrl: string | null;
}

export interface SearchedCompany {
  categoryId: string;
  companyName: string;
}
