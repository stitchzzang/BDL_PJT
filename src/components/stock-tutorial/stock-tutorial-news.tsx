import { NewsResponseWithThumbnail } from '@/api/types/tutorial';
import { StockTutorialNewsDetail } from '@/components/stock-tutorial/stock-tutorial-news-detail';

export interface StockTutorialNewsProps {
  currentNews: NewsResponseWithThumbnail | null;
  companyId: number;
}

export const StockTutorialNews = ({ currentNews, companyId }: StockTutorialNewsProps) => {
  if (!currentNews) {
    return (
      <div>
        <div className="rounded-xl bg-modal-background-color p-[20px]">
          <h1 className="mb-[15px] text-[20px] font-bold">교육용 뉴스</h1>
          <p className="text-border-color">
            현재 구간의, 중요한 교육용 뉴스가 이 곳에 표시됩니다.
            <br />
            다음 턴으로 진행하시면 새로운 뉴스를 볼 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-modal-background-color p-5">
      <h1 className="mb-[15px] text-[20px] font-bold">교육용 뉴스</h1>
      <StockTutorialNewsDetail news={currentNews} companyId={companyId} />
    </div>
  );
};
