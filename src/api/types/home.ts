export interface LatestNews {
  stockCandleId: number;
  newsId: number;
  newsTitle: string;
  newsContent: string;
  newsDate: string;
  newsThumbnailUrl: string | null;
  newsOriginalUrl: string | null;
}

export interface SearchedCompany {
  categoryId: string;
  companyName: string;
}

export interface SearchedCompanyResponse {
  closePrice: number;
  closePricePercent: number;
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

// 코스피,코스닥 인터페이스
export interface HomeChartData {
  bstpNmixPrpr: string; //현재가
  acmlVol: string; //거래량
  bstpNmixOprc: string; //시가
  bstpNmixHgpr: string; //고가
  bstpNmixLwpr: string; //저가
  stckBsopDate: string; //기준일
  bstpNmixPrdyVrss: string; //전일 대비 변화량
  bstpNmixPrdyCtrt: string; //전일 대비 변동률
}

export interface HomeChartKosdaqKospiData {
  kosdaq: HomeChartData[];
  kospi: HomeChartData[];
}
