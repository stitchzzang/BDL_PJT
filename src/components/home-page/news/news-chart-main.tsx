import { LatestNews } from '@/api/types/home';

interface NewsChartMainProps {
  newsMainInfo?: LatestNews;
}

export const NewsChartMain = ({ newsMainInfo }: NewsChartMainProps) => {
  const handleNewsClick = () => {
    if (newsMainInfo?.newsOriginalUrl) {
      window.open(newsMainInfo.newsOriginalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button className="group w-full rounded-2xl" onClick={handleNewsClick}>
      <div className="inline-block max-h-[250px] overflow-hidden rounded-2xl transition-opacity group-hover:opacity-90">
        {newsMainInfo?.newsThumbnailUrl === null ? (
          <img
            src="/none-img/none_news_img.png"
            alt="noneImg"
            className="h-full w-full object-cover object-center"
          />
        ) : (
          <img
            src={newsMainInfo?.newsThumbnailUrl}
            alt="newsMainImg"
            className="h-full w-full object-cover object-center"
          />
        )}
      </div>
      <div className="mt-1">
        <div className="flex items-center gap-2">
          <h3 className="line-clamp-1 whitespace-normal break-words text-[20px] font-bold transition-colors group-hover:text-primary-color group-hover:underline">
            {newsMainInfo?.newsTitle}
          </h3>
        </div>
        <p className="mt-1 line-clamp-2 whitespace-normal break-words text-left text-[15px] font-light transition-colors group-hover:text-text-main-color group-hover:underline">
          {newsMainInfo?.newsContent}
        </p>
      </div>
    </button>
  );
};
