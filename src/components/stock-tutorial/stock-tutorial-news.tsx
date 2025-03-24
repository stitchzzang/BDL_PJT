import { StockTutorialNewsDetail } from '@/components/stock-tutorial/stock-tutorial-news-detail';

export const StockTutorialNews = () => {
  return (
    <div className="h-full rounded-2xl bg-modal-background-color p-[25px] ">
      <div className="flex items-center gap-3">
        <h1 className="text-[22px] font-bold">참고 뉴스</h1>
        <p className="text-[16px] font-light text-border-color">2024-02-23</p>
      </div>
      <div className="mt-[15px]">
        <StockTutorialNewsDetail />
      </div>
    </div>
  );
};
