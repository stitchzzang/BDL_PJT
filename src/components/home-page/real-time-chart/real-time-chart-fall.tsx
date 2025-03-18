import noneStockImg from '@/assets/none-img/none_stock_img.png';
import { formatThousandSeparator } from '@/lib/formatThousandSeparator';

export interface StockFall {
  stockName: string;
  currentPrice: number;
  changeRate: number;
  imageUrl: string | null;
}

export type StockFalls = StockFall;

const StockFalls: StockFalls[] = [
  {
    stockName: '삼성전자',
    currentPrice: 140203010,
    changeRate: 3.15,
    imageUrl: null,
  },
  {
    stockName: '삼성전자',
    currentPrice: 140203010,
    changeRate: 3.15,
    imageUrl: null,
  },
];

export const RealTimeChartFall = () => {
  return (
    <div>
      <div className="w-full">
        <div className="!mt-0 flex flex-col">
          <div>{/* 실시간, 일별 */}</div>
          <div className="flex flex-col space-y-2">
            {/* 테이블 헤더 */}
            <div className="rounded-lgp-2 flex flex-row">
              <div className="w-[60%] text-[14px] text-border-color">종목</div>
              <div className="w-[20%] text-right text-[14px] text-border-color">현재가</div>
              <div className="w-[20%] text-right text-[14px] text-btn-blue-color">
                등락률 낮은 순
              </div>
            </div>

            {/* 테이블 로우들 - 배열의 각 항목을 매핑 */}
            {StockFalls.map((stockFall, index) => (
              <div
                key={index}
                className="flex flex-row items-center rounded-lg bg-[#102038] p-3 text-white hover:bg-modal-background-color"
              >
                <div className="flex w-[60%] items-center gap-3 font-medium">
                  <h3 className="text-[20px] font-bold">{index + 1}</h3>
                  <div className="max-h-[50px] max-w-[50px] overflow-hidden rounded-xl">
                    {stockFall.imageUrl === null ? (
                      <img src={noneStockImg} alt="noneimage" />
                    ) : (
                      <img src={stockFall.imageUrl} alt="stockprofileimage" />
                    )}
                  </div>
                  <h3 className="text-[16px] font-medium">{stockFall.stockName}</h3>
                </div>
                <div className="w-[20%] text-right">
                  {formatThousandSeparator(stockFall.currentPrice)} 원
                </div>
                <div className="w-[20%] text-right text-btn-red-color">{stockFall.changeRate}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
