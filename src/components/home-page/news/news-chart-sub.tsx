import NoneImg from '@/assets/none-img/none_stock_img.png';
import { NewsList } from '@/components/home-page/news/news-chart';

export interface NewsChartSubProps {
  newsSubInfo: NewsList;
}

export const NewsChartSub = ({ newsSubInfo }: NewsChartSubProps) => {
  return (
    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
      <div className="max-h-[100px] max-w-[100px] overflow-hidden rounded-2xl">
        {newsSubInfo.imgUrl === null ? (
          <img src={NoneImg} alt="noneNewsImg" />
        ) : (
          <img src={newsSubInfo.imgUrl} alt="newsSubImg" />
        )}
      </div>
      <div>
        <h3 className="whitespace-normal break-words text-[18px] font-bold">{newsSubInfo.title}</h3>
      </div>
    </div>
  );
};
