import ChartComponent from '@/components/ui/chart';
import { dummyChartData } from '@/mocks/dummy-data';

export const SimulatedInvestmentPage = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1">
        <ChartComponent data={dummyChartData} height={600} />
      </div>
    </div>
  );
};
