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
  setInvestmentStyle: (style: 'conservative' | 'balanced' | 'aggressive') => void;
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
  investmentAmount: 0,
  marketResponse: null,
  riseResponse: 50,
  fallResponse: 50,

  setName: (name) => set({ name }),
  setInvestmentStyle: (style) => set({ investmentStyle: style }),
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
      investmentAmount: 0,
      marketResponse: null,
      riseResponse: 50,
      fallResponse: 50,
    }),
}));
