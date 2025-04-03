import { useEffect } from 'react';

import { NewsResponse } from '@/api/types/tutorial';
import { DayHistoryCard } from '@/components/stock-tutorial/day-history-card';

export interface DayHistoryProps {
  news: NewsResponse[];
}

export const DayHistory = ({ news }: DayHistoryProps) => {
  // 뉴스 데이터 변경 시 로깅
  useEffect(() => {
    console.log('DayHistory - 일간 히스토리 데이터:', {
      count: news?.length || 0,
      hasData: news?.length > 0,
      firstNews: news?.length > 0 ? news[0] : null,
      newsIds: news?.map((item) => item.newsId),
    });
  }, [news]);

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex min-w-max gap-4">
        {news.length === 0 ? (
          <p className="py-4 text-border-color">표시할 뉴스가 없습니다.</p>
        ) : (
          news.map((newsItem) => <DayHistoryCard key={newsItem.newsId} newsItem={newsItem} />)
        )}
      </div>
    </div>
  );
};
