import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { NumberInput } from '@/components/ui/number-input';

export const OrderStatusBuy = () => {
  // 폰트 동일 스타일링 함수
  const h3Style = 'text-[18px] font-bold text-white';
  const [isActive, setIsActive] = useState<string>('지정가');

  // 구매가격
  const [buyCost, setBuyCost] = useState<number>(0);
  const [printCost, setPrintCost] = useState<string>(buyCost + ' 원');
  useEffect(() => {
    setPrintCost(buyCost + ' 원');
  }, [buyCost]);
  // +,- 기능 (구매가격)
  const CostButtonHandler = (
    check: string,
    value: number,
    setValue: React.Dispatch<React.SetStateAction<number>>,
  ) => {
    if (check === '+') {
      setValue(value + 100);
    } else if (check === '-') {
      setValue(value - 100);
    }
  };
  // 수량
  const [stockCount, setStockCount] = useState<number>(0);
  // 총 주문 금액
  const totalPrice = () => {
    const printTotalPrice: number = buyCost * stockCount;
    return printTotalPrice;
  };
  const isActiveHandler = (active: string) => {
    setIsActive(active);
  };
  return (
    <div>
      <h3 className={h3Style}>구매하기</h3>
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
                  className={`${isActive === '지정가' ? `bg-btn-primary-inactive-color ${h3Style}` : ''} w-full cursor-pointer rounded-md  py-2 text-center text-[18px] text-border-color transition-all duration-300`}
                  onClick={() => isActiveHandler('지정가')}
                >
                  <p>지정가</p>
                </div>
                <div
                  className={`${isActive === '시장가' ? `bg-btn-primary-inactive-color ${h3Style}` : ''} w-full cursor-pointer rounded-md  py-2 text-center text-[18px] text-border-color transition-all duration-300`}
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
              <NumberInput value={buyCost} setValue={setBuyCost} placeholder="값을 입력하세요." />
              <div className="absolute inset-0 flex items-center justify-end px-[8px] text-border-color">
                <div className="flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-background-color">
                  <button className="text-[22px]">+</button>
                </div>
                <div className="flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-background-color">
                  <button className="text-[22px]">-</button>
                </div>
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
              <div className="absolute inset-0 flex items-center justify-end px-[8px] text-border-color">
                <div className="flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-background-color">
                  <button className="text-[22px]">+</button>
                </div>
                <div className="flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-background-color">
                  <button className="text-[22px]">-</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr className="border border-border-color border-opacity-20" />
        <div className="mt-[20px] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className={h3Style}>구매가능 금액</h3>
            <h3 className={h3Style}>{printCost}</h3>
          </div>
          <div className="flex items-center justify-between">
            <h3 className={h3Style}>충 주문 금액</h3>
            <h3 className={h3Style}>{totalPrice()} 원</h3>
          </div>
        </div>
        <div className="mt-[25px]">
          <Button variant="red" className="w-full" size="lg">
            <p className=" text-[22px] font-medium text-white">구매하기</p>
          </Button>
        </div>
      </div>
    </div>
  );
};
