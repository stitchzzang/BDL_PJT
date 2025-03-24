import { StockProgress } from '@/components/stock-tutorial/stock-progress';
import { StockTutorialInfo } from '@/components/stock-tutorial/stock-tutorial-info';
import { StockTutorialMoneyInfo } from '@/components/stock-tutorial/stock-tutorial-money-info';
import ChartComponent from '@/components/ui/chart';
import { minuteData } from '@/lib/dummy-data';

export const SimulatedEducationPage = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <div>
        <StockTutorialInfo category={'반도체'} />
        <div className="my-[25px]">
          <StockProgress />
        </div>
        <div className="mb-[25px] flex justify-between">
          <StockTutorialMoneyInfo />
          <div className="flex items-center gap-2">
            <p className="text-border-color">진행 기간 : </p>
            <div className="flex gap-3 rounded-xl bg-modal-background-color px-[20px] py-[15px]">
              <p>2024-03-21</p>
              <span className="font-bold text-border-color"> - </span>
              <p>2024-11-21</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <ChartComponent data={minuteData} height={600} />
      </div>
    </div>
  );
};
