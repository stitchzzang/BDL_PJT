import { useState } from 'react';

import { Input } from '@/components/ui/input';

export const OrderStatusBuy = () => {
  // 폰트 동일 스타일링 함수
  const h3Style = 'text-[18px] font-bold text-white';
  const [isActive, setIsActive] = useState<string>('지정가');

  // 구매가격
  const [buyCost, setBuyCost] = useState<string>('0');
  const isActiveHandler = (active: string) => {
    setIsActive(active);
  };
  return (
    <div>
      <h3 className={h3Style}>구매하기</h3>
      <div>
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-[74px]">
              <h3 className={h3Style}>주문 유형</h3>
            </div>
            <div className="flex w-full max-w-[80%] flex-col gap-2">
              {/* 지정가 */}
              <div className="flex w-full justify-between gap-3 rounded-xl bg-btn-primary-active-color px-[10px] py-[7px]">
                <div
                  className={`${isActive === '지정가' ? `bg-btn-primary-inactive-color ${h3Style}` : ''} w-full cursor-pointer rounded-md  py-[8px] text-center text-[18px] text-border-color transition-all duration-300`}
                  onClick={() => isActiveHandler('지정가')}
                >
                  <p>지정가</p>
                </div>
                <div
                  className={`${isActive === '시장가' ? `bg-btn-primary-inactive-color ${h3Style}` : ''} w-full cursor-pointer rounded-md  py-[8px] text-center text-[18px] text-border-color transition-all duration-300`}
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
            {buyCost}
            <div className="flex w-full max-w-[80%] flex-col gap-2">
              <Input
                type="text"
                placeholder="값을 입력하세요."
                value={buyCost}
                onChange={(e) => {
                  const value = e.target.value;

                  // 숫자만 허용하는 정규식
                  if (/^\d*$/.test(value)) {
                    setBuyCost(value); // 숫자만 상태에 저장
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div>
          <div>
            <h3>수량</h3>
          </div>
          <div>
            <div>
              <input type="text" />
            </div>
          </div>
        </div>
        <hr />
        <div>
          <div>
            <h3>구매가능 금액</h3>
            <h3>41,323,323원</h3>
          </div>
          <div>
            <h3>총 주문 금액</h3>
            <h3>0원</h3>
          </div>
        </div>
        <div>
          <button>구매하기</button>
          <p>결제 수수료는 결제 금액의 0.004% 입니다.</p>
        </div>
      </div>
    </div>
  );
};
