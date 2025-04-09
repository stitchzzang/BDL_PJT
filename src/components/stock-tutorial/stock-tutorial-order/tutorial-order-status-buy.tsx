import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';
import { Skeleton } from '@/components/ui/skeleton';
import { formatKoreanMoney } from '@/utils/numberFormatter';

export interface TutorialOrderStatusBuyProps {
  onBuy: (price: number, quantity: number) => void;
  companyId: number;
  latestPrice: number;
  isActive: boolean;
  availableOrderAsset?: number; // 구매 가능한 자금 (옵션)
  ownedStockCount?: number; // 보유 주식 수량 (옵션)
  isLoading?: boolean; // 로딩 상태 추가
  isPending?: boolean; // isPending 추가
}

export const TutorialOrderStatusBuy = ({
  onBuy,
  companyId,
  latestPrice,
  isActive: isSessionActive,
  availableOrderAsset = 10000000, // 기본값 1천만원
  ownedStockCount = 0,
  isLoading = false,
  isPending = false,
}: TutorialOrderStatusBuyProps) => {
  // 폰트 동일 스타일링 함수
  const h3Style = 'text-[16px] font-bold text-white';

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

  // 최대 수량 초과 여부 확인
  const isExceedingMaxStocks = stockCount > maxPurchasableStocks();

  // 퍼센트 기준 수량 설정
  const setPercentageStockCount = (percentage: number) => {
    const maxCount = maxPurchasableStocks();
    setStockCount(Math.floor((maxCount * percentage) / 100));
  };

  // 전체 수량 설정 - 최대 구매 가능 수량으로 설정
  const setMaxStockCount = () => {
    setStockCount(maxPurchasableStocks());
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

  if (isLoading) {
    return (
      <div className="flex h-full animate-fadeIn flex-col">
        <div className="flex h-full flex-col justify-between">
          <div className="mb-3 flex w-full flex-col gap-3">
            <Skeleton
              className="h-[48px] w-full rounded-lg"
              style={{ backgroundColor: '#0D192B' }}
            />
            <Skeleton
              className="h-[48px] w-full rounded-lg"
              style={{ backgroundColor: '#0D192B' }}
            />
            <div className="flex items-center justify-between gap-2">
              <Skeleton
                className="h-[36px] w-[60px] rounded-md"
                style={{ backgroundColor: '#0D192B' }}
              />
              <Skeleton
                className="h-[36px] w-[60px] rounded-md"
                style={{ backgroundColor: '#0D192B' }}
              />
              <Skeleton
                className="h-[36px] w-[60px] rounded-md"
                style={{ backgroundColor: '#0D192B' }}
              />
              <Skeleton
                className="h-[36px] w-[60px] rounded-md"
                style={{ backgroundColor: '#0D192B' }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton
                className="h-[20px] w-[100px] rounded-md"
                style={{ backgroundColor: '#0D192B' }}
              />
              <Skeleton
                className="h-[20px] w-[80px] rounded-md"
                style={{ backgroundColor: '#0D192B' }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton
                className="h-[20px] w-[100px] rounded-md"
                style={{ backgroundColor: '#0D192B' }}
              />
              <Skeleton
                className="h-[20px] w-[80px] rounded-md"
                style={{ backgroundColor: '#0D192B' }}
              />
            </div>
            <hr className="border border-border-color border-opacity-20" />
          </div>
          <div className="mt-auto">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Skeleton
                  className="h-[24px] w-[120px] rounded-md"
                  style={{ backgroundColor: '#0D192B' }}
                />
                <Skeleton
                  className="h-[24px] w-[100px] rounded-md"
                  style={{ backgroundColor: '#0D192B' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton
                  className="h-[24px] w-[120px] rounded-md"
                  style={{ backgroundColor: '#0D192B' }}
                />
                <Skeleton
                  className="h-[24px] w-[100px] rounded-md"
                  style={{ backgroundColor: '#0D192B' }}
                />
              </div>
            </div>
            <div className="mt-3">
              <Skeleton
                className="h-[48px] w-full rounded-lg"
                style={{ backgroundColor: '#0D192B' }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full animate-fadeIn flex-col">
      <div className="flex h-full flex-col justify-between">
        <div className="mb-3 flex w-full flex-col gap-3">
          {/* 값 입력 구역 */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex w-full flex-col gap-2">
              <div className="relative">
                <NumberInput
                  value={buyCost}
                  setValue={setBuyCost}
                  placeholder={isSessionActive ? '시장가 원' : '시작 후 자동 설정됩니다'}
                  formatAsCurrency={true}
                  className="text-right text-[18px]"
                  disabled={true}
                />
                <div className="pointer-events-none absolute inset-0 flex items-center px-[20px] text-border-color">
                  <span className="text-[16px] font-bold text-white">현재 주식 가격</span>
                </div>
              </div>
            </div>
          </div>

          {/* 수량 입력 영역 */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <NumberInput
                value={stockCount}
                setValue={setStockCount}
                placeholder="수량"
                className="text-right text-[18px]"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center px-[20px] text-border-color">
                <span className="text-[16px] font-bold text-white">수량</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex h-[48px] w-10 items-center justify-center rounded-xl border border-border-color hover:bg-background-color">
                <button
                  className="text-[22px]"
                  onClick={() => CostButtonHandler('-', stockCount, setStockCount, 1)}
                >
                  -
                </button>
              </div>
              <div className="flex h-[48px] w-10 items-center justify-center rounded-xl border border-border-color hover:bg-background-color">
                <button
                  className="text-[22px]"
                  onClick={() => CostButtonHandler('+', stockCount, setStockCount, 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* 수량 초과 경고 메시지 */}
          {isExceedingMaxStocks && (
            <div className="mt-1 text-center text-[14px] font-medium text-orange-500">
              최대 수량을 초과하였습니다. (최대: {maxPurchasableStocks()}주)
            </div>
          )}

          {/* 퍼센트 선택 버튼 영역 */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => setPercentageStockCount(10)}
              className="flex-1 rounded-md border border-border-color py-1 text-[14px] text-white hover:bg-background-color"
            >
              10%
            </button>
            <button
              onClick={() => setPercentageStockCount(25)}
              className="flex-1 rounded-md border border-border-color py-1 text-[14px] text-white hover:bg-background-color"
            >
              25%
            </button>
            <button
              onClick={() => setPercentageStockCount(50)}
              className="flex-1 rounded-md border border-border-color py-1 text-[14px] text-white hover:bg-background-color"
            >
              50%
            </button>
            <button
              onClick={setMaxStockCount}
              className="flex-1 rounded-md border border-border-color py-1 text-[14px] text-white hover:bg-background-color"
            >
              전체
            </button>
          </div>

          {/* 구매 가능 수량 표시 */}
          <div className="flex items-center justify-between">
            <div className="min-w-[100px]">
              <h3 className="text-[14px] text-border-color">구매 가능 수량</h3>
            </div>
            <div className="flex w-full flex-col">
              <p className="text-right text-[16px] text-border-color">{maxPurchasableStocks()}주</p>
            </div>
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
        <div className="mt-auto">
          <div className="flex flex-col gap-3">
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
          <div className="mt-3">
            <Button
              variant="red"
              className="w-full"
              size="lg"
              onClick={handleBuyStock}
              disabled={
                !isSessionActive ||
                stockCount <= 0 ||
                totalPrice() > availableOrderAsset ||
                isPending
              }
            >
              <p className="text-[16px] font-medium text-white">구매하기</p>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
