import React, { useState } from 'react';

// 허용된 탭 타입을 정의
type TabType = '구매' | '판매' | '관망';

interface OrderStatusCategoryProps {
  isActiveCategory: TabType;
  setIsActiveCategory: React.Dispatch<React.SetStateAction<TabType>>;
}

export const TutorialOrderStatusCategory: React.FC<OrderStatusCategoryProps> = ({
  isActiveCategory,
  setIsActiveCategory,
}) => {
  const orderButtonStyle =
    'w-[30%] cursor-pointer text-center rounded-xl py-2  transition-all duration-300';
  const [isActive, setIsActive] = useState<string>(isActiveCategory);
  const changeCategory = (isActiveCategory: TabType) => {
    setIsActiveCategory(isActiveCategory);
  };
  return (
    <div className=" rounded-xl border border-border-color p-2 ">
      <div className="flex w-full justify-between gap-1">
        <div
          className={`${orderButtonStyle} ${isActive === '구매' ? 'bg-btn-red-color bg-opacity-20' : ''} hover:bg-btn-red-color hover:bg-opacity-20`}
          onClick={() => {
            setIsActive('구매');
            changeCategory('구매');
          }}
        >
          <button
            className={`${isActive === '구매' ? 'font-bold text-btn-red-color' : 'font-bold text-border-color'}`}
          >
            구매
          </button>
        </div>
        <div
          className={`${orderButtonStyle} ${isActive === '판매' ? 'bg-btn-blue-color bg-opacity-20' : ''} hover:bg-btn-blue-color hover:bg-opacity-20`}
          onClick={() => {
            setIsActive('판매');
            changeCategory('판매');
          }}
        >
          <button
            className={`${isActive === '판매' ? 'font-bold text-btn-blue-color' : 'font-bold text-border-color'}`}
          >
            판매
          </button>
        </div>
        <div
          className={`${orderButtonStyle} ${isActive === '관망' ? 'bg-btn-green-color bg-opacity-20' : ''} hover:bg-btn-green-color hover:bg-opacity-20`}
          onClick={() => {
            setIsActive('관망');
            changeCategory('관망');
          }}
        >
          <button
            className={`${isActive === '관망' ? 'font-bold text-btn-green-color' : 'font-bold text-border-color'}`}
          >
            관망
          </button>
        </div>
      </div>
    </div>
  );
};
