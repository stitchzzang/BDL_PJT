import NoneImg from '@/assets/none-img/none_stock_img.png';
import { NewsList } from '@/components/home-page/news/news-chart';

export interface NewsChartSubProps {
  newsSubInfo: NewsList;
}

export const NewsChartSub = ({ newsSubInfo }: NewsChartSubProps) => {
  return (
    <div>
      <div className="max-h-[100px] max-w-[100px]">
        <img src={NoneImg} alt="" />
      </div>
    </div>
  );
};
