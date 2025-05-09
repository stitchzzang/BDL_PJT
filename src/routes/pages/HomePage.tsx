import { useNavigate } from 'react-router-dom';

import { useUserRanking } from '@/api/home.api';
import { HomeBanner } from '@/components/common/home-banner';
import { RocketAnimation } from '@/components/common/rocket-animation';
import { KosdaqKospiChartContainer } from '@/components/home-page/kosdaq-kospi-chart/kosdaq-kospi-chart-container';
import { NewsChart } from '@/components/home-page/news/news-chart';
import { RankCards } from '@/components/home-page/rank-cards/rank-cards';
import { RealTimeChart } from '@/components/home-page/real-time-chart/real-time-chart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const HomePage = () => {
  const navigate = useNavigate();
  const { data: userRanking, isLoading, isError, refetch } = useUserRanking();

  return (
    <div className="px-6">
      <div>
        <HomeBanner />
        <div id="chart-section" className="mt-[80px] max-h-[300px] py-4">
          <KosdaqKospiChartContainer />
        </div>
        <div className="mt-[60px] w-full">
          <div className="mb-3 flex items-center gap-3">
            <h3 className="text-[28px] font-bold">종목 순위 차트</h3>
            {/* <p className="text-[20px] font-light text-text-inactive-2-color">어제 08:25 기준</p> */}
          </div>
          <div className="grid min-h-[520px] w-full grid-cols-8 gap-3">
            <div className="col-span-5">
              <RealTimeChart />
            </div>
            <div className="col-span-3 mt-10 flex justify-center">
              <NewsChart />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-[100px] w-full">
        <div className="mb-[25px] flex flex-col gap-1">
          <h3 className="text-[28px] font-bold">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className="cursor-pointer border-b-2"
                    onClick={() => {
                      navigate('/tutorial');
                    }}
                  >
                    주식 튜토리얼
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-row items-center gap-1">
                    <RocketAnimation />
                    <p>주식 튜토리얼을 하러 가볼까요?</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>{' '}
            수익률 랭킹 <span className="text-btn-red-color">TOP5</span>
          </h3>
          <p className="text-[20px] font-light text-text-inactive-2-color">
            BDL에서 가장 주식 튜토리얼 수익률이 높은 유저를 소개합니다.
          </p>
        </div>
        <div>
          <RankCards
            userRanking={userRanking ?? []}
            isLoading={isLoading}
            isError={isError}
            refetch={refetch}
          />
        </div>
      </div>
    </div>
  );
};
