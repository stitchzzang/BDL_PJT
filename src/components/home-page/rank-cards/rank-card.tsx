import Lottie from 'lottie-react';

import { UserRanking } from '@/api/types/home';
import crownAnimation from '@/assets/lottie/crown-animation.json';
import { roundToTwoDecimalPlaces } from '@/utils/numberFormatter';

interface RankCardProps {
  rankInfo?: UserRanking;
  rank?: number;
  isEmpty?: boolean;
}

const EmptyRankCard = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-background-color bg-modal-background-color p-5 opacity-50">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <img
            className="h-[120px] w-[120px] overflow-hidden rounded-2xl object-cover"
            src="/none-img/none_profile_img.png"
            alt="emptyImg"
          />
        </div>
        <p className="text-xl font-medium text-gray-400">랭킹 없음</p>
        <div className="rounded-2xl border border-gray-400 px-6 py-2">
          <p className="text-xl font-bold text-gray-400">-</p>
        </div>
      </div>
    </div>
  );
};

export const RankCard = ({ rankInfo, rank, isEmpty }: RankCardProps) => {
  if (isEmpty) {
    return <EmptyRankCard />;
  }

  if (!rankInfo || !rank) {
    return null;
  }

  const { nickname, profileImageUrl, changeRate } = rankInfo;
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-background-color bg-modal-background-color p-5 transition-all duration-300 hover:border-btn-blue-color">
      <div className="flex flex-col items-center justify-center gap-3">
        {/* 프로필 이미지와 랭킹 표시 */}
        <div className="relative">
          <img
            className="h-[120px] w-[120px] overflow-hidden rounded-2xl object-cover"
            src={profileImageUrl || '/none-img/none_profile_img.png'}
            alt={profileImageUrl ? 'profileImg' : 'noneImg'}
          />
          {/* 1등 표시 - 애니메이션 왕관 사용 */}
          {rank === 1 && (
            <div className="absolute -right-7 -top-7 h-16 w-16">
              <Lottie animationData={crownAnimation} loop={true} />
            </div>
          )}
        </div>

        {/* 닉네임 */}
        <p className="text-xl font-medium">{nickname}</p>

        {/* 수익률 */}
        <div
          className={`rounded-2xl border ${
            changeRate === 0
              ? 'border-white'
              : changeRate > 0
                ? 'border-btn-red-color'
                : 'border-btn-blue-color'
          } px-6 py-2`}
        >
          <p
            className={`text-xl font-bold ${
              changeRate === 0
                ? 'text-white'
                : changeRate > 0
                  ? 'text-btn-red-color'
                  : 'text-btn-blue-color'
            }`}
          >
            {roundToTwoDecimalPlaces(changeRate)} %
          </p>
        </div>
      </div>
    </div>
  );
};
