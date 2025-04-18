import { useState } from 'react';
import { toast } from 'react-toastify';

import { useDeleteUserSimulated } from '@/api/stock.api';
import { UserSimulatedData } from '@/api/types/stock';
import { OrderStatusEditor } from '@/components/mock-investment/order-status/order-status-editor';
import { Button } from '@/components/ui/button';
import { queryClient } from '@/lib/queryClient';
import { formatKoreanMoney } from '@/utils/numberFormatter';

interface OrderStatusWaitListProps {
  UserSimulatedData: UserSimulatedData; // test 객체를 prop으로 받기
  closePrice: number; // 종가
  realTime?: number; // 실시간 값
  tickSize: number; // 호가 단위
}

export const OrderStatusWaitList = ({
  UserSimulatedData,
  closePrice,
  realTime,
  tickSize,
}: OrderStatusWaitListProps) => {
  const h3Style = 'text-[14px] font-medium text-white';
  // 주문 취소
  const deleteSimulatedMutation = useDeleteUserSimulated();
  const handleDeleteSimulatedMutation = (orderId: number) => {
    deleteSimulatedMutation.mutate(orderId, {
      onSuccess: (data) => {
        // 성공 시 처리
        toast.success('주문이 취소되었습니다.');
        // 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: ['userSimulated'] });
        queryClient.invalidateQueries({ queryKey: ['userAssetData'] });
      },
      onError: (error) => {
        // 에러 시 처리
        toast.error('주문 취소 실패');
      },
      onSettled: () => {
        // 성공이든 실패든 완료 시 항상 실행
        console.log('주문 취소 요청 완료');
      },
    });
  };

  // 클릭시 반응형 추가
  const [isActive, setIsActive] = useState<boolean>(false);
  const [editor, setEditor] = useState<boolean>(true);
  const isActiveHandler = () => {
    setIsActive(!isActive);
  };
  return (
    <>
      {editor ? (
        <div
          onClick={() => isActiveHandler()}
          className={`mb-3 mt-[12px] flex flex-col gap-4  rounded-xl p-3 ${UserSimulatedData.tradeType === 0 ? 'bg-btn-red-color bg-opacity-20' : 'bg-btn-blue-color bg-opacity-20'}`}
        >
          <div className={`flex justify-between`}>
            <div className="flex items-center gap-3">
              <h3 className={h3Style}>{UserSimulatedData.companyName}</h3>
              <p className="text-[14px] text-border-color">
                {formatKoreanMoney(UserSimulatedData.price)}원 <span>|</span>{' '}
                {UserSimulatedData.quantity}주
              </p>
            </div>
            <div className="flex gap-2">
              <div>
                {UserSimulatedData.tradeType === 1 ? (
                  <p className="text-[14px] text-btn-blue-color">판매</p>
                ) : (
                  <p className="text-[14px] text-btn-red-color">구매</p>
                )}
              </div>
            </div>
          </div>
          {isActive ? (
            <div className="flex animate-fadeIn gap-2">
              <Button
                variant="green"
                className="w-full"
                size="sm"
                onClick={() => setEditor(!editor)}
              >
                <p>수정하기</p>
              </Button>
              <Button
                variant="red"
                className="w-full"
                size="sm"
                onClick={() => handleDeleteSimulatedMutation(UserSimulatedData.orderId)}
              >
                <p>삭제하기</p>
              </Button>
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <div>
          <OrderStatusEditor
            closePrice={closePrice}
            realTime={realTime}
            tickSize={tickSize}
            userAssetData={UserSimulatedData.quantity}
            tradeType={UserSimulatedData.tradeType}
            price={UserSimulatedData.price}
            setEditor={setEditor}
            editor={editor}
            orderId={UserSimulatedData.orderId}
            memberId={UserSimulatedData.memberId}
            companyId={UserSimulatedData.companyId}
          />
        </div>
      )}
    </>
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

// "orderId": 6,
// "memberId": 2,
// "companyId": 1,
// "companyName": "SK하이닉스",
// "tradeType": 0,
// "quantity": 1,
// "price": 210000,
// "tradingTime": "2025-03-27T10:33:44.874409",
// "auto": false,
// "confirm": false
