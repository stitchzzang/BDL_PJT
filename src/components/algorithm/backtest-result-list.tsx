import { DailyData } from '@/api/types/algorithm';

interface BackTestResultListProps {
  dailyData: DailyData[] | null;
}

export const BackTestResultList = ({ dailyData }: BackTestResultListProps) => {
  return (
    <div>
      {dailyData?.map((dailyDatacard, index) => {
        if (dailyDatacard.trade !== null) {
          return (
            <div key={index}>
              <p>{dailyDatacard.trade.reason}</p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};
