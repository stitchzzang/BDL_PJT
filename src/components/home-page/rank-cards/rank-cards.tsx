import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';

import { UserRanking } from '@/api/types/home';
import crownAnimation from '@/assets/lottie/crown-animation.json';
import { ErrorScreen } from '@/components/common/error-screen';
import { RocketAnimation } from '@/components/common/rocket-animation';
import { RankCard } from '@/components/home-page/rank-cards/rank-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export interface RankInformation {
  name: string;
  rate: number;
  imgUrl: string | null;
}

const EmptyRankState = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Lottie animationData={crownAnimation} loop={true} />
      </div>
      <h3 className="mb-2 text-lg font-semibold">아직 랭킹이 없습니다</h3>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p
              className="cursor-pointer border-b border-gray-500 text-sm text-gray-500"
              onClick={() => navigate('/tutorial')}
            >
              다른 사용자들과 경쟁하고 랭킹에 도전해보세요!
            </p>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="flex flex-row items-center gap-1">
              <RocketAnimation />
              <p>주식 튜토리얼을 하러 가볼까요?</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export const RankCards = ({
  userRanking,
  isLoading,
  isError,
  refetch,
}: {
  userRanking: UserRanking[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}) => {
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorScreen onRefresh={refetch} />;
  if (userRanking.length === 0) return <EmptyRankState />;
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {userRanking.map((rankInfo, index) => (
        <div key={index}>
          <RankCard rankInfo={rankInfo} rank={index + 1} />
        </div>
      ))}
    </div>
  );
};
