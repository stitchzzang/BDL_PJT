export interface StockTransaction {
  stockName: string;
  currentPrice: number;
  changeRate: number;
  tradingValue: number;
}
export type StockTransactions = StockTransaction;

export const RealTimeChartTransaction = () => {
  // 더미데이터
  const stockTransactions: StockTransactions[] = [
    {
      stockName: 'hello',
      currentPrice: 10000,
      changeRate: 1.5,
      tradingValue: 500000000,
    },
    {
      stockName: 'hello2',
      currentPrice: 100000000000,
      changeRate: 1.5,
      tradingValue: 500000000,
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
              <div className="w-[20%] text-[16px] text-border-color">종목목</div>
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
                className="flex flex-row rounded-lg bg-[#102038] p-3 text-white hover:bg-modal-background-color"
              >
                <div className="w-[40%] font-medium">
                  {formatThousandSeparator(stockTransaction.stockName)}원
                </div>
                <div className="w-[20%] text-right text-btn-blue-color">
                  {stockTransaction.currentPrice}
                </div>
                <div className="w-[20%] text-right text-btn-red-color">
                  {stockTransaction.changeRate}%
                </div>
                <div className="w-[20%] text-right font-light text-border-color">
                  {stockTransaction.tradingValue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
