import ChartComponent from '@/components/ui/chart';
import { minuteData } from '@/lib/dummy-data';

export const SimulatedEducationPage = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1">
        <ChartComponent data={minuteData} height={600} />
      </div>
    </div>
  );
};
