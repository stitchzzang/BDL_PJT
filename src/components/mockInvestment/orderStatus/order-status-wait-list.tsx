import React from 'react';

import { TestItem } from '@/components/mockInvestment/orderStatus/order-status-wait'; // TestItem 타입을 임포트

interface OrderStatusWaitListProps {
  test: TestItem; // test 객체를 prop으로 받기
}

export const OrderStatusWaitList: React.FC<OrderStatusWaitListProps> = ({ test }) => {
  const h3Style = 'text-[18px] font-medium text-white';
  return (
    <div
      className={`mb-3 mt-[12px] flex justify-between rounded-xl p-3 ${test.status === '판매' ? 'bg-btn-blue-color bg-opacity-20' : 'bg-btn-red-color bg-opacity-20'}`}
    >
      <div className="flex items-center gap-3">
        <h3 className={h3Style}>{test.name}</h3>
        <p className="text-border-color">
          {test.price}원 <span>|</span> {test.quantity}주
        </p>
      </div>
      <div>
        {test.status === '판매' ? (
          <p className="text-btn-blue-color">{test.status}</p>
        ) : (
          <p className="text-btn-red-color ">{test.status}</p>
        )}
      </div>
    </div>
  );
};
