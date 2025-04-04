import { UserRanking } from '@/api/types/home';
import { RankCard } from '@/components/home-page/rank-cards/rank-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export interface RankInformation {
  name: string;
  rate: number;
  imgUrl: string | null;
}

export const RankCards = ({
  userRanking,
  isLoading,
  isError,
}: {
  userRanking: UserRanking[];
  isLoading: boolean;
  isError: boolean;
}) => {
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div>에러가 발생했습니다.</div>;
  if (userRanking.length === 0) return <div>랭킹 데이터가 없습니다.</div>;
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {userRanking.map((rankInfo, index) => (
        <div key={index}>
          <RankCard rankInfo={rankInfo} />
        </div>
      ))}
    </div>
  );
};
