import noneNewsImg from '@/assets/none-img/none_news_img.png';
import { NewsList } from '@/components/home-page/news/news-chart';

export interface NewsChartMainProps {
  newsMainInfo: NewsList;
}

export const NewsChartMain = ({ newsMainInfo }: NewsChartMainProps) => {
  return (
    <div className="w-full">
      <div className="inline-block overflow-hidden rounded-2xl">
        {newsMainInfo.imgUrl === null ? (
          <img src={noneNewsImg} alt="noneImg" />
        ) : (
          <img src={newsMainInfo.imgUrl} alt="newsMainImg" />
        )}
      </div>
      <div>
        <h3 className="whitespace-normal break-words text-[24px] font-bold">
          {newsMainInfo.title}
        </h3>
        <p className="whitespace-normal break-words text-[16px] font-light">
          {newsMainInfo.subject}
        </p>
      </div>
    </div>
  );
};
