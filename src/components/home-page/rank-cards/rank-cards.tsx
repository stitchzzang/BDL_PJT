import { UserRanking } from '@/api/types/home';
import { ErrorScreen } from '@/components/common/error-screen';
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
  refetch,
}: {
  userRanking: UserRanking[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}) => {
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorScreen onRefresh={refetch} />;
  if (userRanking.length === 0) return <div>랭킹 데이터가 없습니다.</div>;
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
