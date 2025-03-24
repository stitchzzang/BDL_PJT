import { DayHistory } from '@/components/stock-tutorial/day-history';
import { StockProgress } from '@/components/stock-tutorial/stock-progress';
import { StockTutorialComment } from '@/components/stock-tutorial/stock-tutorial-comment';
import { StockTutorialInfo } from '@/components/stock-tutorial/stock-tutorial-info';
import { StockTutorialMoneyInfo } from '@/components/stock-tutorial/stock-tutorial-money-info';
import { TutorialOrderStatus } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status';
import ChartComponent from '@/components/ui/chart';
import { minuteData } from '@/lib/dummy-data';

export const SimulatedEducationPage = () => {
  const h3Style = 'text-[20px] font-bold';
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
      <div className="grid grid-cols-10 gap-3">
        <div className="col-span-8">
          <ChartComponent data={minuteData} height={600} />
        </div>
        <div className="col-span-2">
          <TutorialOrderStatus />
        </div>
      </div>
      <div>
        <div className="my-[30px]">
          <h3 className={`${h3Style} mb-[15px]`}>일간 히스토리</h3>
          <DayHistory />
        </div>
      </div>
      <div>
        <StockTutorialComment />
      </div>
    </div>
  );
};
