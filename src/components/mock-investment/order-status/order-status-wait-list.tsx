import { useState } from 'react';

import { useChangeUserSimulated, useDeleteUserSimulated } from '@/api/stock.api';
import { UserSimulatedData } from '@/api/types/stock';
import { Button } from '@/components/ui/button';
import { queryClient } from '@/lib/queryClient';
import { formatKoreanMoney } from '@/utils/numberFormatter';

interface OrderStatusWaitListProps {
  UserSimulatedData: UserSimulatedData; // test 객체를 prop으로 받기
}

export const OrderStatusWaitList = ({ UserSimulatedData }: OrderStatusWaitListProps) => {
  const h3Style = 'text-[16px] font-medium text-white';
  // 주문 취소
  const deleteSimulatedMutation = useDeleteUserSimulated();
  const handleDeleteSimulatedMutation = (orderId: number) => {
    deleteSimulatedMutation.mutate(orderId, {
      onSuccess: (data) => {
        // 성공 시 처리
        alert('주문이 성공적으로 취소되었습니다.');
        // 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: ['userSimulated'] });
      },
      onError: (error) => {
        // 에러 시 처리
        console.error('주문 취소 실패:', error);
        alert('주문 취소에 실패했습니다.');
      },
      onSettled: () => {
        // 성공이든 실패든 완료 시 항상 실행
        console.log('주문 취소 요청 완료');
      },
    });
  };
  // 주문 정정
  const changeSimulatedMutation = useChangeUserSimulated();
  const handleChangeOrder = (
    memberId: number,
    companyId: number,
    tradeType: number,
    quantity: number,
    price: number,
    orderId: number,
  ) => {
    changeSimulatedMutation.mutate(
      {
        memberId,
        companyId,
        tradeType,
        quantity,
        price,
        orderId,
      },
      {
        onSuccess: () => {
          alert('주문이 성공적으로 수정되었습니다.');
        },
        onError: (error) => {
          alert('주문 수정에 실패했습니다.');
        },
      },
    );
  };
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
          <Button
            variant="red"
            className="w-full"
            size="sm"
            onClick={() => handleDeleteSimulatedMutation(UserSimulatedData.orderId)}
          >
            <p>취소하기</p>
          </Button>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};


// onClick={() => handleChangeSimulatedMutation({
//   memberId: user.id,
//   companyId: stock.id,
//   tradeType: 0, // 매수
//   quantity: 10,
//   price: 50000,
//   orderId: order.id
// })}
