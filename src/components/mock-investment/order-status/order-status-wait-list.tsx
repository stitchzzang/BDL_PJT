import { useState } from 'react';

import { UserSimulatedData } from '@/api/types/stock';
import { Button } from '@/components/ui/button';
import { formatKoreanMoney } from '@/utils/numberFormatter';
interface OrderStatusWaitListProps {
  UserSimulatedData: UserSimulatedData; // test 객체를 prop으로 받기
}

export const OrderStatusWaitList = ({ UserSimulatedData }: OrderStatusWaitListProps) => {
  const h3Style = 'text-[16px] font-medium text-white';
  // 클릭시 반응형 추가
  const [isActive, setIsActive] = useState<boolean>(false);
  const isActiveHandler = () => {
    setIsActive(!isActive);
  };
  return (
    <div
      onClick={() => isActiveHandler()}
      className={`mb-3 mt-[12px] flex flex-col gap-4  rounded-xl p-3 ${UserSimulatedData.tradeType === 0 ? 'bg-btn-red-color bg-opacity-20' : 'bg-btn-blue-color bg-opacity-20'}`}
    >
      <div className={`flex justify-between`}>
        <div className="flex items-center gap-3">
          <h3 className={h3Style}>{UserSimulatedData.companyName}</h3>
          <p className="text-border-color">
            {formatKoreanMoney(UserSimulatedData.price)}원 <span>|</span>{' '}
            {UserSimulatedData.quantity}주
          </p>
        </div>
        <div className="flex gap-2">
          <div>
            {UserSimulatedData.tradeType === 1 ? (
              <p className="text-btn-blue-color">판매</p>
            ) : (
              <p className="text-btn-red-color ">구매</p>
            )}
          </div>
        </div>
      </div>
      {isActive ? (
        <div className="flex gap-2">
          <Button variant="green" className="w-full" size="sm">
            <p>수정하기</p>
          </Button>
          <Button variant="red" className="w-full" size="sm">
            <p>취소하기</p>
          </Button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};
