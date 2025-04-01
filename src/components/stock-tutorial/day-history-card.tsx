import { NewsResponse } from '@/api/types/tutorial';

export interface DayHistoryCardProps {
  newsItem: NewsResponse;
}

export const DayHistoryCard = ({ newsItem }: DayHistoryCardProps) => {
  // 변동률에 따른 스타일 결정
  const changeStyle = newsItem.changeRate >= 0 ? 'text-btn-red-color' : 'text-btn-blue-color';
  const changeSymbol = newsItem.changeRate >= 0 ? '+' : '';

  return (
    <div className="w-full max-w-[300px] rounded-xl border border-border-color border-opacity-20 p-4">
      <div className="mb-[15px] flex flex-col flex-wrap gap-2">
        <p className="line-clamp-2 text-[16px] font-bold text-white">{newsItem.newsTitle}</p>
        <p className="text-[14px] text-border-color">
          {new Date(newsItem.newsDate).toLocaleDateString('ko-KR')}
        </p>
      </div>
      <div className="flex gap-2">
        <span className="font-semibold text-border-color">변동률:</span>
        <span className={`font-semibold ${changeStyle}`}>
          {changeSymbol}
          {newsItem.changeRate.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};
