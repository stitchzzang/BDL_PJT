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
