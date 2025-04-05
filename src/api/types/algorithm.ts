export interface RunningCompany {
  companyId: number;
  companyName: string;
}

export interface Algorithm {
  algorithmId: number;
  algorithmName: string;
  profitPercentToSell: number;
  lossPercentToSell: number;
  oneMinuteIncreasePercent: number | null;
  oneMinuteIncreaseAction: string | null;
  oneMinuteDecreasePercent: number | null;
  oneMinuteDecreaseAction: string | null;
  dailyIncreasePercent: number | null;
  dailyIncreaseAction: string | null;
  dailyDecreasePercent: number | null;
  dailyDecreaseAction: string | null;
  shortTermMaPeriod: number | null;
  longTermMaPeriod: number | null;
  entryMethod: string;
  entryInvestmentMethod: string;
  entryFixedAmount: number | null;
  entryFixedPercentage: number | null;
  exitMethod: string;
  exitInvestmentMethod: string | null;
  exitFixedAmount: number | null;
  exitFixedPercentage: number | null;
  isFee: boolean;
  createdAt: string;
  updatedAt: string;
  isRunning: boolean;
  runningCompanies: RunningCompany[];
}

export interface AlgorithmResponse {
  algorithms: Algorithm[];
}

export interface CreateAlgorithmRequest {
  algorithmName: string;
  profitPercentToSell: number;
  lossPercentToSell: number;
  oneMinuteIncreasePercent: number | null;
  oneMinuteIncreaseAction: string | null;
  oneMinuteDecreasePercent: number | null;
  oneMinuteDecreaseAction: string | null;
  dailyIncreasePercent: number | null;
  dailyIncreaseAction: string | null;
  dailyDecreasePercent: number | null;
  dailyDecreaseAction: string | null;
  shortTermMaPeriod: number | null;
  longTermMaPeriod: number | null;
  entryMethod: string;
  entryInvestmentMethod: string;
  entryFixedAmount: number | null;
  entryFixedPercentage: number | null;
  exitMethod: string;
  exitInvestmentMethod: string | null;
  exitFixedAmount: number | null;
  exitFixedPercentage: number | null;
  isFee: boolean;
}

export interface CheckAlgorithm {
  isRunning: boolean;
  algorithmId: number;
}

// 백테스트 회사 기본 정보
export interface CompanyProfile {
  companyImage: string;
  companyCode: string;
  companyName: string;
  categories: string[];
}

// 백테스트 stockDaily 정보
export interface StockDailyData {
  stockCandleId: number;
  companyId: '1';
  openPrice: number;
  openPricePercent: number;
  highPrice: number;
  highPricePercent: number;
  lowPrice: number;
  lowPricePercent: number;
  closePrice: number;
  closePricePercent: number;
  accumulatedVolume: number;
  accumulatedTradeAmount: number;
  tradingDate: string;
  periodType: number;
  fiveAverage: number;
  twentyAverage: number;
}
export interface StockDaily {
  companyId: string;
  limit: number;
  cursor: string;
  data: StockDailyData[];
}

// 백테스트 결과창
export interface Summary {
  rateOfReturn: number;
  totalTrades: number;
  startingCapital: number;
  endingCapital: number;
  maxDrawdown: number;
  winRate: number;
}

// 백테스트 일봉 정보
// 일봉 백테스팅 기록
export interface Trade {
  type: string;
  price: number;
  quantity: number;
  reason: string;
}
// 벡테스팅 일봉 전체 정보
export interface DailyData {
  index: number;
  date: string;
  portfolioValue: number;
  cash: number;
  equity: number;
  dailyReturn: number;
  cumulativeReturn: number;
  trade: boolean | Trade;
}

export interface BackTestResult {
  companyProfile: CompanyProfile;
  stockDaily: StockDaily;
  summary: Summary;
  dailyData: DailyData[];
}
//companyProfile
//stockDaily
//summary
//dailyData
