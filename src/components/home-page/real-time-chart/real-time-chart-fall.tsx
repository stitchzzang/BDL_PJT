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
      <div></div>
    </div>
  );
};
