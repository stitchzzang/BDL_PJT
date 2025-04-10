import { useEffect, useRef, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { addCommasToThousand } from '@/utils/numberFormatter';

export interface StockTutorialMoneyInfoProps {
  initialAsset: number;
  availableOrderAsset: number;
  currentTotalAsset: number;
  totalReturnRate: number;
  isLoading?: boolean;
  currentTurn?: number;
}

export const StockTutorialMoneyInfo = ({
  initialAsset,
  availableOrderAsset,
  currentTotalAsset,
  totalReturnRate,
  isLoading = false,
  currentTurn = 0,
}: StockTutorialMoneyInfoProps) => {
  // 이전 값 저장용 ref
  const prevValuesRef = useRef({
    initialAsset,
    availableOrderAsset,
    currentTotalAsset,
    totalReturnRate,
  });

  // 깜빡임 효과를 위한 상태
  const [isFlashing, setIsFlashing] = useState(false);

  // 깜빡임 타이머 ref
  const flashingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 지속적인 깜빡임 효과 설정
  useEffect(() => {
    // 2턴 이상이고 수익률이 0이 아닐 때만 깜빡임 효과 적용
    if (currentTurn >= 2 && totalReturnRate !== 0) {
      // 이미 타이머가 있다면 제거
      if (flashingTimerRef.current) {
        clearInterval(flashingTimerRef.current);
      }

      // 1.5초 간격으로 깜빡이는 타이머 설정 (느리게)
      flashingTimerRef.current = setInterval(() => {
        setIsFlashing((prev) => !prev);
      }, 1000);
    } else {
      // 조건에 맞지 않으면 깜빡임 중지 및 타이머 정리
      if (flashingTimerRef.current) {
        clearInterval(flashingTimerRef.current);
        flashingTimerRef.current = null;
      }
      setIsFlashing(false);
    }

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (flashingTimerRef.current) {
        clearInterval(flashingTimerRef.current);
        flashingTimerRef.current = null;
      }
    };
  }, [currentTurn, totalReturnRate]);

  // 값 변경 확인 및 디버깅
  useEffect(() => {
    // 이전 값과 비교하여 어떤 값이 변경되었는지 확인
    const prev = prevValuesRef.current;
    const changed = {
      initialAsset: initialAsset !== prev.initialAsset,
      availableOrderAsset: availableOrderAsset !== prev.availableOrderAsset,
      currentTotalAsset: currentTotalAsset !== prev.currentTotalAsset,
      totalReturnRate: totalReturnRate !== prev.totalReturnRate,
    };

    // 중요한 변경사항만 로그로 출력
    if (changed.totalReturnRate) {
      console.log(
        `[StockTutorialMoneyInfo] 수익률 변경: ${prev.totalReturnRate.toFixed(2)}% -> ${totalReturnRate.toFixed(2)}%`,
      );
    }

    // 유효하지 않은 값 체크 (주요 값만)
    if (typeof availableOrderAsset !== 'number' || isNaN(availableOrderAsset)) {
      console.error('[StockTutorialMoneyInfo] 주문가능금액이 유효하지 않음:', availableOrderAsset);
    }
    if (typeof totalReturnRate !== 'number' || isNaN(totalReturnRate)) {
      console.error('[StockTutorialMoneyInfo] 수익률이 유효하지 않음:', totalReturnRate);
    }

    // 이전 값 업데이트
    prevValuesRef.current = {
      initialAsset,
      availableOrderAsset,
      currentTotalAsset,
      totalReturnRate,
    };
  }, [initialAsset, availableOrderAsset, currentTotalAsset, totalReturnRate]);

  // 값에 따른 배경색 변경
  const profitColor =
    totalReturnRate > 0
      ? 'bg-btn-red-color'
      : totalReturnRate < 0
        ? 'bg-btn-blue-color'
        : 'bg-modal-background-color';

  // 값에 따른 텍스트 색상 변경
  const textProfitColor =
    totalReturnRate > 0 ? 'text-btn-red-color' : totalReturnRate < 0 ? 'text-btn-blue-color' : '';

  // 퍼센트 부호 표시 (소수점 둘째 자리까지만 표시)
  const displayPercentage = `${totalReturnRate > 0 ? '+' : ''}${totalReturnRate.toFixed(2)}%`;

  // 거래 가능 금액 및 현재 자산 표시 (원 단위로 정확하게 표시)
  const formattedAvailableAsset = addCommasToThousand(Math.round(availableOrderAsset));
  const formattedCurrentAsset = addCommasToThousand(Math.round(currentTotalAsset));

  if (isLoading) {
    return (
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-[42px] w-1/4 rounded-xl" style={{ backgroundColor: '#0D192B' }} />
        <Skeleton className="h-[42px] w-1/4 rounded-xl" style={{ backgroundColor: '#0D192B' }} />
        <Skeleton className="h-[42px] w-1/4 rounded-xl" style={{ backgroundColor: '#0D192B' }} />
      </div>
    );
  }

  return (
    <div className="mt-3 flex gap-3">
      <div className="flex gap-2 rounded-xl bg-modal-background-color px-[13px] py-[12px]">
        <p className="text-[14px] text-border-color">주문가능 :</p>
        <span className="text-[14px] font-bold">{formattedAvailableAsset}원</span>
      </div>
      <div className="flex gap-2 rounded-xl bg-modal-background-color px-[13px] py-[12px]">
        <p className="text-[14px] text-border-color">현재자산 :</p>
        <span className="text-[14px] font-bold">{formattedCurrentAsset}원</span>
      </div>
      <div
        className={`flex gap-2 rounded-xl px-[15px] py-[12px] ${profitColor} ${
          totalReturnRate !== 0 ? `bg-opacity-${isFlashing ? '10' : '20'}` : ''
        } transition-all duration-1000`}
      >
        <p className="text-[14px] text-border-color">총 수익률 :</p>
        <span className={`font-bold ${textProfitColor} text-[14px]`}>{displayPercentage}</span>
      </div>
    </div>
  );
};
