import { MinuteChart } from '@/components/ui/chart-simulate';

export const ChartConstainer = () => {
  return (
    <div>
      <div>
        <button>1</button>
        <button>2</button>
        <button>3</button>
      </div>
      <div>
        <MinuteChart />
      </div>
    </div>
  );
};
