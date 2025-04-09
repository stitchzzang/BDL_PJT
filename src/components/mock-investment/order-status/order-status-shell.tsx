import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  usePostStockLimitOrder,
  usePostStockMarketOrder,
  useUserStockAccountData,
} from '@/api/stock.api';
import { LimitOrderData, MarketOrderData } from '@/api/types/stock';
import { LoadingAnimation } from '@/components/common/loading-animation';
import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { NumberPriceInput } from '@/components/ui/number-price-input';
import { queryClient } from '@/lib/queryClient';
import { formatKoreanMoney } from '@/utils/numberFormatter';
interface OrderStatusShellProps {
  closePrice: number; // 종가
  realTime?: number; // 실시간 값
  tickSize: number; // 호가 단위
  memberId: number | null;
  companyId: number | null;
}

export const OrderStatusShell = ({
  closePrice,
  realTime,
  tickSize,
  memberId,
  companyId,
}: OrderStatusShellProps) => {
  const h3Style = 'text-[14px] font-bold text-white';
  const [isActive, setIsActive] = useState<string>('지정가');

  // 사용자 주식 개수
  const { data: stockAccount, isLoading, isError } = useUserStockAccountData(memberId, companyId);

  // 구매가격
  const [shellCost, setShellCost] = useState<number>(0);
  const [printCost, setPrintCost] = useState<string>(shellCost + ' 원');
  useEffect(() => {
    setPrintCost(shellCost + ' 원');
  }, [shellCost]);
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
        if (stockAccount) {
          // alert(checkValue);
          if (checkValue > stockAccount) {
            return;
          } else {
            setValue(value + chagneValue);
            return;
          }
        }
        setValue(0);
        return;
      }
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

  useEffect(() => {
    if (stockAccount) {
      if (stockAccount < stockCount) {
        setStockCount(stockAccount);
      }
    } else if (stockAccount === 0) {
      setStockCount(0);
    }
  }, [stockCount]);
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

  // 시장가 판매 api
  const marketOrderMutation = usePostStockMarketOrder();
  const handleMarketOrder = ({ memberId, companyId, tradeType, quantity }: MarketOrderData) => {
    if (quantity <= 0) {
      toast.error('수량을 입력하세요');
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
          queryClient.invalidateQueries({ queryKey: ['stockAccount'] });
          setStockCount(0);
          toast.success(`주문이 성공적으로 처리되었습니다.`);
        },
        onError: () => {
          setStockCount(0);
        },
      },
    );
  };

  // 지정가 판매 api
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
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['stockAccount'] });
          setStockCount(0);
          toast.success('주문이 성공적으로 처리되었습니다.');
        },
        onError: () => {
          setStockCount(0);
          toast.success('판매중 오류가 발생했습니다.');
        },
      },
    );
  };
  const isActiveHandler = (active: string) => {
    setIsActive(active);
  };
  // 에러,로딩 처리
  if (isLoading) {
    <>
      <LoadingAnimation />
    </>;
  }
  if (isError) {
    <>
      <p>error</p>
    </>;
  }
  return (
    <div className="animate-fadeIn">
      <div>
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
                    value={0}
                    setValue={setShellCost}
                    placeholder={`${closePrice.toLocaleString()}원`}
                    tickSize={tickSize}
                    roundingMethod="ceil"
                    closePrice={closePrice}
                  />
                </>
              ) : (
                <NumberInput
                  value={0}
                  setValue={setShellCost}
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
              <NumberInput
                value={stockCount}
                setValue={setStockCount}
                placeholder="수량을 입력하세요."
              />
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
        </div>
        <div className=" flex flex-col gap-4 rounded-xl border border-border-color border-opacity-20 p-3">
          {isActive === '지정가' ? (
            <div className="flex items-center justify-between">
              <h3 className={h3Style}>총 판매 금액</h3>
              <h3 className={h3Style}>{formatKoreanMoney(totalPrice())} 원</h3>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <h3 className={h3Style}>예상 판매 금액</h3>
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
            <h3 className={h3Style}>보유 주식 개수</h3>
            <h3 className={h3Style}>{stockAccount} 개</h3>
          </div>
        </div>
        <div className="mt-[25px] flex flex-col items-center gap-2">
          {isActive === '지정가' ? (
            <Button
              variant="blue"
              className="w-full"
              size="sm"
              disabled={stockAccount === 0 || stockCount === 0}
              onClick={() =>
                handleLimitOrder({
                  memberId: memberId,
                  companyId: companyId,
                  tradeType: 1,
                  quantity: stockCount,
                  price: shellCost,
                })
              }
            >
              <p className="text-[16px] font-medium text-white">판매하기</p>
            </Button>
          ) : (
            <Button
              variant="blue"
              className="w-full"
              size="sm"
              disabled={stockAccount === 0 || stockCount === 0}
              onClick={() =>
                handleMarketOrder({
                  memberId: memberId,
                  companyId: companyId,
                  tradeType: 1,
                  quantity: stockCount,
                })
              }
            >
              <p className="text-[16px] font-medium text-white">판매하기</p>
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
