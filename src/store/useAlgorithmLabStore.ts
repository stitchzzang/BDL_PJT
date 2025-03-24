import { create } from 'zustand';

interface AlgorithmLabState {
  // 알고리즘 기본 정보
  name: string;
  investmentStyle: 'conservative' | 'balanced' | 'aggressive' | null;

  // 투자 방식 설정
  investmentMethod: 'ratio' | 'fixed' | null;
  investmentAmount: number;

  // 시장 반응 설정
  marketResponse: 'shortTerm' | 'monthlyTrend' | null;
  riseResponse: number;
  fallResponse: number;
  riseAction: 'buy' | 'sell';
  fallAction: 'buy' | 'sell';

  // 이동평균선 설정
  shortTermMaPeriod: number | null;
  longTermMaPeriod: number | null;

  // 액션
  setName: (name: string) => void;
  setInvestmentStyle: (style: 'conservative' | 'balanced' | 'aggressive' | null) => void;
  setInvestmentMethod: (method: 'ratio' | 'fixed') => void;
  setInvestmentAmount: (amount: number) => void;
  setMarketResponse: (response: 'shortTerm' | 'monthlyTrend' | null) => void;
  setRiseResponse: (value: number) => void;
  setFallResponse: (value: number) => void;
  setRiseAction: (action: 'buy' | 'sell') => void;
  setFallAction: (action: 'buy' | 'sell') => void;
  setShortTermMaPeriod: (period: number | null) => void;
  setLongTermMaPeriod: (period: number | null) => void;
  resetState: () => void;
}

export const useAlgorithmLabStore = create<AlgorithmLabState>((set) => ({
  name: '',
  investmentStyle: null,
  investmentMethod: null,
  investmentAmount: 1,
  marketResponse: null,
  riseResponse: 15,
  fallResponse: 15,
  riseAction: 'buy',
  fallAction: 'sell',
  shortTermMaPeriod: null,
  longTermMaPeriod: null,

  setName: (name) => set({ name }),
  // 투자 스타일 선택 시 이익률과 손절매 설정
  setInvestmentStyle: (style) => {
    switch (style) {
      case 'conservative':
        set({ investmentStyle: style, riseResponse: 4, fallResponse: 1.5 });
        break;
      case 'balanced':
        set({ investmentStyle: style, riseResponse: 10, fallResponse: 4 });
        break;
      case 'aggressive':
        set({ investmentStyle: style, riseResponse: 20, fallResponse: 8.5 });
        break;
      default:
        set({ investmentStyle: null });
        break;
    }
  },
  setInvestmentMethod: (method) => set({ investmentMethod: method }),
  setInvestmentAmount: (amount) => set({ investmentAmount: amount }),
  setMarketResponse: (response) =>
    set({
      marketResponse: response,
      ...(response === null && { shortTermMaPeriod: null, longTermMaPeriod: null }),
    }),
  setRiseResponse: (value) => set({ riseResponse: Math.min(Math.max(value, 1), 30) }),
  setFallResponse: (value) => set({ fallResponse: Math.min(Math.max(value, 1), 30) }),
  setRiseAction: (action) => set({ riseAction: action }),
  setFallAction: (action) => set({ fallAction: action }),
  setShortTermMaPeriod: (period) => set({ shortTermMaPeriod: period }),
  setLongTermMaPeriod: (period) => set({ longTermMaPeriod: period }),
  // 알고리즘 랩 초기화
  resetState: () =>
    set({
      name: '',
      investmentStyle: null,
      investmentMethod: null,
      investmentAmount: 1,
      marketResponse: null,
      riseResponse: 15,
      fallResponse: 15,
      riseAction: 'buy',
      fallAction: 'sell',
      shortTermMaPeriod: null,
      longTermMaPeriod: null,
    }),
}));
