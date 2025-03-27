import { useState } from 'react';

import { addCommasToThousand } from '@/utils/numberFormatter';

export const StockTutorialMoneyInfo = () => {
  // test state 사용
  const [profitPercentage, setProfitPercentage] = useState<number>(32);

  // 값에 따른 배경색 변경
  const profitColor = profitPercentage >= 0 ? 'bg-btn-red-color' : 'bg-btn-blue-color';
  // 값에 따른 배경색 변경
  const textProfitColor = profitPercentage >= 0 ? 'text-btn-red-color' : 'text-btn-blue-color';
  // 퍼센트 부호 표시
  const displayPercentage = `${profitPercentage >= 0 ? '+' : ''}${profitPercentage}%`;
  return (
    <div className="flex gap-3">
      <div className="flex gap-2 rounded-xl bg-modal-background-color px-[15px] py-[15px]">
        <p className="text-border-color">시드머니:</p>
        <span className="font-bold">{addCommasToThousand(100000000)}원</span>
      </div>
      <div className="flex gap-2 rounded-xl bg-modal-background-color px-[15px] py-[15px]">
        <p className="text-border-color">주문가능:</p>
        <span className="font-bold">{addCommasToThousand(100000000)}원</span>
      </div>
      <div className="flex gap-2 rounded-xl bg-modal-background-color px-[15px] py-[15px]">
        <p className="text-border-color">현재자산:</p>
        <span className="font-bold">{addCommasToThousand(100000000)}원</span>
      </div>
      <div className={`flex gap-2 rounded-xl px-[15px] py-[15px]  ${profitColor} bg-opacity-20`}>
        <p className="text-border-color">총 수익률:</p>
        <span className={`font-bold ${textProfitColor}`}>{displayPercentage}</span>
      </div>
    </div>
  );
};
