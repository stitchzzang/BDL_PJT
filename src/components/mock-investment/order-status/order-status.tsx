import React, { useState } from 'react';

import { useUserAssetData } from '@/api/stock.api';
import { OrderStatusBuy } from '@/components/mock-investment/order-status/order-status-buy';
import { OrderStatusCategory } from '@/components/mock-investment/order-status/order-status-category';
import { OrderStatusShell } from '@/components/mock-investment/order-status/order-status-shell';
import { OrderStatusWait } from '@/components/mock-investment/order-status/order-status-wait';

interface orderStatusProps {
  closePrice: number;
}

export const OrderStatus = ({ closePrice }: orderStatusProps) => {
  // 유저 자산 가져오기
  const { data: userAssetData } = useUserAssetData(2);
  // 허용된 탭 타입을 정의
  type TabType = '구매' | '판매' | '대기';
  // 랜더링 유무
  const [isActiveCategory, setIsActiveCategory] = useState<TabType>('구매');

  // React.ReactElement 타입 사용
  const Components: Record<TabType, React.ReactNode> = {
    구매: <OrderStatusBuy userAssetData={userAssetData} closePrice={closePrice} />,
    판매: <OrderStatusShell />,
    대기: <OrderStatusWait />,
  };
  return (
    <div className="h-full">
      <div className="h-[100%] rounded-2xl bg-modal-background-color p-5">
        <div className="mb-[25px]">
          <OrderStatusCategory
            isActiveCategory={isActiveCategory}
            setIsActiveCategory={setIsActiveCategory}
          />
        </div>
        <hr className="mb-[25px] border border-border-color border-opacity-20" />
        <div>{Components[isActiveCategory]}</div>
      </div>
    </div>
  );
};
