import { NewsChart } from '@/components/home-page/news/news-chart';
import { RankCards } from '@/components/home-page/rank-cards/rank-cards';
import { RealTimeChart } from '@/components/home-page/real-time-chart/real-time-chart';

export const HomePage = () => {
  return (
    <div>
      <div>{/* 코스피,코스단.. 차트 */}</div>
      <div>
        <div>
          <div>
            <h3 className="text-[28px] font-bold">실시간 차트</h3>
            <p className="text-[20px] font-light text-text-inactive-2-color">어제 08:25 기준</p>
          </div>
          <RealTimeChart />
        </div>
        <div>
          <NewsChart />
        </div>
      </div>
      <div>
        <RankCards />
      </div>
    </div>
  );
};
