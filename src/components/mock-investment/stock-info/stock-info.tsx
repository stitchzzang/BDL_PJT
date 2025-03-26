import { TickData } from '@/api/types/stock';
import TestImage from '@/assets/test/stock-test.png';
import { Button } from '@/components/ui/button';
import { CategoryName, getCategoryIcon } from '@/utils/categoryMapper';
import { addCommasToThousand } from '@/utils/numberFormatter';

interface StockInfoProps {
  category: CategoryName;
  tickData: TickData | null;
}

export const StockInfo = ({ category, tickData }: StockInfoProps) => {
  const CategoryIcon = getCategoryIcon(category);

  return (
    <div className="flex items-center">
      <div className="flex w-full items-start gap-[20px] sm:items-center">
        <div className="max-h-[70px] max-w-[70px] overflow-hidden rounded-xl">
          {/* 이미지 */}
          <img src={TestImage} alt="stock-icon" />
        </div>
        <div className="flex w-full flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-[20px] font-medium text-white">한화오션</h3>
            <p className="text-[14px] font-light text-border-color">27210</p>
          </div>
          <div className="flex w-full flex-col items-start justify-start gap-[18px] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-[18px] sm:flex-row">
              <h3 className="text-[30px] font-medium text-white">
                {tickData ? addCommasToThousand(tickData?.stckPrpr) : '0'}원
              </h3>
              <div className="flex flex-col gap-[18px] sm:flex-row">
                <div className="flex gap-[15px] rounded-lg bg-modal-background-color px-[15px] py-[10px]">
                  <p className="text-border-color">어제보다</p>
                  <p className="text-btn-red-color">{addCommasToThousand(1323)}원(23%)</p>
                </div>
                <div className="flex items-center justify-center gap-[15px] rounded-lg bg-modal-background-color px-[15px] py-[10px]">
                  <div className="min-h-[25px] min-w-[25px]">
                    <CategoryIcon />
                  </div>
                  <p className="text-border-color">{category}</p>
                </div>
              </div>
            </div>
            <div>
              <Button className="max-h-[45px] max-w-[225px]" variant={'red'} size={'lg'}>
                알고리즘 선택
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
