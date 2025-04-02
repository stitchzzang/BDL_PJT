import { type CategoryName, getCategoryIcon } from '@/utils/categoryMapper';
import { scrollToTop } from '@/utils/scrollToTop';

// DB의 카테고리 순서대로 이름 정의
const DB_CATEGORY_NAMES: CategoryName[] = [
  '전체',
  '반도체',
  '자동차',
  'IT',
  '금융',
  '엔터',
  '방위',
  '화장품',
  '음식',
  '금속',
  '바이오',
];

// props 선택
export interface CategoryListProps {
  setCategoryId: (category: string) => void;
  activeCategoryId: string;
}

export const CategoryList = ({ setCategoryId, activeCategoryId }: CategoryListProps) => {
  // 카테고리 변경 시 페이지 상단으로 스크롤하는 기능
  const handleCategoryClick = (categoryId: number) => {
    setCategoryId(categoryId.toString());
    scrollToTop();
  };

  const AllCompaniesIcon = getCategoryIcon('전체');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-center">
        <button
          className={`group flex w-full items-center justify-center gap-2 rounded-xl ${
            activeCategoryId === '0' ? 'bg-btn-blue-color' : 'bg-modal-background-color'
          } px-[14px] py-[12px] transition-all duration-200 hover:bg-btn-blue-color`}
          onClick={() => {
            setCategoryId('0');
            scrollToTop();
          }}
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
        {DB_CATEGORY_NAMES.slice(1).map((name, index) => {
          const IconComponent = getCategoryIcon(name);
          const categoryId = (index + 1).toString(); // 실제 DB의 categoryId
          return (
            <button
              className={`group flex items-center justify-center gap-2 rounded-xl ${
                activeCategoryId === categoryId ? 'bg-btn-blue-color' : 'bg-modal-background-color'
              } px-[14px] py-[12px] transition-all duration-200 hover:bg-btn-blue-color`}
              key={index}
              onClick={() => handleCategoryClick(index + 1)}
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
