import { Summary } from '@/api/types/algorithm';

interface AlgorithmSummaryProps {
  summary: Summary;
}

export const AlgorithmSummary = ({ summary }: AlgorithmSummaryProps) => {
  return (
    <div>
      <div>
        <p>수익률 : {summary.rateOfReturn}</p>
        <p>수익률 : {summary.totalTrades}</p>
        <p>수익률 : {summary.startingCapital}</p>
        <p>수익률 : {summary.endingCapital}</p>
        <p>수익률 : {summary.maxDrawdown}</p>
        <p>수익률 : {summary.winRate}</p>
      </div>
    </div>
  );
};

// 백테스트 결과 요약 정보를 제공합니다.

// - **rateOfReturn**: 수익률(%)
// - **totalTrades**: 총 거래 횟수
// - **startingCapital**: 초기 자본금
// - **endingCapital**: 최종 자본금
// - **maxDrawdown**: 최대 낙폭(%)
// - **winRate**: 승률(%)
