import { useState } from 'react';

import NoneLogo from '/none-img/none-logo.png';
import { CategoryList } from '@/components/common/category-list';

export const StockTutorialSelection = () => {
  const [category, setCategory] = useState<string>('');
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex flex-col items-center justify-center">
          <h1 className="mb-[10px] text-[28px] font-bold">주식 튜토리얼</h1>
          <p className="text-[16px]">주식에 익숙하지 않은 당식을 위하여여</p>
          <span className="text-[16px] font-bold">적응을 도와드릴게요.</span>
          <p className="text-[16px]">
            먼저 경험하고 싶은{' '}
            <span className="text-[16px] font-bold text-btn-blue-color">카테고리</span>를
            골라볼까요?
          </p>
        </div>
        <div>
          {category}
          <CategoryList setCategory={setCategory} />
        </div>
      </div>
      <div className="mt-[50px]">
        <img src={NoneLogo} alt="none-logo" />
      </div>
    </div>
  );
};
