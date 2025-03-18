import { RankCards } from '@/components/home-page/rank-cards/rank-cards';
import { RealTimeChart } from '@/components/home-page/real-time-chart/real-time-chart';

export const HomePage = () => {
  return (
    <div>
      <div>HomePage</div>
      <div>
        <RealTimeChart />
      </div>
      <div>
        <RankCards />
      </div>
    </div>
  );
};
