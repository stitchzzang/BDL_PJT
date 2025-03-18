export interface StockRise {
  stockName: string;
  currentPrice: number;
  changeRate: number;
  imageUrl: string | null;
}

export type StockRises = StockRise;

const StockRises: StockRises[] = [
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

export const RealTimeChartRise = () => {
  return (
    <div>
      <div></div>
    </div>
  );
};
