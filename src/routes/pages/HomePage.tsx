import ChartComponent from '@/components/ui/chart';
import { dummyChartData } from '@/lib/dummy-data';

export const HomePage = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="w-full h-[700px] bg-modal-background-color rounded-lg shadow-lg">
        <ChartComponent data={dummyChartData} />
      </div>
    </div>
  );
};
