import ChartComponent from '@/components/ui/chart';
import { dummyChartData } from '@/lib/dummy-data';

export const HomePage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">차트</h1>
      <div className="w-full h-[700px] bg-white rounded-lg shadow-lg p-4">
        <ChartComponent data={dummyChartData} />
      </div>
    </div>
  );
};
