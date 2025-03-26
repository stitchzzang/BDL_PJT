import ChartComponent from '@/components/ui/chart';

export const SimulatedInvestmentPage = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1">
        <ChartComponent height={600} />
      </div>
    </div>
  );
};
