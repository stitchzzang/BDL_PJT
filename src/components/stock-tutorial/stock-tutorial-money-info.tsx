import { addCommasToThousand } from '@/utils/numberFormatter';
import {
  calculateTradingAssets,
  updateAssetsByTurn,
  updateAssetsByTurnChange,
} from '@/utils/asset-calculator';

export interface StockTutorialMoneyInfoProps {
  initialAsset: number;
  availableOrderAsset: number;
  currentTotalAsset: number;
  totalReturnRate: number;
}

export const StockTutorialMoneyInfo = ({
  initialAsset,
  availableOrderAsset,
  currentTotalAsset,
  totalReturnRate,
}: StockTutorialMoneyInfoProps) => {
  // 값에 따른 배경색 변경
  const profitColor = totalReturnRate >= 0 ? 'bg-btn-red-color' : 'bg-btn-blue-color';
  // 값에 따른 배경색 변경
  const textProfitColor = totalReturnRate >= 0 ? 'text-btn-red-color' : 'text-btn-blue-color';
  // 퍼센트 부호 표시 (소수점 둘째 자리까지만 표시)
  const displayPercentage = `${totalReturnRate >= 0 ? '+' : ''}${totalReturnRate.toFixed(2)}%`;

  // 거래 가능 금액 및 현재 자산 표시 (원 단위로 정확하게 표시)
  const formattedInitialAsset = addCommasToThousand(Math.round(initialAsset));
  const formattedAvailableAsset = addCommasToThousand(Math.round(availableOrderAsset));
  const formattedCurrentAsset = addCommasToThousand(Math.round(currentTotalAsset));

  return (
    <div className="flex gap-3">
      <div className="flex gap-2 rounded-xl bg-modal-background-color px-[15px] py-[15px]">
        <p className="text-border-color">시드머니 :</p>
        <span className="font-bold">{formattedInitialAsset}원</span>
      </div>
      <div className="flex gap-2 rounded-xl bg-modal-background-color px-[15px] py-[15px]">
        <p className="text-border-color">주문가능 :</p>
        <span className="font-bold">{formattedAvailableAsset}원</span>
      </div>
      <div className="flex gap-2 rounded-xl bg-modal-background-color px-[15px] py-[15px]">
        <p className="text-border-color">현재자산 :</p>
        <span className="font-bold">{formattedCurrentAsset}원</span>
      </div>
      <div className={`flex gap-2 rounded-xl px-[15px] py-[15px] ${profitColor} bg-opacity-20`}>
        <p className="text-border-color">총 수익률 :</p>
        <span className={`font-bold ${textProfitColor}`}>{displayPercentage}</span>
      </div>
    </div>
  );
};
