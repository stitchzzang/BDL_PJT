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

  // 액션
  setName: (name: string) => void;
  setInvestmentStyle: (style: 'conservative' | 'balanced' | 'aggressive' | null) => void;
  setInvestmentMethod: (method: 'ratio' | 'fixed') => void;
  setInvestmentAmount: (amount: number) => void;
  setMarketResponse: (response: 'shortTerm' | 'monthlyTrend') => void;
  setRiseResponse: (value: number) => void;
  setFallResponse: (value: number) => void;
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

  setName: (name) => set({ name }),
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
  setMarketResponse: (response) => set({ marketResponse: response }),
  setRiseResponse: (value) => set({ riseResponse: value }),
  setFallResponse: (value) => set({ fallResponse: value }),
  resetState: () =>
    set({
      name: '',
      investmentStyle: null,
      investmentMethod: null,
      investmentAmount: 1,
      marketResponse: null,
      riseResponse: 15,
      fallResponse: 15,
    }),
}));
