import { RankCard } from '@/components/home-page/rank-cards/rank-card';

export interface RankInformation {
  name: string;
  rate: number;
  imgUrl: string | null;
}

const RankInformations: RankInformation[] = [
  {
    name: '크와와왕',
    rate: 23.2,
    imgUrl: null,
  },
  {
    name: '크와와왕',
    rate: 23.2,
    imgUrl: null,
  },
  {
    name: '크와와왕',
    rate: 23.2,
    imgUrl: null,
  },
];

export const RankCards = () => {
  return (
    <div>
      <div>
        {RankInformations.map((rankInfo, index) => (
          <div>
            <RankCard rankInfo={rankInfo} />
          </div>
        ))}
      </div>
    </div>
  );
};
