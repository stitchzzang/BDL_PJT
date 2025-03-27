import ChartComponent from '@/components/ui/chart';
import { dummyMinuteData, dummyPeriodData } from '@/mocks/dummy-data';

export const SimulatedEducationPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">주식 튜토리얼</h1>
      <div className="p-4 shadow">
        <ChartComponent
          minuteData={dummyMinuteData}
          periodData={dummyPeriodData}
          height={600}
          ratio={2}
        />
      </div>
    </div>
  );
};
