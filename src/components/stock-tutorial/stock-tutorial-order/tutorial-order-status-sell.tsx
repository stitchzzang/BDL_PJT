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
  companyId,
  latestPrice,
  isActive: isSessionActive,
  ownedStockCount = 0, // 기본값 0
}: TutorialOrderStatusSellProps) => {
  const h3Style = 'text-[16px] font-bold text-white';
  const [isActive, setIsActive] = useState<string>('지정가');

  // 판매가격
  const [sellPrice, setSellPrice] = useState<number>(latestPrice || 0);

  // 최신 가격으로 sellPrice 초기화
  useEffect(() => {
    if (latestPrice && sellPrice === 0) {
      setSellPrice(latestPrice);
    }
  }, [latestPrice, sellPrice]);

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
    console.log('보유 주식 수량 변경:', ownedStockCount, '현재 설정된 판매 수량:', stockCount);
    if (stockCount > ownedStockCount) {
      console.log('판매 수량이 보유 수량보다 많아 보유 수량으로 조정:', ownedStockCount);
      setStockCount(ownedStockCount);
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
      console.log(`수량 제한: ${newCount} → ${ownedStockCount} (보유 주식 한도)`);
      setStockCount(ownedStockCount);
    } else if (newCount < 0) {
      setStockCount(0);
    } else {
      setStockCount(newCount);
    }
  };

  // 판매 처리
  const handleSellStock = () => {
    if (!isSessionActive || stockCount <= 0 || sellPrice <= 0) {
      console.log('판매 무효:', { isSessionActive, stockCount, sellPrice });
      return;
    }

    // 보유 주식보다 많이 판매하려는 경우 재확인
    if (stockCount > ownedStockCount) {
      console.log(`판매 오류: 요청=${stockCount}주, 보유=${ownedStockCount}주`);
      alert(
        `보유한 주식 수량(${ownedStockCount}주)보다 많은 수량(${stockCount}주)을 판매할 수 없습니다.`,
      );
      setStockCount(ownedStockCount); // 수량 자동 조정
      return;
    }

    console.log(`판매 요청: 가격=${sellPrice}, 수량=${stockCount}, 보유=${ownedStockCount}`);
    onSell(sellPrice, stockCount);
    setStockCount(0); // 판매 후 수량 초기화
  };

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
                <NumberInput value={sellPrice} setValue={setSellPrice} placeholder="시장가원." />
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
                setValue={handleStockCountChange}
                placeholder="수량을 입력하세요."
              />
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
                      } else {
                        console.log(
                          `수량 증가 제한: 보유=${ownedStockCount}주, 현재=${stockCount}주`,
                        );
                      }
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* 보유 주식 수량 표시 */}
          <div className="flex items-center justify-between">
            <div className="min-w-[74px]">
              <h3 className="text-[14px] text-border-color">보유 수량</h3>
            </div>
            <div className="flex w-full max-w-[80%] flex-col">
              <p className="text-right text-[14px] text-border-color">{ownedStockCount}주</p>
            </div>
          </div>
        </div>
        <hr className="border border-border-color border-opacity-20" />
        <div className="mt-[20px] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className={h3Style}>총 주문 금액</h3>
            <h3 className={h3Style}>{formatKoreanMoney(totalPrice())} 원</h3>
          </div>
        </div>
        <div className="mt-[25px] flex flex-col items-center gap-2">
          <Button
            variant="blue"
            className="w-full"
            size="lg"
            onClick={handleSellStock}
            disabled={
              !isSessionActive || stockCount <= 0 || stockCount > ownedStockCount || sellPrice <= 0
            }
          >
            <p className=" text-[18px] font-medium text-white">판매하기</p>
          </Button>
          <p className="text-[14px] font-light text-[#718096]">
            결제 수수료는 결제 금액의 0.004% 입니다.
          </p>
        </div>
      </div>
    </div>
  );
};
