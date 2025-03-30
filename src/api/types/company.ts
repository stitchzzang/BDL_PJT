// 종목 프로필 가져오기
export interface CompanyProfile {
  image: string;
  name: string;
  categories: string[];
}

// 종목 기본 정보 가져오기
export interface CompanyBasicInfo {
  capital: number;
  listedSharesCnt: number;
  listedCapitalAmount: number;
  parValue: number;
  issuePrice: number;
  closePrice: number;
  previousClosePrice: number;
  isTradingStop: boolean;
  isAdministrationItem: boolean;
}

// 종목 재무 비율 가져오기
export interface CompanyFinancialRatio {
  profitIncreaseRate: number;
  salesGrowthRate: number;
  netIncome_increaseRate: number;
  liabilityRate: number;
  returnOnEquity: number;
}

// 종목 수익성 비율 가져오기
export interface CompanyProfitabilityRatio {
  capitalNetIncomeRate: number;
  selfCapitalNetIncomeRate: number;
  salesNetIncomeRate: number;
  salesTotalRate: number;
}
