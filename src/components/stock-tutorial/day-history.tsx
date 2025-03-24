import { DayHistoryCard } from '@/components/stock-tutorial/day-history-card';

export interface NewsResponse {
  stockCandleId: number;
  changeRate: number;
  newsTitle: string;
  newsDate: string;
}

export const DayHistory = () => {
  return (
    <div>
      <DayHistoryCard />
    </div>
  );
};
