import { CompanyInfo, TickData } from '@/api/types/stock';
import { Button } from '@/components/ui/button';
import { calculatePriceChange } from '@/utils/calculate-price-change';
import { addCommasToThousand } from '@/utils/numberFormatter';

interface StockInfoProps {
  stockCompanyInfo?: CompanyInfo;
  tickData: TickData | null;
  closePrice: number;
  comparePrice?: number;
}

export const StockInfo = ({
  stockCompanyInfo,
  tickData,
  closePrice,
  comparePrice,
}: StockInfoProps) => {
  // const CategoryIcon = getCategoryIcon(stockCompanyInfo?.categories?.[0] ?? 'IT');
  const priceToCompare = tickData ? tickData.stckPrpr : closePrice;
  // 외부 함수 호출
  const priceChange = calculatePriceChange(priceToCompare, comparePrice ?? 0);
  return (
    <div className="flex items-center">
      <div className="flex w-full items-start gap-[20px] sm:items-center">
        <div className="max-h-[70px] max-w-[70px] overflow-hidden rounded-xl">
          {/* 이미지 */}
          <img src={stockCompanyInfo?.companyImage} alt="stock-icon" />
        </div>
        <div className="flex w-full flex-col">
          <div className="flex items-center gap-2">
            <h3 className="text-[20px] font-medium text-white">{stockCompanyInfo?.companyName}</h3>
            <p className="text-[14px] font-light text-border-color">
              {stockCompanyInfo?.companyCode}
            </p>
          </div>
          <div className="flex w-full flex-col items-start justify-start gap-[18px] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-[18px] sm:flex-row">
              <h3 className="text-[30px] font-medium text-white">
                {tickData
                  ? addCommasToThousand(tickData?.stckPrpr)
                  : addCommasToThousand(closePrice)}
                원
              </h3>
              <div className="flex flex-col gap-[18px] sm:flex-row">
                <div className="flex gap-[15px] rounded-lg bg-modal-background-color px-[15px] py-[10px]">
                  <p className="text-border-color">어제보다</p>
                  <p className={priceChange.isRise ? 'text-btn-red-color' : 'text-btn-blue-color'}>
                    {priceChange.isRise ? '+' : '-'}
                    {addCommasToThousand(priceChange.change)}원({priceChange.percent}%)
                  </p>
                </div>
                <div className="flex items-center justify-center gap-[15px] rounded-lg bg-modal-background-color px-[15px] py-[10px]">
                  <div className="min-h-[25px] min-w-[25px]">{/* <CategoryIcon /> */}</div>
                  <p className="text-border-color">{stockCompanyInfo?.categories[0]}</p>
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
