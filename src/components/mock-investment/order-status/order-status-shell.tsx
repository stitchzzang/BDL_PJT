import { useEffect, useState } from 'react';

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
  const { data: userAssetData, isLoading, isError } = useUserStockAccountData(memberId, companyId);

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
        if (userAssetData) {
          // alert(checkValue);
          if (checkValue > userAssetData) {
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
    if (userAssetData) {
      if (userAssetData < stockCount) {
        setStockCount(userAssetData);
      }
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
          alert(`주문이 성공적으로 처리되었습니다. 판매매 갯수는 ${quantity}입니다.`);
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
      alert('가격,수량 입력하세요');
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
    <div>
      <h3 className={h3Style}>판매하기</h3>
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
                <div
                  className={`${isActive === '시장가' ? `bg-btn-primary-inactive-color ${h3Style}` : ''} w-full cursor-pointer rounded-md  py-2 text-center text-[16px] text-border-color transition-all duration-300`}
                  onClick={() => isActiveHandler('시장가')}
                >
                  <p className="text-[14px]">시장가</p>
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
            <h3 className={h3Style}>{userAssetData} 개</h3>
          </div>
        </div>
        <div className="mt-[25px] flex flex-col items-center gap-2">
          {isActive === '지정가' ? (
            <Button
              variant="blue"
              className="w-full"
              size="lg"
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
              <p className=" text-[16px] font-medium text-white">판매하기</p>
            </Button>
          ) : (
            <Button
              variant="blue"
              className="w-full"
              size="lg"
              onClick={() =>
                handleMarketOrder({
                  memberId: memberId,
                  companyId: companyId,
                  tradeType: 1,
                  quantity: stockCount,
                })
              }
            >
              <p className=" text-[16px] font-medium text-white">판매하기</p>
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
