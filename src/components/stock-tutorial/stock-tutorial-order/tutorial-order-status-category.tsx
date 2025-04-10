import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// 허용된 탭 타입을 정의
type TabType = '구매' | '판매' | '관망';

interface OrderStatusCategoryProps {
  isActiveCategory: TabType;
  setIsActiveCategory: React.Dispatch<React.SetStateAction<TabType>>;
  resetToInitial?: boolean; // 턴이 넘어갈 때 true로 설정하여 기본값(구매)으로 리셋
  isLoading?: boolean; // 로딩 상태 추가
}

export const TutorialOrderStatusCategory: React.FC<OrderStatusCategoryProps> = ({
  isActiveCategory,
  setIsActiveCategory,
  resetToInitial = false,
  isLoading = false, // 기본값 false
}) => {
  const orderButtonStyle =
    'w-[30%] cursor-pointer text-center rounded-xl py-2  transition-all duration-300';
  const [isActive, setIsActive] = useState<string>(isActiveCategory);

  // resetToInitial이 true로 변경될 때 카테고리를 '구매'로 리셋
  useEffect(() => {
    if (resetToInitial && isActiveCategory !== '구매') {
      setIsActive('구매');
      setIsActiveCategory('구매');
    }
  }, [resetToInitial, setIsActiveCategory, isActiveCategory]);

  // isActiveCategory가 외부에서 변경될 때 내부 상태도 동기화
  useEffect(() => {
    setIsActive(isActiveCategory);
  }, [isActiveCategory]);

  const changeCategory = (isActiveCategory: TabType) => {
    setIsActiveCategory(isActiveCategory);
  };

  // 로딩 상태일 때 스켈레톤 UI 렌더링
  if (isLoading) {
    return (
      <Skeleton className="h-[45px] w-full rounded-xl" style={{ backgroundColor: '#0D192B' }} />
    );
  }

  return (
    <div className="rounded-xl border border-border-color border-opacity-20 p-2 text-[14px]">
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
