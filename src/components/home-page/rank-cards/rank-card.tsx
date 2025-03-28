import { UserRanking } from '@/api/types/home';

interface RankCardProps {
  rankInfo: UserRanking;
}

export const RankCard = ({ rankInfo }: RankCardProps) => {
  const { nickname, profile, changeRate } = rankInfo;
  return (
    <div className="flex items-center justify-center rounded-2xl border border-background-color bg-modal-background-color p-[30px] transition-all duration-300 hover:border-btn-blue-color">
      <div className="flex flex-col items-center justify-center gap-[15px]">
        {profile == null ? (
          <div className="max-h-[168px] max-w-[168px] overflow-hidden rounded-2xl">
            <img src="/none-img/none_profile_img.png" alt="noneImg" />
          </div>
        ) : (
          <img src={profile} alt="profileImg" />
        )}
        <p className="text-[22px] font-medium">{nickname}</p>
        <div className="rounded-2xl border border-btn-red-color px-[28px] py-[12px]">
          <p className="text-[28px] font-bold text-btn-red-color">{changeRate} %</p>
        </div>
      </div>
    </div>
  );
};
