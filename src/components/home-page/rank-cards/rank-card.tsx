import noneProfilImg from '@/assets/none-img/none_profil_img.png';
import { RankInformation } from '@/components/home-page/rank-cards/rank-cards';

interface RankCardProps {
  rankInfo: RankInformation;
}

export const RankCard = ({ rankInfo }: RankCardProps) => {
  const { name, rate, imgUrl } = rankInfo;
  return (
    <div className="flex items-center justify-center rounded-2xl border border-background-color bg-modal-background-color p-[30px] transition-all duration-300 hover:border-btn-blue-color">
      <div className="flex flex-col items-center justify-center gap-[15px]">
        {imgUrl === null ? (
          <div className="max-h-[168px] max-w-[168px] overflow-hidden rounded-2xl">
            <img src={noneProfilImg} alt="noneimg" />
          </div>
        ) : (
          <img src={imgUrl} alt="profilimg" />
        )}
        <p className="text-[22px] font-medium">{name}</p>
        <div className="rounded-2xl border border-btn-red-color px-[28px] py-[12px]">
          <p className="text-[28px] font-bold text-btn-red-color">{rate} %</p>
        </div>
      </div>
    </div>
  );
};
