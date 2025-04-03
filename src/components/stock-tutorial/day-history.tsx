import { NewsResponse } from '@/api/types/tutorial';
import { DayHistoryCard } from '@/components/stock-tutorial/day-history-card';

export interface DayHistoryProps {
  news: NewsResponse[];
}

export const DayHistory = ({ news }: DayHistoryProps) => {
  if (news.length === 0) {
    return <p className="text-border-color">표시할 뉴스가 없습니다.</p>;
  }

  return (
    <div className="w-full">
      <div className="flex w-full gap-4 overflow-x-auto pb-4">
        {news.map((newsItem, index) => (
          <div key={`${newsItem.newsId}-${index}`} className="flex-shrink-0">
            <DayHistoryCard newsItem={newsItem} />
          </div>
        ))}
      </div>
    </div>
  );
};
