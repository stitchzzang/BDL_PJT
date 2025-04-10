import React from 'react';

import { Summary } from '@/api/types/algorithm';

interface AlgorithmSummaryProps {
  summary: Summary | null;
}

export const AlgorithmSummary = ({ summary }: AlgorithmSummaryProps) => {
  if (!summary) {
    return (
      <div className="rounded-lg bg-modal-background-color p-6 shadow-lg">
        <div className="flex h-40 items-center justify-center text-text-inactive-color">
          <p className="text-xl">데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  // 성과 상태에 따른 색상 선택
  // 성과 상태에 따른 색상 선택 (음수일 때 파란색, 양수일 때 빨간색)
  const isPositiveReturn = summary.rateOfReturn > 0;
  const isPositiveDrawdown = summary.maxDrawdown > 0;
  const returnColor = isPositiveReturn ? 'text-btn-red-color' : 'text-btn-blue-color';
  const returnBgColor = isPositiveReturn ? 'bg-btn-red-color/10' : 'bg-btn-blue-color/10';
  const drawColorText = 'text-btn-blue-color';
  const drawColorBack = 'bg-btn-blue-color/10';

  // 승률 색상 (70% 이상이면 녹색, 50% 이상이면 노랑, 그 이하면 빨강)
  const getWinRateColor = (rate: number) => {
    if (rate >= 70) return 'text-btn-green-color';
    if (rate >= 50) return 'text-btn-yellow-color';
    return 'text-btn-red-color';
  };

  const winRateColor = getWinRateColor(summary.winRate);

  // 숫자 포맷팅 함수
  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  // 수익률 포맷팅
  const formatReturn = (rate: number) => {
    const sign = rate > 0 ? '+' : '';
    return `${sign}${rate.toFixed(2)}%`;
  };

  return (
    <div className="h-full rounded-lg bg-modal-background-color p-6 shadow-lg">
      <h3 className="mb-4 text-xl font-bold text-text-main-color">백테스트 결과 요약</h3>

      {/* 수익률과 최대 낙폭: 강조 표시된 큰 카드 */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div
          className={`${returnBgColor} flex flex-col items-center justify-center rounded-lg p-4`}
        >
          <p className="mb-1 text-sm text-text-inactive-color">총 수익률</p>
          <p className={`${returnColor} text-2xl font-bold`}>
            {formatReturn(summary.rateOfReturn)}
          </p>
        </div>
        <div
          className={`${drawColorBack} flex flex-col items-center justify-center rounded-lg p-4`}
        >
          <p className="mb-1 text-sm text-text-inactive-color">최대 낙폭</p>
          <p className={`${drawColorText} text-2xl font-bold`}>
            -{Math.abs(summary.maxDrawdown).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* 나머지 정보들: 그리드 레이아웃 */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <div className="border-l-2 border-point-color pl-3">
          <p className="text-sm text-text-inactive-color">초기 자본금</p>
          <p className="text-lg font-medium text-text-main-color">
            {formatNumber(summary.startingCapital)}원
          </p>
        </div>
        <div className="border-l-2 border-point-color pl-3">
          <p className="text-sm text-text-inactive-color">최종 자본금</p>
          <p
            className={`text-lg font-bold ${summary.endingCapital < summary.startingCapital ? 'text-btn-blue-color' : 'text-btn-red-color'}`}
          >
            {formatNumber(summary.endingCapital)}원
          </p>
        </div>
        <div className="border-l-2 border-point-color pl-3">
          <p className="text-sm text-text-inactive-color">총 거래 횟수</p>
          <p className="text-lg font-medium text-text-main-color">{summary.totalTrades}회</p>
        </div>
        <div className="border-l-2 border-point-color pl-3">
          <p className="text-sm text-text-inactive-color">승률</p>
          <p className={`${winRateColor} text-lg font-medium`}>{summary.winRate.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};
