import { useEffect, useState } from 'react';

import { useChangeUserSimulated } from '@/api/stock.api';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { NumberPriceInput } from '@/components/ui/number-price-input';
import { formatKoreanMoney } from '@/utils/numberFormatter';
export interface OrderStatusShellProps {
  closePrice: number; // 종가
  realTime?: number; // 실시간 값
  tickSize: number; // 호가 단위
  userAssetData: number; // 주식 갯수
  tradeType: number; // 판매,구매 판단
  price: number;
  setEditor: React.Dispatch<React.SetStateAction<boolean>>;
  editor: boolean;
  orderId: number;
  memberId: number;
  companyId: number;
}

export const OrderStatusEditor = ({
  closePrice,
  realTime,
  tickSize,
  userAssetData,
  tradeType,
  price,
  editor,
  setEditor,
  orderId,
  memberId,
  companyId,
}: OrderStatusShellProps) => {
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
        onError: () => {
          alert('주문 수정에 실패했습니다.');
        },
      },
    );
  };

  const h3Style = 'text-[14px] font-bold text-white';
  const [isActive, setIsActive] = useState<string>('지정가');
  // isActive 핸들러
  const isActiveHandler = (active: string) => {
    setIsActive(active);
  };

  // 수량
  const [stockCount, setStockCount] = useState<number>(0);

  useEffect(() => {
    if (tradeType === 1 && stockCount > userAssetData) {
      setStockCount(userAssetData);
    }
  }, [stockCount, userAssetData, tradeType]);
  // 구매가격
  const [shellCost, setShellCost] = useState<number>(0);
  const [printCost, setPrintCost] = useState<string>(shellCost + ' 원');

  useEffect(() => {
    setPrintCost(shellCost + ' 원');
  }, [shellCost]);

  useEffect(() => {
    if (userAssetData) {
      setStockCount(userAssetData);
    }
    if (price) {
      setShellCost(price);
    }
  }, [userAssetData, price]);

  // 총 판매 금액
  const totalPrice = () => {
    const printTotalPrice: number = shellCost * stockCount;
    return printTotalPrice;
  };
  // 예상 총 판매 금액
  const estimatedTotalPrice = (estimatedPrice: number | undefined) => {
    if (estimatedPrice) {
      const prtinEstimeatedTotalPrice: number = estimatedPrice * stockCount;
      return prtinEstimeatedTotalPrice;
    }
  };

  // +,- 기능 (구매가격)
  const CostButtonHandler = (
    check: string,
    value: number,
    setValue: React.Dispatch<React.SetStateAction<number>>,
    chagneValue: number,
  ) => {
    if (check === '+') {
      const checkValue = value + chagneValue;
      if (checkValue > 0) {
        if (userAssetData && tradeType === 1) {
          // alert(checkValue);
          if (checkValue > userAssetData) {
            return;
          } else {
            setValue(value + chagneValue);
            return;
          }
        }
        setValue(checkValue);
        return;
      }
    } else if (check === '-') {
      const checkValue = value - chagneValue;
      if (checkValue <= 0) {
        return;
      }
      setValue(value - chagneValue);
    }
  };
  return (
    <div className="my-3">
      <div
        className={`rounded-xl  bg-opacity-20 p-2 ${tradeType === 1 ? 'bg-btn-blue-color' : 'bg-btn-red-color'}`}
      >
        <div className="my-3">
          <h3 className="text-[16px] font-bold text-border-color">
            {tradeType === 1 ? '판매' : '구매'} 정정
          </h3>
        </div>
        <div>
          <div className="mb-[25px] flex w-full flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-[74px]">
                <h3 className={h3Style}>주문 유형</h3>
              </div>
              <div className="flex w-full max-w-[80%] flex-col gap-2">
                {/* 지정가 */}
                <div className="flex w-full justify-between gap-3 rounded-xl bg-btn-primary-active-color px-1 py-1">
                  <div
                    className={`${isActive === '지정가' ? `bg-btn-primary-inactive-color ${h3Style}` : ''} w-full cursor-pointer rounded-md  py-2 text-center text-[16px] text-border-color transition-all duration-300`}
                    onClick={() => isActiveHandler('지정가')}
                  >
                    <p className="text-[14px]">지정가</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              {/* 값 입력 구역 */}
              <div className="min-w-[74px]" />
              <div className="relative flex w-full max-w-[80%] flex-col gap-2">
                <NumberPriceInput
                  value={0}
                  setValue={setShellCost}
                  placeholder={`${shellCost.toLocaleString()}원`}
                  tickSize={tickSize}
                  roundingMethod="ceil"
                  closePrice={closePrice}
                />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-[74px]">
                <h3 className={h3Style}>수량</h3>
              </div>
              <div className="relative flex w-full max-w-[80%] flex-col gap-2">
                <NumberInput
                  value={stockCount}
                  setValue={setStockCount}
                  placeholder="수량을 입력하세요."
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-end px-[8px] text-border-color">
                  <div className="pointer-events-auto flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-background-color">
                    <button
                      className="text-[22px]"
                      onClick={() => CostButtonHandler('-', stockCount, setStockCount, 1)}
                    >
                      -
                    </button>
                  </div>
                  <div className="pointer-events-auto flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-background-color">
                    <button
                      className="text-[22px]"
                      onClick={() => CostButtonHandler('+', stockCount, setStockCount, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr className="border border-border-color border-opacity-20" />
          <div className="mt-[20px] flex flex-col gap-4">
            {isActive === '지정가' ? (
              <div className="flex items-center justify-between">
                <h3 className={h3Style}>총 {tradeType === 1 ? '판매' : '구매'} 금액</h3>
                <h3 className={h3Style}>{formatKoreanMoney(totalPrice())} 원</h3>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h3 className={h3Style}>예상 {tradeType === 1 ? '판매' : '구매'} 금액</h3>
                {realTime ? (
                  <h3 className={h3Style}>
                    {formatKoreanMoney(estimatedTotalPrice(realTime) ?? 0)} 원
                  </h3>
                ) : (
                  <h3 className={h3Style}>
                    {formatKoreanMoney(estimatedTotalPrice(closePrice) ?? 0)} 원
                  </h3>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <h3 className={h3Style}>{tradeType === 1 ? '판매' : '구매'} 주식 개수</h3>
              <h3 className={h3Style}>{stockCount} 개</h3>
            </div>
          </div>
          <div className="mt-[25px] flex flex-col items-center gap-2">
            <div className="flex w-full gap-2">
              <Button
                onClick={() => setEditor(!editor)}
                variant="black"
                className="w-full"
                size="default"
              >
                뒤로가기
              </Button>
              <Button
                onClick={() =>
                  handleChangeOrder(memberId, companyId, tradeType, stockCount, shellCost, orderId)
                }
                variant="green"
                className="w-full"
                size="default"
              >
                수정하기
              </Button>
            </div>
            <p className="text-[14px] font-light text-[#718096]">
              결제 수수료는 결제 금액의 0.004% 입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
