import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { formatKoreanMoney } from '@/utils/numberFormatter';

export interface TutorialOrderStatusBuyProps {
  onBuy: (price: number, quantity: number) => void;
  companyId: number;
  latestPrice: number;
  isActive: boolean;
  availableOrderAsset?: number; // 구매 가능한 자금 (옵션)
  ownedStockCount?: number; // 보유 주식 수량 (옵션)
}

export const TutorialOrderStatusBuy = ({
  onBuy,
  latestPrice,
  isActive: isSessionActive,
  availableOrderAsset = 0, // 기본값 0
  ownedStockCount = 0, // 기본값 0
}: TutorialOrderStatusBuyProps) => {
  // 폰트 동일 스타일링 함수
  const h3Style = 'text-[16px] font-bold text-white';
  const [isActive, setIsActive] = useState<string>('지정가');

  // 구매가격
  const [buyCost, setBuyCost] = useState<number>(0);

  // 세션 활성 상태 및 최신 가격에 따른 buyCost 업데이트
  useEffect(() => {
    if (isSessionActive && latestPrice > 0) {
      setBuyCost(latestPrice);
    } else if (!isSessionActive) {
      setBuyCost(0); // 턴 시작 전에는 빈칸(0)으로 설정
    }
  }, [latestPrice, isSessionActive]);

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

  // 최대 구매 가능한 수량 계산
  const maxPurchasableStocks = () => {
    if (buyCost <= 0) return 0;
    return Math.floor(availableOrderAsset / buyCost);
  };

  const isActiveHandler = (active: string) => {
    setIsActive(active);
  };

  // 구매 처리
  const handleBuyStock = () => {
    if (!isSessionActive || stockCount <= 0 || buyCost <= 0) return;

    // 구매 가능 금액 체크
    if (totalPrice() > availableOrderAsset) {
      alert(`구매 가능 금액(${formatKoreanMoney(availableOrderAsset)}원)을 초과했습니다.`);
      return;
    }

    onBuy(buyCost, stockCount);
    setStockCount(0); // 구매 후 수량 초기화
  };

  return (
    <div className="h-full animate-fadeIn">
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
                <NumberInput
                  value={buyCost}
                  setValue={setBuyCost}
                  placeholder={isSessionActive ? '시장가 원' : '턴 시작 후 자동 설정됩니다'}
                  formatAsCurrency={true}
                />
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
          {/* 구매 가능 수량 표시 */}
          <div className="flex items-center justify-between">
            <div className="min-w-[74px]">
              <h3 className="text-[14px] text-border-color">구매 가능 수량</h3>
            </div>
            <div className="flex w-full max-w-[60%] flex-col">
              <p className="text-right text-[14px] text-border-color">{maxPurchasableStocks()}주</p>
            </div>
          </div>
          {/* 보유 수량 표시 */}
          <div className="flex items-center justify-between">
            <div className="min-w-[74px]">
              <h3 className="text-[14px] text-border-color">보유 수량</h3>
            </div>
            <div className="flex w-full max-w-[80%] flex-col">
              <p className="text-right text-[14px] text-border-color">{ownedStockCount}주</p>
            </div>
          </div>
          <hr className="border border-border-color border-opacity-20" />
        </div>
        <div className="mt-[20px] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className={h3Style}>구매가능 금액</h3>
            <h3 className={h3Style}>
              {isSessionActive ? formatKoreanMoney(availableOrderAsset) : '-'} 원
            </h3>
          </div>
          <div className="flex items-center justify-between">
            <h3 className={h3Style}>총 주문 금액</h3>
            <h3 className={h3Style}>
              {isSessionActive ? formatKoreanMoney(totalPrice()) : '-'} 원
            </h3>
          </div>
        </div>
        <div className="mt-[25px] flex flex-col items-center gap-2">
          <Button
            variant="red"
            className="w-full"
            size="lg"
            onClick={handleBuyStock}
            disabled={!isSessionActive || stockCount <= 0 || totalPrice() > availableOrderAsset}
          >
            <p className=" text-[18px] font-medium text-white">구매하기</p>
          </Button>
        </div>
      </div>
    </div>
  );
};
