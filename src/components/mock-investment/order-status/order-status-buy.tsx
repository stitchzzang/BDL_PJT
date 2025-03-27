import { useEffect, useState } from 'react';

import { usePostStockLimitOrder, usePostStockMarketOrder } from '@/api/stock.api';
import { LimitOrderData, MarketOrderData } from '@/api/types/stock';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { NumberPriceInput } from '@/components/ui/number-price-input';
import { getAdjustToTickSize } from '@/utils/getAdjustToTickSize';
import { formatKoreanMoney } from '@/utils/numberFormatter';

interface OrderStatusBuyProps {
  userAssetData: number | undefined;
  closePrice: number;
  realTime?: number;
  tickSize: number;
}

export const OrderStatusBuy = ({
  userAssetData,
  closePrice,
  realTime,
  tickSize,
}: OrderStatusBuyProps) => {
  // 폰트 동일 스타일링 함수
  const h3Style = 'text-[16px] font-bold text-white';
  const [isActive, setIsActive] = useState<string>('지정가');

  // 유저 현재 자산
  const userAsset = userAssetData;

  // 구매가격
  const [buyCost, setBuyCost] = useState<number>(0);
  const [printCost, setPrintCost] = useState<string>(buyCost + ' 원');
  // 초기값 설정
  useEffect(() => {
    setBuyCost(closePrice);
    setPrintCost(formatKoreanMoney(buyCost) + '원');
  }, []);
  useEffect(() => {
    setPrintCost(buyCost + ' 원');
    if (buyCost > 0) {
      setBuyCost(getAdjustToTickSize(buyCost, tickSize, 'ceil'));
    }
  }, [buyCost]);
  // +,- 기능 (구매가격)
  const CostButtonHandler = (
    check: string,
    value: number,
    setValue: React.Dispatch<React.SetStateAction<number>>,
    chagneValue: number,
  ) => {
    if (check === '+') {
      const checkValue = value + chagneValue;
      if (checkValue < 0) {
        setValue(0);
        return;
      }
      setValue(value + chagneValue);
    } else if (check === '-') {
      const checkValue = value - chagneValue;
      if (checkValue < 0) {
        setValue(0);
        return;
      }
      setValue(value - chagneValue);
    }
  };
  // 수량
  const [stockCount, setStockCount] = useState<number>(0);
  // 총 주문 금액
  const totalPrice = () => {
    const printTotalPrice: number = buyCost * stockCount;
    return printTotalPrice;
  };
  // 예상 총 주문 금액
  const estimatedTotalPrice = (estimatedPrice: number) => {
    if (estimatedPrice) {
      const prtinEstimeatedTotalPrice: number = estimatedPrice * stockCount;
      return prtinEstimeatedTotalPrice;
    }
  };
  // 시장가 구매 api
  const marketOrderMutation = usePostStockMarketOrder();
  const handleMarketOrder = ({ memberId, companyId, tradeType, quantity }: MarketOrderData) => {
    marketOrderMutation.mutate(
      {
        memberId: memberId,
        companyId: companyId,
        tradeType: tradeType, // 0: 매수(구매), 1:매도(판매)
        quantity: quantity,
      },
      {
        onSuccess: () => {
          alert(`주문이 성공적으로 처리되었습니다. 주문 갯수는 ${quantity}입니다.`);
        },
      },
    );
  };
  // 지정가 구매 api
  const limitOrderMutation = usePostStockLimitOrder();
  const handleLimitOrder = ({
    memberId,
    companyId,
    tradeType,
    quantity,
    price,
  }: LimitOrderData) => {
    limitOrderMutation.mutate(
      {
        memberId: memberId,
        companyId: companyId,
        tradeType: tradeType, // 0: 매수(구매), 1:매도(판매)
        quantity: quantity,
        price: price,
      },
      {
        onSuccess: () => {
          alert(
            `주문이 성공적으로 처리되었습니다. 주문 갯수는 ${quantity}입니다. 구매 가격은 ${price}원 입니다`,
          );
        },
      },
    );
  };
  const isActiveHandler = (active: string) => {
    setIsActive(active);
  };
  return (
    <div className="h-full">
      <h3 className={h3Style}>구매하기</h3>
      <div className="flex h-full flex-col justify-between">
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
                  <p>지정가</p>
                </div>
                <div
                  className={`${isActive === '시장가' ? `bg-btn-primary-inactive-color ${h3Style}` : ''} w-full cursor-pointer rounded-md  py-2 text-center text-[16px] text-border-color transition-all duration-300`}
                  onClick={() => isActiveHandler('시장가')}
                >
                  <p>시장가</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            {/* 값 입력 구역 */}
            <div className="min-w-[74px]" />
            <div className="relative flex w-full max-w-[80%] flex-col gap-2">
              {isActive === '지정가' ? (
                <>
                  <NumberPriceInput
                    value={0}
                    setValue={setBuyCost}
                    placeholder={`${closePrice.toLocaleString()}원`}
                    tickSize={tickSize}
                    roundingMethod="ceil"
                    closePrice={closePrice}
                  />
                </>
              ) : (
                <NumberInput
                  value={0}
                  setValue={setBuyCost}
                  placeholder="최대한 빠른 가격"
                  className="pointer-events-none bg-background-color"
                />
              )}
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
                <div className="pointer-events-auto flex min-h-10 min-w-10 items-center justify-center rounded-md  hover:bg-background-color">
                  <button
                    className="text-[22px]"
                    onClick={() => CostButtonHandler('-', stockCount, setStockCount, 1)}
                  >
                    -
                  </button>
                </div>
                <div className="pointer-events-auto flex min-h-10 min-w-10 items-center justify-center rounded-md  hover:bg-background-color">
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
          <hr className="border border-border-color border-opacity-20" />
        </div>
        <div className="mt-[20px] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className={h3Style}>구매가능 금액</h3>
            <h3 className={h3Style}>
              {userAsset ? formatKoreanMoney(userAsset) : '자산 확인 불가'} 원
            </h3>
          </div>
          <div className="flex items-center justify-between">
            {isActive === '지정가' ? (
              <>
                <h3 className={h3Style}>충 주문 금액</h3>
                <h3 className={h3Style}>{formatKoreanMoney(totalPrice())} 원</h3>
              </>
            ) : (
              <>
                <h3 className={h3Style}>예상 충 주문 금액</h3>
                {realTime ? (
                  <h3 className={h3Style}>{estimatedTotalPrice(realTime)} 원</h3>
                ) : (
                  <h3 className={h3Style}>{estimatedTotalPrice(closePrice)} 원</h3>
                )}
              </>
            )}
          </div>
        </div>
        <div className="mt-[25px] flex flex-col items-center gap-2">
          {isActive === '지정가' ? (
            <Button
              variant="red"
              className="w-full"
              size="lg"
              onClick={() =>
                handleLimitOrder({
                  memberId: 2,
                  companyId: 1,
                  tradeType: 0,
                  quantity: stockCount,
                  price: buyCost,
                })
              }
            >
              <p className=" text-[18px] font-medium text-white">구매하기</p>
            </Button>
          ) : (
            <Button
              variant="red"
              className="w-full"
              size="lg"
              onClick={() =>
                handleMarketOrder({
                  memberId: 2,
                  companyId: 1,
                  tradeType: 0,
                  quantity: stockCount,
                })
              }
            >
              <p className=" text-[18px] font-medium text-white">구매하기</p>
            </Button>
          )}
          <p className="text-[14px] font-light text-[#718096]">
            결제 수수료는 결제 금액의 0.004% 입니다.
          </p>
        </div>
      </div>
    </div>
  );
};
