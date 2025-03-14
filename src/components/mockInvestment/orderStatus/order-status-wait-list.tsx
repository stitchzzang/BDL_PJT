import React from 'react';

import { TestItem } from '@/components/mockInvestment/orderStatus/order-status-wait'; // TestItem 타입을 임포트

interface OrderStatusWaitListProps {
  test: TestItem; // test 객체를 prop으로 받기
}

export const OrderStatusWaitList: React.FC<OrderStatusWaitListProps> = ({ test }) => {
  return (
    <div>
      <div>
        <h3>{test.name}</h3>
        <p>
          {test.price} | {test.quantity}
        </p>
      </div>
      <div>
        <p>{test.status}</p>
      </div>
    </div>
  );
};
