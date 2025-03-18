import { RankInformation } from '@/components/home-page/rank-cards/rank-cards';

interface RankCardProps {
  rankInfo: RankInformation;
}

export const RankCard = ({ rankInfo }: RankCardProps) => {
  const { name, rate, imgUrl } = rankInfo;
  return (
    <div>
      <div>
        <p>{name}</p>
        <p>{rate}</p>
        <p>{imgUrl}</p>
      </div>
    </div>
  );
};
