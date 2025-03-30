import { type CategoryName, getCategoryIcon, getCategoryNames } from '@/utils/categoryMapper';

// props 선택
export interface CategoryListProps {
  setCategoryId: (category: string) => void;
  activeCategoryId: string;
}

export const CategoryList = ({ setCategoryId, activeCategoryId }: CategoryListProps) => {
  const categoryNames = getCategoryNames();

  // 프론트의 카테고리 순서와 실제 DB 카테고리 ID 매핑
  const categoryIdMapping: Record<number, number> = {
    0: 0, // 전체 (0은 전체를 의미)
    1: 2, // 자동차 (DB ID: 2)
    2: 7, // 화장품 (DB ID: 7)
    3: 6, // 방위/방산 (DB ID: 6)
    4: 1, // 반도체 (DB ID: 1)
    5: 10, // 바이오 (DB ID: 10)
    6: 3, // IT (DB ID: 3)
    7: 9, // 금속 (DB ID: 9)
    8: 5, // 엔터 (DB ID: 5)
    9: 4, // 금융 (DB ID: 4)
    10: 8, // 음식 (DB ID: 8)
  };

  // 반대로 실제 DB ID를 프론트의 인덱스로 매핑 (활성화된 카테고리 표시용)
  const dbIdToIndexMapping: Record<string, string> = {
    '0': '0', // 전체
    '1': '4', // 반도체 -> 프론트 인덱스 4
    '2': '1', // 자동차 -> 프론트 인덱스 1
    '3': '6', // IT -> 프론트 인덱스 6
    '4': '9', // 금융 -> 프론트 인덱스 9
    '5': '8', // 엔터테인먼트 -> 프론트 인덱스 8
    '6': '3', // 방산 -> 프론트 인덱스 3
    '7': '2', // 화장품 -> 프론트 인덱스 2
    '8': '10', // 음식료 -> 프론트 인덱스 10
    '9': '7', // 금속 -> 프론트 인덱스 7
    '10': '5', // 바이오 -> 프론트 인덱스 5
  };

  const handleCategoryClick = (name: CategoryName, index: number) => {
    // 실제 DB ID로 변환하여 전달
    const dbCategoryId = categoryIdMapping[index];
    setCategoryId(dbCategoryId.toString());
  };

  // 활성화된 카테고리를 표시하기 위해 DB ID를 프론트 인덱스로 변환
  const activeIndex = dbIdToIndexMapping[activeCategoryId] || '0';

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
          const frontendIndex = (index + 1).toString();
          return (
            <button
              className={`group flex items-center justify-center gap-2 rounded-xl ${
                activeIndex === frontendIndex ? 'bg-btn-blue-color' : 'bg-modal-background-color'
              } px-[14px] py-[12px] transition-all duration-200 hover:bg-btn-blue-color`}
              key={index}
              onClick={() => handleCategoryClick(name, index + 1)}
            >
              <div className="min-h-[25px] min-w-[25px]">
                <IconComponent />
              </div>
              <p
                className={`text-[16px] ${
                  activeIndex === frontendIndex ? 'text-white' : 'text-border-color'
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
