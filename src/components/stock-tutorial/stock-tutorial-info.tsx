import { useState } from 'react';

import TestImage from '@/assets/test/stock-test.png';
import { Button } from '@/components/ui/button';
import { CategoryName, getCategoryIcon } from '@/utils/categoryMapper';
import { addCommasToThousand } from '@/utils/numberFormatter';

interface StockInfoProps {
  category: CategoryName;
}

export const StockTutorialInfo = ({ category }: StockInfoProps) => {
  const [startTutorial, setStartTutorial] = useState<boolean>(false);

  const CategoryIcon = getCategoryIcon(category);
  return (
    <div>
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
                  {addCommasToThousand(167223)}원
                </h3>
                <div className="flex flex-col gap-[18px] sm:flex-row">
                  <div className="flex items-center justify-center gap-[15px] rounded-lg bg-modal-background-color px-[15px] py-[10px]">
                    <div className="min-h-[25px] min-w-[25px]">
                      <CategoryIcon />
                    </div>
                    <p className="text-border-color">{category}</p>
                  </div>
                </div>
              </div>
              <div>
                <Button
                  className="max-w-[225px]"
                  variant={'green'}
                  size={'lg'}
                  onClick={() => setStartTutorial(!startTutorial)}
                >
                  {startTutorial ? '튜토리얼 진행중' : '튜토리얼 시작하기'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
