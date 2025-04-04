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

// 홈 랭킹 인터페이스
export interface HomeCompanyRankData {
  companyId: number;
  stockCode: string;
  companyImage: string;
  companyName: string;
}

export interface HomeCompanyRankTradeData {
  stockCode: string; // 종목 코드 (예: "005930")
  stckCntgHour: string; // 주식 체결 시간 (문자열, HHmmss 형식 등)
  stckPrpr: number; // 주식 현재가 (체결 가격)
  stckOprc: number; // 주식 시가
  stckHgpr: number; // 주식 최고가
  stckLwpr: number; // 주식 최저가
  cntgVol: number; // 체결 거래량
  acmlVol: number; // 누적 거래량
  acmlTrPbm: number; // 누적 거래 대금
  ccldDvsn: string; // 체결구분 (예: "1" - 매수, "3" - 장전, "5" - 매도)
  changeRate: number;
}
