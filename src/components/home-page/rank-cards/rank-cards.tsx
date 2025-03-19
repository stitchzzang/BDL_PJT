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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {RankInformations.map((rankInfo, index) => (
          <div key={index}>
            <RankCard rankInfo={rankInfo} />
          </div>
        ))}
      </div>
    </div>
  );
};
