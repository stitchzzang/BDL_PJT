import { StockTutorialConclusionCard } from '@/components/stock-tutorial/stock-tutorial-conclusion-card';

export const StockTutorialConclusion = () => {
  return (
    <div className="h-full rounded-xl bg-modal-background-color p-[20px]">
      <div className="mb-[15px] flex items-center gap-3">
        <h1 className="text-[18px] font-bold">체결내역</h1>
      </div>
      <div>
        <StockTutorialConclusionCard />
      </div>
    </div>
  );
};
