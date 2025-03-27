import { useState } from 'react';

import { useUserSimulatedData } from '@/api/stock.api';
import { LoadingAnimation } from '@/components/common/loading-animation';
import { OrderStatusWaitList } from '@/components/mock-investment/order-status/order-status-wait-list';
import { formatKoreanMoney } from '@/utils/numberFormatter';

export const OrderStatusWait = () => {
  const h3Style = 'text-[16px] font-bold text-white';
  // 유저 판매 리스트 가져오기
  const { data: userSimulated, isLoading, isError } = useUserSimulatedData(2);
  // 총 판매 금액 표시
  const [shellCost, setShellCost] = useState<number>(0);

  // 총 판매, 구매 금액 계산
  // 컴포넌트 내부, return문 위에 계산 로직 추가
  const buyTotalPrice =
    userSimulated
      ?.filter((item) => item.tradeType === 0)
      .reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  const sellTotalPrice =
    userSimulated
      ?.filter((item) => item.tradeType === 1)
      .reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  if (isLoading) {
    return <LoadingAnimation />;
  }
  if (isError) {
    return (
      <>
        <p>is Error</p>
      </>
    );
  }
  return (
    <div>
      <h3 className={h3Style}>대기 주문</h3>
      {userSimulated?.map((UserSimulatedData, index) => (
        <OrderStatusWaitList UserSimulatedData={UserSimulatedData} key={index} />
      ))}
      <hr className="mb-[20px] mt-[30px] border border-border-color border-opacity-20" />
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <h3 className={h3Style}>총 구매 주문액</h3>
          <h3 className={h3Style}>{formatKoreanMoney(buyTotalPrice)}원</h3>
        </div>
        <div className="flex justify-between">
          <h3 className={h3Style}>총 구매 주문액</h3>
          <h3 className={h3Style}>{formatKoreanMoney(sellTotalPrice)}원</h3>
        </div>
      </div>
    </div>
  );
};
