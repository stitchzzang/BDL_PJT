import { type CategoryName, getCategoryIcon, getCategoryNames } from '@/utils/categoryMapper';

// props 선택
export interface CategoryListProps {
  setCategoryId: (category: string) => void;
  activeCategoryId: string;
}

export const CategoryList = ({ setCategoryId, activeCategoryId }: CategoryListProps) => {
  const categoryNames = getCategoryNames();

  const handleCategoryClick = (name: CategoryName, index: number) => {
    // 인덱스 + 1이 카테고리 ID가 됨 (전체 제외)
    setCategoryId(index.toString());
  };

  const AllCompaniesIcon = getCategoryIcon('전체');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <button
          className={`group flex w-full items-center justify-center gap-2 rounded-xl ${
            activeCategoryId === '0' ? 'bg-btn-blue-color' : 'bg-modal-background-color'
          } px-[14px] py-[12px] transition-all duration-200 hover:bg-btn-blue-color`}
          onClick={() => setCategoryId('0')}
        >
          <div className="min-h-[25px] min-w-[25px]">
            <AllCompaniesIcon />
          </div>
          <p
            className={`text-[16px] ${
              activeCategoryId === '0' ? 'text-white' : 'text-border-color'
            } transition-all duration-200 group-hover:text-white`}
          >
            전체
          </p>
        </button>
      </div>
      <div className="grid max-w-[660px] grid-cols-5 gap-[10px]">
        {categoryNames.slice(1).map((name, index) => {
          const IconComponent = getCategoryIcon(name);
          const categoryId = (index + 1).toString();
          return (
            <button
              className={`group flex items-center justify-center gap-2 rounded-xl ${
                activeCategoryId === categoryId ? 'bg-btn-blue-color' : 'bg-modal-background-color'
              } px-[14px] py-[12px] transition-all duration-200 hover:bg-btn-blue-color`}
              key={index}
              onClick={() => handleCategoryClick(name, index + 1)}
            >
              <div className="min-h-[25px] min-w-[25px]">
                <IconComponent />
              </div>
              <p
                className={`text-[16px] ${
                  activeCategoryId === categoryId ? 'text-white' : 'text-border-color'
                } transition-all duration-200 group-hover:text-white`}
              >
                {name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
