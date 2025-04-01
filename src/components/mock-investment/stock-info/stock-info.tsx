import { CompanyInfo, TickData } from '@/api/types/stock';
import { Button } from '@/components/ui/button';
import { calculatePriceChange } from '@/utils/calculate-price-change';
import { getCategoryIcon } from '@/utils/categoryMapper';
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
  const AutoIcon = getCategoryIcon(stockCompanyInfo?.categories[0] ?? '전체');
  // 외부 함수 호출
  const priceChange = calculatePriceChange(priceToCompare, comparePrice ?? 0);
  return (
    <div className="flex items-center">
      <div className="flex w-full items-start gap-[20px] sm:items-center">
        <div className="flex w-full gap-3">
          <div className="max-h-[60px] max-w-[60px] overflow-hidden rounded-xl">
            {/* 이미지 */}
            <img src={stockCompanyInfo?.companyImage} alt="stock-icon" />
          </div>
          <div className="flex w-full flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-medium text-white">
                {stockCompanyInfo?.companyName}
              </h3>
              <p className="text-[14px] font-light text-border-color">
                {stockCompanyInfo?.companyCode}
              </p>
            </div>
            <div className="flex w-full flex-col items-start justify-start gap-[18px] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1 sm:flex-row">
                <h3 className="text-[22px] font-medium text-white">
                  {tickData
                    ? addCommasToThousand(tickData?.stckPrpr)
                    : addCommasToThousand(closePrice)}
                  원
                </h3>
                <div className="flex flex-col gap-2 text-[14px] sm:flex-row">
                  <div className="flex items-center gap-2 rounded-lg p-2">
                    <p className="text-border-color">어제보다</p>
                    <p
                      className={priceChange.isRise ? 'text-btn-red-color' : 'text-btn-blue-color'}
                    >
                      {priceChange.isRise ? '+' : '-'}
                      {addCommasToThousand(priceChange.change)}원({priceChange.percent}%)
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-[15px] rounded-lg border border-border-color border-opacity-20 bg-modal-background-color p-2">
                    {stockCompanyInfo?.categories.map((name, index) => {
                      const IconComponent = getCategoryIcon(name);
                      return (
                        <div
                          className="flex min-h-[25px] min-w-[25px] items-center justify-center gap-1"
                          key={index}
                        >
                          <div className="h-5 w-5">
                            <IconComponent />
                          </div>
                          <p className="text-border-color">{name}</p>
                        </div>
                      );
                    })}
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
    </div>
  );
};
