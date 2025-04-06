import { DailyData } from '@/api/types/algorithm';

interface BackTestResultListProps {
  dailyData: DailyData[] | null;
  setClickNumber: React.Dispatch<React.SetStateAction<number>>;
}

export const BackTestResultList = ({ dailyData, setClickNumber }: BackTestResultListProps) => {
  // 데이터가 없으면 빈 div 반환
  if (!dailyData || dailyData.length === 0) {
    return <div>현제 일일 데이터가 없습니다.</div>;
  }
  // 배열을 복사하고 순서를 뒤집어서 첫번째 요소가 마지막에 오도록 함
  const reversedData = [...dailyData].reverse();
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-modal-background-color p-2">
      {reversedData.map((dailyDatacard, index) => {
        if (dailyDatacard.trade !== null) {
          return (
            <div
              key={`item-${dailyData.length - 1 - index}`}
              className="animate-fadeIn cursor-pointer rounded-xl border border-border-color border-opacity-40 p-2 transition-colors duration-300 hover:bg-background-color"
              onClick={() => setClickNumber(dailyDatacard.index)}
            >
              <p>{dailyDatacard.trade.reason}</p>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};
