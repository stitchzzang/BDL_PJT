import { useState } from 'react';

export const OrderStatusCategory = () => {
  const orderButtonStyle =
    'w-[30%] cursor-pointer text-center rounded-md py-[10px]  transition-all duration-300';
  const [isActive, setIsActive] = useState<string>('구매');
  return (
    <div className="rounded-md border border-border-color p-3">
      <div className="flex w-full justify-between gap-1">
        <div
          className={`${orderButtonStyle} ${isActive === '구매' ? 'bg-btn-red-color bg-opacity-20' : ''} hover:bg-btn-red-color hover:bg-opacity-20`}
          onClick={() => setIsActive('구매')}
        >
          <button
            className={`${isActive === '구매' ? 'font-bold text-btn-red-color' : 'font-bold text-border-color'}`}
          >
            구매
          </button>
        </div>
        <div
          className={`${orderButtonStyle} ${isActive === '판매' ? 'bg-btn-blue-color bg-opacity-20' : ''}`}
          onClick={() => setIsActive('판매')}
        >
          <button
            className={`${isActive === '판매' ? 'font-bold text-btn-blue-color' : 'font-bold text-border-color'}`}
          >
            판매
          </button>
        </div>
        <div
          className={`${orderButtonStyle} ${isActive === '대기' ? 'bg-btn-green-color bg-opacity-20' : ''}`}
          onClick={() => setIsActive('대기')}
        >
          <button
            className={`${isActive === '대기' ? 'font-bold text-btn-green-color' : 'font-bold text-border-color'}`}
          >
            대기
          </button>
        </div>
      </div>
    </div>
  );
};
