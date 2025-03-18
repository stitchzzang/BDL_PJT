import { StockTutorialResultItem } from '@/components/member-info/stock-tutorial-result-item';

export const StockTutorialResultPage = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">주식식 튜토리얼 결과</h1>
      <StockTutorialResultItem />
    </div>
  );
};
