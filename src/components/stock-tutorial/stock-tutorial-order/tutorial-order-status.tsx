import React, { useState } from 'react';

import { TutorialOrderStatusBuy } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-buy';
import { TutorialOrderStatusCategory } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-category';
import { TutorialOrderStatusSell } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-sell';
import { TutorialOrderStatusWait } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-wait';

export interface TutorialOrderStatusProps {
  onTrade: (action: 'buy' | 'sell' | 'wait', price: number, quantity: number) => void;
  isSessionActive: boolean;
  companyId: number;
  latestPrice: number;
}

export const TutorialOrderStatus = ({
  onTrade,
  isSessionActive,
  companyId,
  latestPrice,
}: TutorialOrderStatusProps) => {
  // 허용된 탭 타입을 정의
  type TabType = '구매' | '판매' | '관망';
  // 랜더링 유무
  const [isActiveCategory, setIsActiveCategory] = useState<TabType>('구매');

  // 거래 처리 함수
  const handleTrade = (action: 'buy' | 'sell', price: number, quantity: number) => {
    if (!isSessionActive) return;
    onTrade(action, price, quantity);
  };

  // 관망 처리 함수
  const handleWait = () => {
    if (!isSessionActive) return;
    // 관망은 'wait' 액션으로 처리
    onTrade('wait', 0, 0);
  };

  return (
    <div className="h-full">
      <div className="h-[100%] rounded-2xl bg-modal-background-color p-5">
        <div className="mb-[25px]">
          <TutorialOrderStatusCategory
            isActiveCategory={isActiveCategory}
            setIsActiveCategory={setIsActiveCategory}
          />
        </div>
        <hr className="mb-[25px] border border-border-color border-opacity-20" />
        <div>
          {isActiveCategory === '구매' && (
            <TutorialOrderStatusBuy
              onBuy={(price, quantity) => handleTrade('buy', price, quantity)}
              companyId={companyId}
              latestPrice={latestPrice}
              isActive={isSessionActive}
            />
          )}
          {isActiveCategory === '판매' && (
            <TutorialOrderStatusSell
              onSell={(price, quantity) => handleTrade('sell', price, quantity)}
              companyId={companyId}
              latestPrice={latestPrice}
              isActive={isSessionActive}
            />
          )}
          {isActiveCategory === '관망' && (
            <TutorialOrderStatusWait isActive={isSessionActive} onWait={handleWait} />
          )}
        </div>
      </div>
    </div>
  );
};
