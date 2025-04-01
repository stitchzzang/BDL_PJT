import { NewsResponseWithThumbnail } from '@/api/types/tutorial';

export interface StockTutorialNewsDetailProps {
  news: NewsResponseWithThumbnail;
}

export const StockTutorialNewsDetail = ({ news }: StockTutorialNewsDetailProps) => {
  // 변동률에 따른 스타일 결정
  const changeStyle = news.changeRate >= 0 ? 'text-btn-red-color' : 'text-btn-blue-color';
  const changeSymbol = news.changeRate >= 0 ? '+' : '';

  return (
    <div className="rounded-xl bg-modal-background-color p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-bold">{news.newsTitle}</h2>
        <p className="text-[14px] text-border-color">
          {new Date(news.newsDate).toLocaleDateString('ko-KR')}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <span className="font-semibold text-border-color">변동률:</span>
        <span className={`font-semibold ${changeStyle}`}>
          {changeSymbol}
          {news.changeRate.toFixed(2)}%
        </span>
      </div>

      {news.newsThumbnailUrl && (
        <div className="mt-4 max-h-[200px] overflow-hidden rounded-lg">
          <img
            src={news.newsThumbnailUrl}
            alt={news.newsTitle}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mt-4">
        <p className="text-[16px] leading-relaxed text-white">{news.newsContent}</p>
      </div>
    </div>
  );
};
