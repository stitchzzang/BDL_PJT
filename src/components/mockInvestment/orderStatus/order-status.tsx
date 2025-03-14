import React, { useState } from 'react';

import { OrderStatusBuy } from '@/components/mockInvestment/orderStatus/order-status-buy';
import { OrderStatusCategory } from '@/components/mockInvestment/orderStatus/order-status-category';
import { OrderStatusShell } from '@/components/mockInvestment/orderStatus/order-status-shell';

export const OrderStatus = () => {
  // 허용된 탭 타입을 정의
  type TabType = '구매' | '판매' | '대기';
  // 랜더링 유무
  const [isActiveCategory, setIsactiveCategory] = useState<TabType>('구매');

  // React.ReactElement 타입 사용
  const Components: Record<TabType, React.ReactNode> = {
    구매: <OrderStatusBuy />,
    판매: <OrderStatusShell />,
    대기: <OrderStatusBuy />,
  };
  return (
    <div>
      <div className="rounded-md bg-modal-background-color p-5">
        <div className="mb-[25px]">
          <OrderStatusCategory
            isActiveCategory={isActiveCategory}
            setIsactiveCategory={setIsactiveCategory}
          />
        </div>
        <hr className="mb-[25px] border border-border-color border-opacity-20" />
        <div>{Components[isActiveCategory]}</div>
      </div>
    </div>
  );
};
