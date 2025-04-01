import { useState } from 'react';

import { useUserSimulatedData } from '@/api/stock.api';
import { WaitOrderLoadingAnimation } from '@/components/common/chart-loading-animation';
import { LoadingAnimation } from '@/components/common/loading-animation';
import { OrderStatusWaitList } from '@/components/mock-investment/order-status/order-status-wait-list';
import { formatKoreanMoney } from '@/utils/numberFormatter';

interface OrderStatusWaitProps {
  closePrice: number; // 종가
  realTime?: number; // 실시간 값
  tickSize: number; // 호가 단위
  memberId: number | null;
  companyId: number | null;
}

export const OrderStatusWait = ({
  closePrice,
  realTime,
  tickSize,
  memberId,
  companyId,
}: OrderStatusWaitProps) => {
  const h3Style = 'text-[14px] font-bold text-white';
  // 유저 판매 리스트 가져오기
  const { data: userSimulated, isLoading, isError } = useUserSimulatedData(memberId);
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
      <div className="mb-1">
        <h3 className={h3Style}>대기 주문</h3>
      </div>
      <div>
        {userSimulated?.length === 0 ? (
          <div>
            <WaitOrderLoadingAnimation />
          </div>
        ) : (
          <>
            {userSimulated?.map((UserSimulatedData, index) => (
              <OrderStatusWaitList
                UserSimulatedData={UserSimulatedData}
                closePrice={closePrice}
                realTime={realTime}
                tickSize={tickSize}
                key={index}
              />
            ))}
          </>
        )}
      </div>
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
