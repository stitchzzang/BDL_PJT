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

  // 최대 수량 초과 여부 확인
  const isExceedingMaxStocks = ownedStockCount > 0 && stockCount > ownedStockCount;

  // 판매 가능 여부 확인
  const canSell = isSessionActive && ownedStockCount > 0;

  // 보유 수량이 0이면 stockCount도 0으로 설정
  useEffect(() => {
    if (ownedStockCount === 0) {
      setStockCount(0);
    }
  }, [ownedStockCount]);

  // 총 주문 금액
  const totalPrice = () => {
    return sellPrice * stockCount;
  };

  // 퍼센트 기준 수량 설정
  const setPercentageStockCount = (percentage: number) => {
    setStockCount(Math.floor((ownedStockCount * percentage) / 100));
  };

  // 수량 변경 핸들러 - 제한 없이 수량 설정
  const handleStockCountChange = (newCount: number) => {
    if (newCount < 0) {
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
    if (!isSessionActive || stockCount <= 0 || sellPrice <= 0 || ownedStockCount <= 0) {
      return;
    }

    // 적극적인 보유량 체크
    if (stockCount > ownedStockCount) {
      alert(
        `보유한 주식 수량(${ownedStockCount}주)보다 많은 수량(${stockCount}주)을 판매할 수 없습니다.`,
      );
      return;
    }

    onSell(sellPrice, stockCount);
    setStockCount(0); // 판매 후 수량 초기화
  };

  return (
    <div className="flex h-full animate-fadeIn flex-col">
      <div className="flex h-full flex-col justify-between">
        <div className="mb-3 flex w-full flex-col gap-3">
          {/* 판매가격 입력 */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex w-full flex-col gap-2">
              <div className="relative">
                <NumberInput
                  value={sellPrice}
                  setValue={setSellPrice}
                  placeholder={isSessionActive ? '시장가 원' : '턴 시작 후 자동 설정됩니다'}
                  formatAsCurrency={true}
                  className="text-right text-[18px]"
                  disabled={!isSessionActive}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center px-[20px] text-border-color">
                  <span className="text-[16px] font-bold text-white">현재 주식 가격</span>
                </div>
              </div>
            </div>
          </div>

          {/* 수량 입력 */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <NumberInput
                value={stockCount}
                setValue={handleSetStockCount}
                placeholder="수량"
                className="text-right text-[18px]"
                disabled={!canSell}
              />
              <div className="pointer-events-none absolute inset-0 flex items-center px-[20px] text-border-color">
                <span className="text-[16px] font-bold text-white">수량</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div
                className={`flex h-[48px] w-10 items-center justify-center rounded-xl border border-border-color ${!canSell ? 'cursor-not-allowed opacity-50' : 'hover:bg-background-color'}`}
              >
                <button
                  className="text-[22px]"
                  onClick={() => priceButtonHandler('-', stockCount, setStockCount, 1)}
                  disabled={!canSell}
                >
                  -
                </button>
              </div>
              <div
                className={`flex h-[48px] w-10 items-center justify-center rounded-xl border border-border-color ${!canSell ? 'cursor-not-allowed opacity-50' : 'hover:bg-background-color'}`}
              >
                <button
                  className="text-[22px]"
                  onClick={() => {
                    priceButtonHandler('+', stockCount, setStockCount, 1);
                  }}
                  disabled={!canSell}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 수량 초과 경고 메시지 */}
          {isExceedingMaxStocks && (
            <div className="mb-1 mt-1 text-center text-[14px] font-medium text-orange-500">
              최대 수량을 초과하였습니다. (최대: {ownedStockCount}주)
            </div>
          )}

          {/* 퍼센트 선택 버튼 영역 */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setPercentageStockCount(10)}
              className={`flex-1 rounded-md border border-border-color py-1 text-[14px] text-white ${!canSell ? 'cursor-not-allowed opacity-50' : 'hover:bg-background-color'}`}
              disabled={!canSell}
            >
              10%
            </button>
            <button
              onClick={() => setPercentageStockCount(20)}
              className={`flex-1 rounded-md border border-border-color py-1 text-[14px] text-white ${!canSell ? 'cursor-not-allowed opacity-50' : 'hover:bg-background-color'}`}
              disabled={!canSell}
            >
              20%
            </button>
            <button
              onClick={() => setPercentageStockCount(50)}
              className={`flex-1 rounded-md border border-border-color py-1 text-[14px] text-white ${!canSell ? 'cursor-not-allowed opacity-50' : 'hover:bg-background-color'}`}
              disabled={!canSell}
            >
              50%
            </button>
            <button
              onClick={setMaxStockCount}
              className={`flex-1 rounded-md border border-border-color py-1 text-[14px] text-white ${!canSell ? 'cursor-not-allowed opacity-50' : 'hover:bg-background-color'}`}
              disabled={!canSell}
            >
              전체
            </button>
          </div>

          {/* 보유 수량 표시 */}
          <div className="flex items-center justify-between">
            <div className="min-w-[100px]">
              <h3 className="text-[14px] text-border-color">보유 수량</h3>
            </div>
            <div className="flex w-full flex-col">
              <p className="text-right text-[16px] text-border-color">{ownedStockCount}주</p>
            </div>
          </div>

          <hr className="border border-border-color border-opacity-20" />
        </div>

        <div className="mt-4">
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
              className={`w-full ${!isSessionActive || ownedStockCount <= 0 ? 'opacity-50' : ''}`}
              size="lg"
              onClick={handleSellStock}
              disabled={
                !isSessionActive ||
                stockCount <= 0 ||
                stockCount > ownedStockCount ||
                sellPrice <= 0 ||
                ownedStockCount <= 0
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
