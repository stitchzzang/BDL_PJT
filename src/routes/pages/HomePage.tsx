import { NewsChart } from '@/components/home-page/news/news-chart';
import { RankCards } from '@/components/home-page/rank-cards/rank-cards';
import { RealTimeChart } from '@/components/home-page/real-time-chart/real-time-chart';

export const HomePage = () => {
  return (
    <div className="px-4">
      <div>{/* 코스피,코스단.. 차트 */}</div>
      <div>
        <div className="w-full">
          <div className="mb-[25px] flex items-center gap-3">
            <h3 className="text-[28px] font-bold">실시간 차트</h3>
            <p className="text-[20px] font-light text-text-inactive-2-color">어제 08:25 기준</p>
          </div>
          <div className="grid w-full grid-cols-1 gap-3 border lg:grid-cols-7">
            <div className="col-span-1 lg:col-span-5">
              <RealTimeChart />
            </div>
            <div className="col-span-1 lg:col-span-2">
              <NewsChart />
            </div>
          </div>
        </div>
      </div>
      <div>
        <RankCards />
      </div>
    </div>
  );
};
