import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { usePostStockLimitOrder, usePostStockMarketOrder } from '@/api/stock.api';
import { LimitOrderData, MarketOrderData } from '@/api/types/stock';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { NumberPriceInput } from '@/components/ui/number-price-input';
import { queryClient } from '@/lib/queryClient';
import { getAdjustToTickSize } from '@/utils/getAdjustToTickSize';
import { formatKoreanMoney } from '@/utils/numberFormatter';

interface OrderStatusBuyProps {
  userAssetData: number | undefined;
  closePrice: number;
  realTime?: number;
  tickSize: number;
  memberId: number | null;
  companyId: number | null;
}

export const OrderStatusBuy = ({
  userAssetData,
  closePrice,
  realTime,
  tickSize,
  memberId,
  companyId,
}: OrderStatusBuyProps) => {
  // 폰트 동일 스타일링 함수
  const h3Style = 'text-[14px] font-bold text-white';
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
  // 수량 버튼 헨들러
  const handlerCostButton = (check: string) => {
    if (buyCost === 0) {
      toast.error('금액을 입력하세요');
      return;
    }

    if (userAsset) {
      let useMoney = 0;

      // 선택한 비율에 따라 사용할 금액 계산
      if (check === '10') {
        useMoney = userAsset * 0.1;
      } else if (check === '30') {
        useMoney = userAsset * 0.3;
      } else if (check === '50') {
        useMoney = userAsset * 0.5;
      } else if (check === '100') {
        useMoney = userAsset;
      }

      // 주식 수량 계산 (금액 ÷ 주식 가격)
      // 정수로 내림 처리 (소수점 이하 주식은 구매 불가)
      const useStockCount = Math.floor(useMoney / buyCost);
      if (useStockCount <= 0) {
        toast.error('현금이 부족합니다.');
        return;
      }

      // useStockCount 값 설정 (상태 업데이트 함수 사용)
      setStockCount(useStockCount);
    }
  };
  // 예상 총 주문 금액
  const estimatedTotalPrice = (estimatedPrice: number | undefined) => {
    if (estimatedPrice) {
      const prtinEstimeatedTotalPrice: number = estimatedPrice * stockCount;
      return prtinEstimeatedTotalPrice;
    }
  };
  // 시장가 구매 api
  const marketOrderMutation = usePostStockMarketOrder();
  const handleMarketOrder = ({ memberId, companyId, tradeType, quantity }: MarketOrderData) => {
    if (stockCount === 0) {
      toast.error('수량을 입력해주세요.');
      return;
    }
    marketOrderMutation.mutate(
      {
        memberId: memberId,
        companyId: companyId,
        tradeType: tradeType, // 0: 매수(구매), 1:매도(판매)
        quantity: quantity,
      },
      {
        onSuccess: () => {
          setBuyCost(0);
          setStockCount(0);
          queryClient.invalidateQueries({ queryKey: ['userAssetData'] });
          toast.success(`주문이 성공적으로 처리되었습니다.`);
        },
        onError: (err) => {
          setBuyCost(0);
          setStockCount(0);
          toast.error(`지정가를 활용하세요.`);
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
    if (price <= 0 || quantity <= 0) {
      toast.error('가격,수량 입력하세요');
      return;
    }
    limitOrderMutation.mutate(
      {
        memberId: memberId,
        companyId: companyId,
        tradeType: tradeType, // 0: 매수(구매), 1:매도(판매)
        quantity: quantity,
        price: price,
      },
      {
        onSuccess: (res) => {
          setStockCount(0);
          queryClient.invalidateQueries({ queryKey: ['userAssetData'] });
          toast.success(`주문이 성공적으로 처리되었습니다.`);
        },
        onError: () => {
          setStockCount(0);
        },
      },
    );
  };
  const isActiveHandler = (active: string) => {
    setIsActive(active);
  };
  return (
    <div className="h-full animate-fadeIn">
      <div className="flex h-full flex-col justify-between">
        <div className="mb-[25px] flex w-full flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-[74px]">
              <h3 className={h3Style}>주문 유형</h3>
            </div>
            <div className="flex w-full max-w-[80%] flex-col gap-2">
              {/* 지정가 */}
              <div className="flex w-full justify-between gap-3 rounded-xl bg-background-color px-1 py-1">
                <div
                  className={`${isActive === '지정가' ? `bg-btn-primary-active-color ${h3Style}` : ''} w-full cursor-pointer rounded-md  py-2 text-center text-[16px] text-border-color transition-all duration-300`}
                  onClick={() => isActiveHandler('지정가')}
                >
                  <p className="text-[14px]">지정가</p>
                </div>
                <div
                  className={`${isActive === '시장가' ? `bg-btn-primary-active-color ${h3Style}` : ''} w-full cursor-pointer rounded-md  py-2 text-center text-[16px] text-border-color transition-all duration-300`}
                  onClick={() => isActiveHandler('시장가')}
                >
                  <p className="text-[14px]">시장가</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <p className="text-[12px] text-btn-yellow-color opacity-80">
              시장가는 거래시간에 가능합니다.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4">
            {/* 값 입력 구역 */}
            <div className="min-w-[74px]" />
            <div className="relative flex w-full max-w-[80%] flex-col gap-2">
              {isActive === '지정가' ? (
                <>
                  <NumberPriceInput
                    value={buyCost}
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
            <div className=" flex w-full max-w-[80%] gap-2">
              <NumberInput value={stockCount} setValue={setStockCount} placeholder="수량 입력" />
              <div className="flex items-center justify-end rounded-xl border border-border-color px-[8px] text-border-color">
                <div
                  className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md hover:bg-background-color"
                  onClick={() => CostButtonHandler('-', stockCount, setStockCount, 1)}
                >
                  <div className="h-5 w-5">
                    <MinusIcon />
                  </div>
                </div>
                <div
                  className="flex min-h-10 min-w-10 cursor-pointer items-center justify-center rounded-md hover:bg-background-color"
                  onClick={() => CostButtonHandler('+', stockCount, setStockCount, 1)}
                >
                  <div className="h-5 w-5">
                    <PlusIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {isActive === '지정가' ? (
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-[74px]" />
              <div className="flex w-full max-w-[80%] justify-end gap-1">
                <div
                  onClick={() => handlerCostButton('10')}
                  className="flex-1 cursor-pointer rounded-md border border-border-color py-1 text-center text-border-color transition-all duration-300 hover:bg-background-color hover:text-white"
                >
                  <p className="text-[13px]">10%</p>
                </div>
                <div
                  onClick={() => handlerCostButton('30')}
                  className="flex-1 cursor-pointer rounded-md border border-border-color py-1 text-center text-border-color transition-all duration-300 hover:bg-background-color hover:text-white"
                >
                  <p className="text-[13px]">30%</p>
                </div>
                <div
                  onClick={() => handlerCostButton('50')}
                  className="flex-1 cursor-pointer rounded-md border border-border-color py-1 text-center text-border-color transition-all duration-300 hover:bg-background-color hover:text-white"
                >
                  <p className="text-[13px]">50%</p>
                </div>
                <div
                  onClick={() => handlerCostButton('100')}
                  className="flex-1 cursor-pointer rounded-md border border-border-color py-1 text-center text-border-color transition-all duration-300 hover:bg-background-color hover:text-white"
                >
                  <p className="text-[13px]">전체</p>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className=" flex flex-col gap-4 rounded-xl border border-border-color border-opacity-20 p-3">
          <div className="flex items-center justify-between">
            <h3 className={h3Style}>구매가능 금액</h3>
            <h3 className={h3Style}>
              {userAsset ? formatKoreanMoney(userAsset) : '자산 확인 불가'} 원
            </h3>
          </div>
          <div className="flex items-center justify-between">
            {isActive === '지정가' ? (
              <>
                <h3 className={h3Style}>총 주문 금액</h3>
                <h3 className={h3Style}>{formatKoreanMoney(totalPrice())} 원</h3>
              </>
            ) : (
              <>
                <h3 className={h3Style}>예상 총 주문 금액</h3>
                {realTime ? (
                  <h3 className={h3Style}>
                    {formatKoreanMoney(estimatedTotalPrice(realTime) ?? 0)} 원
                  </h3>
                ) : (
                  <h3 className={h3Style}>
                    {formatKoreanMoney(estimatedTotalPrice(closePrice) ?? 0)} 원
                  </h3>
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
              size="sm"
              disabled={stockCount === 0 || buyCost === 0}
              onClick={() =>
                handleLimitOrder({
                  memberId: memberId,
                  companyId: companyId,
                  tradeType: 0,
                  quantity: stockCount,
                  price: buyCost,
                })
              }
            >
              <p className=" text-[14px] font-medium text-white">구매하기</p>
            </Button>
          ) : (
            <Button
              variant="red"
              className="w-full"
              size="sm"
              disabled={stockCount === 0 || buyCost === 0}
              onClick={() =>
                handleMarketOrder({
                  memberId: memberId,
                  companyId: companyId,
                  tradeType: 0,
                  quantity: stockCount,
                })
              }
            >
              <p className=" text-[14px] font-medium text-white">구매하기</p>
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
