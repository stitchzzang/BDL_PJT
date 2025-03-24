import { StockTutorialInfo } from '@/components/stock-tutorial/stock-tutorial-info';
import ChartComponent from '@/components/ui/chart';
import { minuteData } from '@/lib/dummy-data';

export const SimulatedEducationPage = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <div>
        <StockTutorialInfo category={'반도체'} />
      </div>
      <div className="flex-1">
        <ChartComponent data={minuteData} height={600} />
      </div>
    </div>
  );
};
