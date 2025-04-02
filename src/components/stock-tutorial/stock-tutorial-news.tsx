import { useEffect } from 'react';

import { NewsResponseWithThumbnail } from '@/api/types/tutorial';
import { StockTutorialNewsDetail } from '@/components/stock-tutorial/stock-tutorial-news-detail';

export interface StockTutorialNewsProps {
  currentNews: NewsResponseWithThumbnail | null;
  companyId: number;
}

export const StockTutorialNews = ({ currentNews, companyId }: StockTutorialNewsProps) => {
  // 뉴스 데이터 변경 시 로깅
  useEffect(() => {
    console.log('StockTutorialNews - 교육용 뉴스 데이터:', {
      hasData: !!currentNews,
      newsId: currentNews?.newsId,
      title: currentNews?.newsTitle,
      date: currentNews?.newsDate,
      companyId,
    });
  }, [currentNews, companyId]);

  if (!currentNews) {
    return (
      <div>
        <div className="rounded-xl bg-modal-background-color p-5">
          <h1 className="mb-[10px] text-[20px] font-bold">교육용 뉴스</h1>
          <p className="text-border-color">튜토리얼을 진행하면 이 곳에 교육용 뉴스가 표시됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-modal-background-color p-5">
      <h1 className="mb-[10px] text-[20px] font-bold">교육용 뉴스</h1>
      <StockTutorialNewsDetail news={currentNews} companyId={companyId} />
    </div>
  );
};
