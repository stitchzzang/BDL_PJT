import { NewsResponse } from '@/api/types/tutorial';

export interface DayHistoryCardProps {
  newsItem: NewsResponse;
}

export const DayHistoryCard = ({ newsItem }: DayHistoryCardProps) => {
  // 변동률에 따른 스타일 결정
  const changeStyle = newsItem.changeRate >= 0 ? 'text-btn-red-color' : 'text-btn-blue-color';
  const changeSymbol = newsItem.changeRate >= 0 ? '+' : '';

  // 날짜 포맷팅 - YYYY-MM-DD 형식
  const date = new Date(newsItem.newsDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  return (
    <div className="flex w-full items-center justify-between rounded-xl border border-btn-green-color bg-transparent px-6 py-4 text-btn-red-color shadow-sm transition-colors">
      <p className="mr-3 line-clamp-2 flex-1 font-bold text-white">{newsItem.newsTitle}</p>
      <div className="ml-4 flex shrink-0 items-center whitespace-nowrap">
        <span className={`font-semibold ${changeStyle}`}>
          {changeSymbol}
          {newsItem.changeRate.toFixed(2)}%
        </span>
        <span className="mx-3 text-white">|</span>
        <span className="text-white">{formattedDate}</span>
      </div>
    </div>
  );
};
