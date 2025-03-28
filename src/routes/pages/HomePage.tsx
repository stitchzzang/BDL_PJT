import { useUserRanking } from '@/api/home.api';
import { NewsChart } from '@/components/home-page/news/news-chart';
import { RankCards } from '@/components/home-page/rank-cards/rank-cards';
import { RealTimeChart } from '@/components/home-page/real-time-chart/real-time-chart';

export const HomePage = () => {
  const { data: userRanking, isLoading, isError } = useUserRanking();

  return (
    <div className="px-6">
      <div>{/* 코스피,코스단.. 차트 */}</div>
      <div>
        <div className="mt-[100px] w-full">
          <div className="mb-[25px] flex items-center gap-3">
            <h3 className="text-[28px] font-bold">실시간 차트</h3>
            <p className="text-[20px] font-light text-text-inactive-2-color">어제 08:25 기준</p>
          </div>
          <div className="grid min-h-0 w-full grid-cols-1 gap-3 lg:min-h-[520px] lg:grid-cols-7">
            <div className="col-span-1 lg:col-span-5">
              <RealTimeChart />
            </div>
            <div className="col-span-1 flex items-center justify-center lg:col-span-2">
              <NewsChart />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[100px] w-full">
        <div className="mb-[25px] flex flex-col gap-1">
          <h3 className="text-[28px] font-bold">
            수익률 랭킹 <span className="text-btn-red-color">TOP5</span>
          </h3>
          <p className="text-[20px] font-light text-text-inactive-2-color">
            BDL에서 가장 높은 수입률을 자랑하는 유저를 소개합니다.
          </p>
        </div>
        <div>
          <RankCards userRanking={userRanking ?? []} isLoading={isLoading} isError={isError} />
        </div>
      </div>
    </div>
  );
};
