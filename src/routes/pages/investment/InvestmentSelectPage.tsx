import { useState } from 'react';

import NoneLogo from '/none-img/none-logo.png';
import { CategoryList } from '@/components/common/category-list';

export const InvestmentSelectPage = () => {
  const [categoryId, setCategoryId] = useState<string>('0');
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex w-full flex-col items-center justify-center">
          <h1 className="mb-[10px] text-[28px] font-bold">모의 종목선택</h1>
          <div className="flex w-full flex-col items-center justify-center rounded-xl border border-border-color border-opacity-40 p-2 py-4">
            <p className="text-[16px]">모든 종목은 현실과 동일한 정보를 실시간으로 전달합니다.</p>
            <p>
              <span className="text-[16px] font-bold text-btn-blue-color">
                실제와 동일한 환경에서
              </span>{' '}
              주식시장을 경험해보세요.
            </p>
            <p className="text-[16px]">
              먼저 경험하고 싶은{' '}
              <span className="text-[16px] font-bold text-btn-blue-color">카테고리</span>를
              골라볼까요?
            </p>
          </div>
        </div>
        <div>
          <CategoryList setCategoryId={setCategoryId} activeCategoryId={categoryId} />
        </div>
      </div>
      <div className="mt-[50px]">
        <img src={NoneLogo} alt="none-logo" />
      </div>
    </div>
  );
};
