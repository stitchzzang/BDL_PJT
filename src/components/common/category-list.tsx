import { useState } from 'react';

import { type CategoryName, getCategoryIcon, getCategoryNames } from '@/utils/categoryMapper';

// props 선택
export interface CategoryListProps {
  setCategoryId: (category: string) => void;
}

export const CategoryList = ({ setCategoryId: setCategoryId }: CategoryListProps) => {
  const categoryNames = getCategoryNames();
  const [isActive, setIsActive] = useState<CategoryName | ''>('');

  const isActiveHandler = (name: CategoryName, index: number) => {
    if (name === isActive) {
      setIsActive('');
      setCategoryId('0');
    } else {
      setIsActive(name);
      setCategoryId(index.toString());
    }
  };

  return (
    <div>
      <div className="grid max-w-[660px] grid-cols-5 gap-[10px]">
        {categoryNames.map((name, index) => {
          const IconComponent = getCategoryIcon(name);
          return (
            <div
              className={`${isActive === name ? 'bg-btn-blue-color' : 'bg-modal-background-color'} group flex cursor-pointer items-center justify-center gap-2 rounded-xl px-[14px] py-[12px] transition-all duration-200 hover:bg-btn-blue-color`}
              key={index}
              onClick={() => isActiveHandler(name, index)}
            >
              <div className="min-h-[25px] min-w-[25px]">
                <IconComponent />
              </div>
              <p
                className={`${isActive === name ? 'text-white' : 'text-border-color'}  text-[16px] transition-all duration-200 group-hover:text-white`}
              >
                {name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
