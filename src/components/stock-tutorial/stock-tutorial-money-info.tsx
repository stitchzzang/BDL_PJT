import { useEffect, useRef } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { addCommasToThousand } from '@/utils/numberFormatter';

export interface StockTutorialMoneyInfoProps {
  initialAsset: number;
  availableOrderAsset: number;
  currentTotalAsset: number;
  totalReturnRate: number;
  isLoading?: boolean;
}

export const StockTutorialMoneyInfo = ({
  initialAsset,
  availableOrderAsset,
  currentTotalAsset,
  totalReturnRate,
  isLoading = false,
}: StockTutorialMoneyInfoProps) => {
  // 이전 값 저장용 ref
  const prevValuesRef = useRef({
    initialAsset,
    availableOrderAsset,
    currentTotalAsset,
    totalReturnRate,
  });

  // 렌더링 횟수 카운터
  const renderCountRef = useRef(0);

  // 값 디버깅
  useEffect(() => {
    renderCountRef.current += 1;

    console.log(`[StockTutorialMoneyInfo] 렌더링 #${renderCountRef.current}`);
    console.log('[StockTutorialMoneyInfo] 자산 정보 props:', {
      initialAsset,
      availableOrderAsset,
      currentTotalAsset,
      totalReturnRate,
    });

    // 이전 값과 비교하여 어떤 값이 변경되었는지 확인
    const prev = prevValuesRef.current;
    const changed = {
      initialAsset: initialAsset !== prev.initialAsset,
      availableOrderAsset: availableOrderAsset !== prev.availableOrderAsset,
      currentTotalAsset: currentTotalAsset !== prev.currentTotalAsset,
      totalReturnRate: totalReturnRate !== prev.totalReturnRate,
    };

    if (Object.values(changed).some(Boolean)) {
      console.log(
        '[StockTutorialMoneyInfo] 변경된 값:',
        Object.entries(changed)
          .filter(([_, isChanged]) => isChanged)
          .map(([key]) => key),
      );

      // 자세한 변경 내역 로깅
      if (changed.availableOrderAsset) {
        console.log(
          `availableOrderAsset 변경: ${prev.availableOrderAsset} -> ${availableOrderAsset}`,
        );
      }
      if (changed.currentTotalAsset) {
        console.log(`currentTotalAsset 변경: ${prev.currentTotalAsset} -> ${currentTotalAsset}`);
      }
      if (changed.totalReturnRate) {
        console.log(`totalReturnRate 변경: ${prev.totalReturnRate} -> ${totalReturnRate}`);
      }
    }

    // 유효하지 않은 값이 있는지 확인
    if (typeof availableOrderAsset !== 'number' || isNaN(availableOrderAsset)) {
      console.error(
        '[StockTutorialMoneyInfo] availableOrderAsset이 유효하지 않습니다:',
        availableOrderAsset,
      );
    }
    if (typeof currentTotalAsset !== 'number' || isNaN(currentTotalAsset)) {
      console.error(
        '[StockTutorialMoneyInfo] currentTotalAsset이 유효하지 않습니다:',
        currentTotalAsset,
      );
    }
    if (typeof totalReturnRate !== 'number' || isNaN(totalReturnRate)) {
      console.error(
        '[StockTutorialMoneyInfo] totalReturnRate가 유효하지 않습니다:',
        totalReturnRate,
      );
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

  console.log('[StockTutorialMoneyInfo] 렌더링 값:', {
    formattedAvailableAsset,
    formattedCurrentAsset,
    displayPercentage,
    profitColor,
    textProfitColor,
  });

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
        className={`flex gap-2 rounded-xl px-[15px] py-[12px] ${profitColor} ${totalReturnRate !== 0 ? 'bg-opacity-20' : ''}`}
      >
        <p className="text-[14px] text-border-color">총 수익률 :</p>
        <span className={`font-bold ${textProfitColor} text-[14px]`}>{displayPercentage}</span>
      </div>
    </div>
  );
};
