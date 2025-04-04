import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { formatKoreanMoney } from '@/utils/numberFormatter';

export interface TutorialOrderStatusSellProps {
  onSell: (price: number, quantity: number) => void;
  companyId: number;
  latestPrice: number;
  isActive: boolean;
  ownedStockCount?: number; // 보유 주식 수량 (옵션)
}

export const TutorialOrderStatusSell = ({
  onSell,
  latestPrice,
  isActive: isSessionActive,
  ownedStockCount = 0, // 기본값 0
}: TutorialOrderStatusSellProps) => {
  const h3Style = 'text-[16px] font-bold text-white';
  const [isActive, setIsActive] = useState<string>('지정가');

  // 판매가격
  const [sellPrice, setSellPrice] = useState<number>(0);

  // 세션 활성 상태 및 최신 가격에 따른 sellPrice 업데이트
  useEffect(() => {
    if (isSessionActive && latestPrice > 0) {
      setSellPrice(latestPrice);
    } else if (!isSessionActive) {
      setSellPrice(0); // 턴 시작 전에는 빈칸(0)으로 설정
    }
  }, [latestPrice, isSessionActive]);

  // +,- 기능 (판매가격)
  const priceButtonHandler = (
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

  // ownedStockCount가 변경될 때마다 stockCount가 유효한지 확인
  useEffect(() => {
    if (stockCount > ownedStockCount) {
      setStockCount(Math.min(ownedStockCount, stockCount)); // 보유 수량을 초과하지 않도록 제한
    }
  }, [ownedStockCount, stockCount]);

  // 총 주문 금액
  const totalPrice = () => {
    return sellPrice * stockCount;
  };

  const isActiveHandler = (active: string) => {
    setIsActive(active);
  };

  // 수량 변경 핸들러 - 보유 주식 수량 내로 제한
  const handleStockCountChange = (newCount: number) => {
    if (newCount > ownedStockCount) {
      setStockCount(ownedStockCount);
    } else if (newCount < 0) {
      setStockCount(0);
    } else {
      setStockCount(newCount);
    }
  };

  // NumberInput에 전달할 래퍼 함수
  const handleSetStockCount = (value: React.SetStateAction<number>) => {
    // SetStateAction은 숫자 또는 함수일 수 있음
    const newValue = typeof value === 'function' ? value(stockCount) : value;
    handleStockCountChange(newValue);
  };

  // 전체 수량 설정 - 보유 주식 수량으로 설정
  const setMaxStockCount = () => {
    setStockCount(ownedStockCount);
  };

  // 판매 처리
  const handleSellStock = () => {
    if (!isSessionActive || stockCount <= 0 || sellPrice <= 0) {
      return;
    }

    // 적극적인 보유량 체크
    if (stockCount > ownedStockCount) {
      alert(
        `보유한 주식 수량(${ownedStockCount}주)보다 많은 수량(${stockCount}주)을 판매할 수 없습니다.`,
      );

      // 안전하게 판매 수량 조정 (보유량 이하로)
      setStockCount(Math.max(0, Math.min(ownedStockCount, stockCount)));
      return;
    }

    onSell(sellPrice, stockCount);
    setStockCount(0); // 판매 후 수량 초기화
  };

  return (
    <div className="flex h-full animate-fadeIn flex-col">
      <h3 className="text-[16px] font-bold text-blue-500">판매하기</h3>
      <div className="flex h-full flex-col justify-between">
        <div className="mb-3 flex w-full flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-[74px]">
              <h3 className={h3Style}>주문 유형</h3>
            </div>
            <div className="flex w-full max-w-[80%] flex-col gap-2">
              {/* 지정가 */}
              <div className="flex w-full justify-between gap-3 rounded-xl bg-btn-primary-active-color px-1 py-1">
                <div
                  className={`${
                    isActive === '지정가' ? `bg-btn-primary-inactive-color ${h3Style}` : ''
                  } w-full cursor-pointer rounded-md py-2 text-center text-[16px] text-border-color transition-all duration-300`}
                  onClick={() => isActiveHandler('지정가')}
                >
                  <p>지정가</p>
                </div>
              </div>
            </div>
          </div>

          {/* 판매가격 입력 */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-[74px]" />
            <div className="relative flex w-full max-w-[80%] flex-col gap-2">
              <div className="pointer-events-none">
                <NumberInput
                  value={sellPrice}
                  setValue={setSellPrice}
                  placeholder={isSessionActive ? '시장가 원' : '턴 시작 후 자동 설정됩니다'}
                  formatAsCurrency={true}
                />
              </div>
            </div>
          </div>

          {/* 수량 입력 */}
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-[74px]">
              <h3 className={h3Style}>수량</h3>
            </div>
            <div className="relative flex w-full max-w-[80%] flex-col gap-2">
              <NumberInput value={stockCount} setValue={handleSetStockCount} placeholder="" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-end px-[8px] text-border-color">
                <div className="pointer-events-auto flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-background-color">
                  <button
                    className="text-[22px]"
                    onClick={() => priceButtonHandler('-', stockCount, setStockCount, 1)}
                  >
                    -
                  </button>
                </div>
                <div className="pointer-events-auto flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-background-color">
                  <button
                    className="text-[22px]"
                    onClick={() => {
                      const newCount = stockCount + 1;
                      if (newCount <= ownedStockCount) {
                        priceButtonHandler('+', stockCount, setStockCount, 1);
                      }
                    }}
                  >
                    +
                  </button>
                </div>
                <div className="pointer-events-auto flex min-h-10 items-center justify-center rounded-md px-2 hover:bg-background-color">
                  <button className="text-[14px]" onClick={setMaxStockCount}>
                    전체
                  </button>
                </div>
              </div>
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

        <div className="mt-auto">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className={h3Style}>총 판매 금액</h3>
              <h3 className={h3Style}>
                {isSessionActive ? formatKoreanMoney(totalPrice()) : '-'} 원
              </h3>
            </div>
          </div>
          <div className="mt-3">
            <Button
              variant="blue"
              className="w-full"
              size="lg"
              onClick={handleSellStock}
              disabled={
                !isSessionActive ||
                stockCount <= 0 ||
                stockCount > ownedStockCount ||
                sellPrice <= 0
              }
            >
              <p className="text-[16px] font-medium text-white">판매하기</p>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
