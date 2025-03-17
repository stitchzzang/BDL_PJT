import TestImage from '@/assets/test/stock-test.png';
import { Button } from '@/components/ui/button';
import { formatThousandSeparator } from '@/lib/formatThousandSeparator';

export const StockInfo = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-[20px]">
        <div className="max-h-[90px] max-w-[90px] overflow-hidden rounded-xl">
          {/* 이미지 */}
          <img src={TestImage} alt="stock-icon" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-[24px] font-medium text-white">한화오션</h3>
            <p className="text-[16px] font-light text-border-color">27210</p>
          </div>
          <div className="flex gap-[18px]">
            <h3 className="text-[30px] font-medium text-white">
              {formatThousandSeparator(167223)}원
            </h3>
            <div className="flex gap-[18px]">
              <div className="flex gap-[15px] rounded-lg bg-modal-background-color px-[15px] py-[10px]">
                <p className="text-border-color">어제보다</p>
                <p className="text-btn-red-color">{formatThousandSeparator(1323)}(23%)</p>
              </div>
              <div className="flex gap-[15px] rounded-lg bg-modal-background-color px-[15px] py-[10px]">
                <p className="text-border-color">반도체체</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Button>알고리즘 선택</Button>
      </div>
    </div>
  );
};
