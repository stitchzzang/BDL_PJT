import noneStockImg from '@/assets/none-img/none_stock_img.png';
import { formatThousandSeparator } from '@/lib/formatThousandSeparator';

export interface StockTransaction {
  stockName: string;
  currentPrice: number;
  changeRate: number;
  tradingValue: number;
  imageUrl: string | null;
}
export type StockTransactions = StockTransaction;

export const RealTimeChartTransaction = () => {
  // 더미데이터
  const stockTransactions: StockTransactions[] = [
    {
      stockName: '삼성전자',
      currentPrice: 110002131240,
      changeRate: 1.5,
      tradingValue: 500235235000000,
      imageUrl: null,
    },
    {
      stockName: 'SK하이닉스',
      currentPrice: 100000000000,
      changeRate: 1.5,
      tradingValue: 5026210000000,
      imageUrl: null,
    },
  ];

  return (
    <div>
      <div className="w-full">
        <div className="flex flex-col space-y-4">
          <div>{/* 실시간, 일별 */}</div>
          <div className="flex flex-col space-y-2">
            {/* 테이블 헤더 */}
            <div className="rounded-lgp-2 flex flex-row">
              <div className="w-[40%] text-[16px] text-border-color">종목</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">현재가</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">등락률</div>
              <div className="w-[20%] text-right text-[16px] text-border-color">
                거래대금 많은 순
              </div>
            </div>

            {/* 테이블 로우들 - 배열의 각 항목을 매핑 */}
            {stockTransactions.map((stockTransaction, index) => (
              <div
                key={index}
                className="flex flex-row items-center rounded-lg bg-[#102038] p-3 text-white hover:bg-modal-background-color"
              >
                <div className="flex w-[40%] items-center gap-3 font-medium">
                  <h3 className="text-[20px] font-bold">{index + 1}</h3>
                  <div className="max-h-[50px] max-w-[50px] overflow-hidden rounded-xl">
                    {stockTransaction.imageUrl === null ? (
                      <img src={noneStockImg} alt="noneimage" />
                    ) : (
                      <img src={stockTransaction.imageUrl} alt="stockprofileimage" />
                    )}
                  </div>
                  <h3 className="text-[16px] font-medium">{stockTransaction.stockName}</h3>
                </div>
                <div className="w-[20%] text-right">
                  {formatThousandSeparator(stockTransaction.currentPrice)} 원
                </div>
                <div className="w-[20%] text-right text-btn-red-color">
                  {stockTransaction.changeRate}%
                </div>
                <div className="w-[20%] text-right font-light text-border-color">
                  {formatThousandSeparator(stockTransaction.tradingValue)} 원
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
