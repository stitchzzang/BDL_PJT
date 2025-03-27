import { LatestNews } from '@/api/types/home';

interface NewsChartMainProps {
  newsMainInfo?: LatestNews;
}

export const NewsChartMain = ({ newsMainInfo }: NewsChartMainProps) => {
  return (
    <div className="w-full">
      <div className="inline-block max-h-[250px] overflow-hidden rounded-2xl">
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
      <div>
        <h3 className="whitespace-normal break-words text-[20px] font-bold">
          {newsMainInfo?.newsTitle}
        </h3>
        <p className="line-clamp-2 whitespace-normal break-words text-[15px] font-light">
          {newsMainInfo?.newsContent}
        </p>
      </div>
    </div>
  );
};
