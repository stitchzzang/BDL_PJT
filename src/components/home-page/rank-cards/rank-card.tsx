import { RankInformation } from '@/components/home-page/rank-cards/rank-cards';

interface RankCardProps {
  rankInfo: RankInformation;
}

export const RankCard = ({ rankInfo }: RankCardProps) => {
  const { name, rate, imgUrl } = rankInfo;
  return (
    <div className="flex items-center justify-center rounded-2xl bg-modal-background-color p-[30px]">
      <div className="flex flex-col items-center justify-center">
        <p>{name}</p>
        <p>{rate}</p>
        <p>{imgUrl}</p>
      </div>
    </div>
  );
};
