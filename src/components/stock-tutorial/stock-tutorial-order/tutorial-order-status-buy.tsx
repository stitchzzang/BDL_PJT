import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { formatKoreanMoney } from '@/utils/numberFormatter';

export interface TutorialOrderStatusBuyProps {
  onBuy: (price: number, quantity: number) => void;
  companyId: number;
  latestPrice: number;
  isActive: boolean;
}

export const TutorialOrderStatusBuy = ({
  onBuy,
  companyId,
  latestPrice,
  isActive: isSessionActive,
}: TutorialOrderStatusBuyProps) => {
  // 폰트 동일 스타일링 함수
  const h3Style = 'text-[16px] font-bold text-white';
  const [isActive, setIsActive] = useState<string>('지정가');

  // 구매가격
  const [buyCost, setBuyCost] = useState<number>(latestPrice || 0);

  // 최신 가격으로 buyCost 초기화
  useEffect(() => {
    if (latestPrice && buyCost === 0) {
      setBuyCost(latestPrice);
    }
  }, [latestPrice, buyCost]);

  // +,- 기능 (구매가격)
  const CostButtonHandler = (
    check: string,
    value: number,
    setValue: React.Dispatch<React.SetStateAction<number>>,
    changeValue: number,
  ) => {
    if (check === '+') {
      const checkValue = value + changeValue;
      if (checkValue < 0) {
        setValue(0);
        return;
      }
      setValue(value + changeValue);
    } else if (check === '-') {
      const checkValue = value - changeValue;
      if (checkValue < 0) {
        setValue(0);
        return;
      }
      setValue(value - changeValue);
    }
  };

  // 수량
  const [stockCount, setStockCount] = useState<number>(0);

  // 총 주문 금액
  const totalPrice = () => {
    return buyCost * stockCount;
  };

  const isActiveHandler = (active: string) => {
    setIsActive(active);
  };

  // 구매 처리
  const handleBuyStock = () => {
    if (!isSessionActive || stockCount <= 0 || buyCost <= 0) return;
    onBuy(buyCost, stockCount);
    setStockCount(0); // 구매 후 수량 초기화
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
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            {/* 값 입력 구역 */}
            <div className="min-w-[74px]" />
            <div className="relative flex w-full max-w-[80%] flex-col gap-2">
              <div className="pointer-events-none">
                <NumberInput value={buyCost} setValue={setBuyCost} placeholder="시장가 원" />
              </div>
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
            <h3 className={h3Style}>{formatKoreanMoney(buyCost)} 원</h3>
          </div>
          <div className="flex items-center justify-between">
            <h3 className={h3Style}>총 주문 금액</h3>
            <h3 className={h3Style}>{formatKoreanMoney(totalPrice())} 원</h3>
          </div>
        </div>
        <div className="mt-[25px] flex flex-col items-center gap-2">
          <Button
            variant="red"
            className="w-full"
            size="lg"
            onClick={handleBuyStock}
            disabled={!isSessionActive || stockCount <= 0}
          >
            <p className=" text-[18px] font-medium text-white">구매하기</p>
          </Button>
          <p className="text-[14px] font-light text-[#718096]">
            결제 수수료는 결제 금액의 0.004% 입니다.
          </p>
        </div>
      </div>
    </div>
  );
};
