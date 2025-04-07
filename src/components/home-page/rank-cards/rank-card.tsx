import Lottie from 'lottie-react';

import { UserRanking } from '@/api/types/home';
import crownAnimation from '@/assets/lottie/crown-animation.json';
import { roundToTwoDecimalPlaces } from '@/utils/numberFormatter';

interface RankCardProps {
  rankInfo: UserRanking;
  rank: number;
}

export const RankCard = ({ rankInfo, rank }: RankCardProps) => {
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
        <div className="rounded-2xl border border-btn-red-color px-6 py-2">
          <p className="text-xl font-bold text-btn-red-color">
            {roundToTwoDecimalPlaces(changeRate)} %
          </p>
        </div>
      </div>
    </div>
  );
};
