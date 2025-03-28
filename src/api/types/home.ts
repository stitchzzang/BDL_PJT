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

export interface SearchedCompanyResponse {
  companyCode: string;
  companyId: number;
  companyImage: string;
  companyName: string;
}

export interface UserRanking {
  changeRate: number;
  nickname: string;
  profile: string;
}

export interface UserRankingResponse {
  userRanking: UserRanking[] | null;
}
