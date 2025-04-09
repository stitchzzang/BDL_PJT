import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { create } from 'zustand';

interface AlgorithmLabState {
  // 알고리즘 기본 정보
  algorithmName: string;
  investmentStyle: 'conservative' | 'balanced' | 'aggressive' | null;

  // 손익 설정
  profitPercentToSell: number;
  lossPercentToSell: number;

  // 1분봉 설정
  oneMinuteIncreasePercent: number | null;
  oneMinuteIncreaseAction: 'BUY' | 'SELL' | null;
  oneMinuteDecreasePercent: number | null;
  oneMinuteDecreaseAction: 'BUY' | 'SELL' | null;

  // 일봉 설정
  dailyIncreasePercent: number | null;
  dailyIncreaseAction: 'BUY' | 'SELL' | null;
  dailyDecreasePercent: number | null;
  dailyDecreaseAction: 'BUY' | 'SELL' | null;

  // 이동평균선 설정
  shortTermMaPeriod: number | null;
  longTermMaPeriod: number | null;

  // 진입/청산 설정
  entryMethod: 'ONCE' | 'DIVIDE' | null;
  entryInvestmentMethod: 'FIXED_AMOUNT' | 'FIXED_PERCENTAGE' | null;
  entryFixedAmount: number | null;
  entryFixedPercentage: number | null;
  exitMethod: 'ONCE' | 'DIVIDE' | null;
  exitInvestmentMethod: 'FIXED_AMOUNT' | 'FIXED_PERCENTAGE' | null;
  exitFixedAmount: number | null;
  exitFixedPercentage: number | null;
  isFee: boolean;

  // 액션
  setAlgorithmName: (name: string) => void;
  setInvestmentStyle: (style: 'conservative' | 'balanced' | 'aggressive' | null) => void;
  setProfitPercentToSell: (value: number) => void;
  setLossPercentToSell: (value: number) => void;
  setOneMinuteIncreasePercent: (value: number | null) => void;
  setOneMinuteIncreaseAction: (action: 'BUY' | 'SELL' | null) => void;
  setOneMinuteDecreasePercent: (value: number | null) => void;
  setOneMinuteDecreaseAction: (action: 'BUY' | 'SELL' | null) => void;
  setDailyIncreasePercent: (value: number | null) => void;
  setDailyIncreaseAction: (action: 'BUY' | 'SELL' | null) => void;
  setDailyDecreasePercent: (value: number | null) => void;
  setDailyDecreaseAction: (action: 'BUY' | 'SELL' | null) => void;
  setShortTermMaPeriod: (period: number | null) => void;
  setLongTermMaPeriod: (period: number | null) => void;
  setEntryMethod: (method: 'ONCE' | 'DIVIDE' | null) => void;
  setEntryInvestmentMethod: (method: 'FIXED_AMOUNT' | 'FIXED_PERCENTAGE' | null) => void;
  setEntryFixedAmount: (amount: number | null) => void;
  setEntryFixedPercentage: (percentage: number | null) => void;
  setExitMethod: (method: 'ONCE' | 'DIVIDE' | null) => void;
  setExitInvestmentMethod: (method: 'FIXED_AMOUNT' | 'FIXED_PERCENTAGE' | null) => void;
  setExitFixedAmount: (amount: number | null) => void;
  setExitFixedPercentage: (percentage: number | null) => void;
  setIsFee: (isFee: boolean) => void;
  resetState: () => void;
}

export const useAlgorithmLabStore = create<AlgorithmLabState>((set) => ({
  algorithmName: '',
  investmentStyle: null,
  profitPercentToSell: 15,
  lossPercentToSell: 15,
  oneMinuteIncreasePercent: null,
  oneMinuteIncreaseAction: null,
  oneMinuteDecreasePercent: null,
  oneMinuteDecreaseAction: null,
  dailyIncreasePercent: null,
  dailyIncreaseAction: null,
  dailyDecreasePercent: null,
  dailyDecreaseAction: null,
  shortTermMaPeriod: null,
  longTermMaPeriod: null,
  entryMethod: null,
  entryInvestmentMethod: null,
  entryFixedAmount: null,
  entryFixedPercentage: null,
  exitMethod: null,
  exitInvestmentMethod: null,
  exitFixedAmount: null,
  exitFixedPercentage: null,
  isFee: false,

  setAlgorithmName: (name) => set({ algorithmName: name }),
  setInvestmentStyle: (style) => {
    switch (style) {
      case 'conservative':
        set({
          investmentStyle: style,
          profitPercentToSell: 4,
          lossPercentToSell: 1.5,
        });
        break;
      case 'balanced':
        set({
          investmentStyle: style,
          profitPercentToSell: 10,
          lossPercentToSell: 4,
        });
        break;
      case 'aggressive':
        set({
          investmentStyle: style,
          profitPercentToSell: 20,
          lossPercentToSell: 8.5,
        });
        break;
      default:
        set({ investmentStyle: null });
        break;
    }
  },
  setProfitPercentToSell: (value) =>
    set({ profitPercentToSell: Math.min(Math.max(value, 0.1), 30) }),
  setLossPercentToSell: (value) => set({ lossPercentToSell: Math.min(Math.max(value, 0.1), 30) }),
  setOneMinuteIncreasePercent: (value) =>
    set({ oneMinuteIncreasePercent: value ? Math.min(Math.max(value, 0.1), 30) : null }),
  setOneMinuteIncreaseAction: (action) => set({ oneMinuteIncreaseAction: action }),
  setOneMinuteDecreasePercent: (value) =>
    set({ oneMinuteDecreasePercent: value ? Math.min(Math.max(value, 0.1), 30) : null }),
  setOneMinuteDecreaseAction: (action) => set({ oneMinuteDecreaseAction: action }),
  setDailyIncreasePercent: (value) =>
    set({ dailyIncreasePercent: value ? Math.min(Math.max(value, 0.1), 30) : null }),
  setDailyIncreaseAction: (action) => set({ dailyIncreaseAction: action }),
  setDailyDecreasePercent: (value) =>
    set({ dailyDecreasePercent: value ? Math.min(Math.max(value, 0.1), 30) : null }),
  setDailyDecreaseAction: (action) => set({ dailyDecreaseAction: action }),
  setShortTermMaPeriod: (period) => set({ shortTermMaPeriod: period }),
  setLongTermMaPeriod: (period) => set({ longTermMaPeriod: period }),
  setEntryMethod: (method) => set({ entryMethod: method }),
  setEntryInvestmentMethod: (method) => set({ entryInvestmentMethod: method }),
  setEntryFixedAmount: (amount) => set({ entryFixedAmount: amount }),
  setEntryFixedPercentage: (percentage) => set({ entryFixedPercentage: percentage }),
  setExitMethod: (method) => set({ exitMethod: method }),
  setExitInvestmentMethod: (method) => set({ exitInvestmentMethod: method }),
  setExitFixedAmount: (amount) => set({ exitFixedAmount: amount }),
  setExitFixedPercentage: (percentage) => set({ exitFixedPercentage: percentage }),
  setIsFee: (isFee) => set({ isFee: isFee }),
  resetState: () =>
    set({
      algorithmName: '',
      investmentStyle: null,
      profitPercentToSell: 15,
      lossPercentToSell: 15,
      oneMinuteIncreasePercent: null,
      oneMinuteIncreaseAction: null,
      oneMinuteDecreasePercent: null,
      oneMinuteDecreaseAction: null,
      dailyIncreasePercent: null,
      dailyIncreaseAction: null,
      dailyDecreasePercent: null,
      dailyDecreaseAction: null,
      shortTermMaPeriod: null,
      longTermMaPeriod: null,
      entryMethod: null,
      entryInvestmentMethod: null,
      entryFixedAmount: null,
      entryFixedPercentage: null,
      exitMethod: null,
      exitInvestmentMethod: null,
      exitFixedAmount: null,
      exitFixedPercentage: null,
      isFee: false,
    }),
}));

// URL 변경 감지 및 상태 초기화를 위한 훅
export const useResetAlgorithmLabStore = () => {
  const location = useLocation();
  const resetState = useAlgorithmLabStore((state) => state.resetState);
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    // 알고리즘 랩으로 들어오거나 나갈 때 초기화
    if (
      // 알고리즘 랩에서 다른 페이지로 나갈 때
      (prevPath.current.includes('algorithm-lab') &&
        (!location.pathname.includes('algorithm-lab') ||
          location.pathname === '/member/algorithm')) ||
      // 다른 페이지에서 알고리즘 랩으로 들어올 때
      (location.pathname === '/algorithm-lab' && !prevPath.current.includes('algorithm-lab')) ||
      // 알고리즘 랩 내에서 메인으로 돌아올 때
      (location.pathname === '/algorithm-lab' && prevPath.current.includes('algorithm-lab/'))
    ) {
      resetState();
    }
    prevPath.current = location.pathname;
  }, [location.pathname, resetState]);
};
