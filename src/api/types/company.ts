// 종목 프로필 가져오기
export interface CompanyProfile {
  image: string; // 기업 로고 s3 주소
  name: string; // 기업명
  categories: string[]; // 기업 카테고리 리스트
}

// 종목 기본 정보 가져오기
export interface CompanyBasicInfo {
  capital: number; // 자본금
  listedSharesCnt: number; // 상장주식수
  listedCapitalAmount: number; // 상장자본금
  parValue: number; // 액면가
  issuePrice: number; // 발행가액
  closePrice: number; // 종가
  previousClosePrice: number; // 전일종가
  isTradingStop: boolean; // 거래정지여부
  isAdministrationItem: boolean; // 관리종목여부
}

// 종목 재무 비율 가져오기
export interface CompanyFinancialRatio {
  profitIncreaseRate: number; // 영업이익증가율
  salesGrowthRate: number; // 매출액 증가율
  netIncome_increaseRate: number; // 순이익 증가율
  liabilityRate: number; // 부채비율
  returnOnEquity: number; // 자기자본이익률
}

// 종목 수익성 비율 가져오기
export interface CompanyProfitabilityRatio {
  capitalNetIncomeRate: number; // 총 자본 순수익율
  selfCapitalNetIncomeRate: number; // 자기자본 순수익율
  salesNetIncomeRate: number; // 매출액순수익율
  salesTotalRate: number; // 매출액 총이익율
}
