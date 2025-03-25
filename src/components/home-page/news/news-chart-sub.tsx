import { LatestNews } from '@/api/types/home';

export interface NewsChartSubProps {
  newsSubInfo?: LatestNews;
}

export const NewsChartSub = ({ newsSubInfo }: NewsChartSubProps) => {
  return (
    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
      <div className="max-h-[100px] max-w-[100px] overflow-hidden rounded-2xl">
        {newsSubInfo?.newsThumbnailUrl === null ? (
          <img src="/none-img/none_stock_img.png" alt="noneNewsImg" />
        ) : (
          <img src={newsSubInfo?.newsThumbnailUrl} alt="newsSubImg" />
        )}
      </div>
      <div>
        <h3 className="whitespace-normal break-words text-[18px] font-bold">
          {newsSubInfo?.newsTitle}
        </h3>
      </div>
    </div>
  );
};
