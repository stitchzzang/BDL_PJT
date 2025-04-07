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
  availableOrderAsset,
  currentTotalAsset,
  totalReturnRate,
  isLoading = false,
}: StockTutorialMoneyInfoProps) => {
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
  const displayPercentage = `${totalReturnRate > 0 ? '+ ' : ''}${totalReturnRate.toFixed(2)}%`;

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
        className={`flex gap-2 rounded-xl px-[15px] py-[12px] ${profitColor} ${totalReturnRate !== 0 ? 'bg-opacity-20' : ''}`}
      >
        <p className="text-[14px] text-border-color">총 수익률 :</p>
        <span className={`font-bold ${textProfitColor} text-[14px]`}>{displayPercentage}</span>
      </div>
    </div>
  );
};
