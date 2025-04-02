import { LatestNews } from '@/api/types/home';

export interface NewsChartSubProps {
  newsSubInfo?: LatestNews;
}

export const NewsChartSub = ({ newsSubInfo }: NewsChartSubProps) => {
  const handleNewsClick = () => {
    if (newsSubInfo?.newsOriginalUrl) {
      window.open(newsSubInfo.newsOriginalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button className="group w-full rounded-2xl transition-all" onClick={handleNewsClick}>
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
        <div className="max-h-[100px] max-w-[100px] overflow-hidden rounded-2xl transition-opacity group-hover:opacity-90">
          {newsSubInfo?.newsThumbnailUrl === null ? (
            <img
              src="/none-img/none_stock_img.png"
              alt="noneNewsImg"
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <img
              src={newsSubInfo?.newsThumbnailUrl}
              alt="newsSubImg"
              className="h-full w-full object-cover object-center"
            />
          )}
        </div>
        <h3 className="line-clamp-2 whitespace-normal break-words text-left text-[18px] font-bold transition-colors group-hover:text-primary-color group-hover:underline">
          {newsSubInfo?.newsTitle}
        </h3>
      </div>
    </button>
  );
};
