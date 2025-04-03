import { useEffect, useState } from 'react';

import { NewsResponse } from '@/api/types/tutorial';
import { DayHistoryCard } from '@/components/stock-tutorial/day-history-card';

export interface DayHistoryProps {
  news: NewsResponse[];
  pointStockCandleIds?: number[]; // 변곡점 stockCandleId 배열
}

export const DayHistory = ({ news, pointStockCandleIds = [] }: DayHistoryProps) => {
  const [groupedNews, setGroupedNews] = useState<{ [key: string]: NewsResponse[] }>({});

  // 뉴스를 변곡점별로 그룹화하는 함수
  useEffect(() => {
    if (!news || news.length === 0) return;

    const grouped: { [key: string]: NewsResponse[] } = {};

    // 모든 뉴스를 하나의 그룹으로 통합
    grouped['뉴스제목'] = news;

    setGroupedNews(grouped);
  }, [news]);

  if (news.length === 0) {
    return <p className="text-border-color">표시할 뉴스가 없습니다.</p>;
  }

  return (
    <div className="w-full">
      <div className="flex w-full gap-4 overflow-x-auto pb-4">
        {news.map((newsItem) => (
          <div key={newsItem.newsId} className="flex-shrink-0">
            <DayHistoryCard newsItem={newsItem} />
          </div>
        ))}
      </div>
    </div>
  );
};
