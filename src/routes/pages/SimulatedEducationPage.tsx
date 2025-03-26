import ChartComponent from '@/components/ui/chart';

export const SimulatedEducationPage = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1">
        <ChartComponent height={600} />
      </div>
    </div>
  );
};
