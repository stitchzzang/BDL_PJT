import { NewsResponse } from '@/api/types/tutorial';
import { DayHistoryCard } from './day-history-card';

export interface DayHistoryProps {
  news: NewsResponse[];
}

export const DayHistory = ({ news }: DayHistoryProps) => {
  return (
    <div className="flex w-full flex-wrap gap-5">
      {news.length === 0 ? (
        <p className="text-border-color">표시할 뉴스가 없습니다.</p>
      ) : (
        news.map((newsItem) => <DayHistoryCard key={newsItem.newsId} newsItem={newsItem} />)
      )}
    </div>
  );
};
