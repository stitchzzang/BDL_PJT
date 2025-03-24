import React, { useState } from 'react';

import { TutorialOrderStatusBuy } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-buy';
import { TutorialOrderStatusCategory } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-category';
import { TutorialOrderStatusShell } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-shell';
import { TutorialOrderStatusWait } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-wait';

export const TutorialOrderStatus = () => {
  // 허용된 탭 타입을 정의
  type TabType = '구매' | '판매' | '관망';
  // 랜더링 유무
  const [isActiveCategory, setIsActiveCategory] = useState<TabType>('구매');

  // React.ReactElement 타입 사용
  const Components: Record<TabType, React.ReactNode> = {
    구매: <TutorialOrderStatusBuy />,
    판매: <TutorialOrderStatusShell />,
    관망: <TutorialOrderStatusWait />,
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
        <div>{Components[isActiveCategory]}</div>
      </div>
    </div>
  );
};
