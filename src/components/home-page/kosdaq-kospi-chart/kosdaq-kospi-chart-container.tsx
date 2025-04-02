import { useKosdaqKospiData } from '@/api/home.api';
import { ChartLoadingAnimation } from '@/components/common/chart-loading-animation';
import { ErrorScreen } from '@/components/common/error-screen';
import { KosdaqChart } from '@/components/home-page/kosdaq-kospi-chart/kosdaq-chart';
import { KospiChart } from '@/components/home-page/kosdaq-kospi-chart/kospi-chart';

export const KosdaqKospiChartContainer = () => {
  const { data: KosdaqKospiData, isError, isLoading } = useKosdaqKospiData();
  if (isLoading) {
    <ChartLoadingAnimation />;
  }
  if (isError) {
    <ErrorScreen />;
  }
  return (
    <div className="">
      <div className="flex">
        <div className="mr-2 w-full rounded-2xl  border border-border-color border-opacity-20 p-3">
          <div>
            <h1 className="font-bolt text-[22px] text-border-color">코스닥</h1>
          </div>
          <KosdaqChart kosdaqData={KosdaqKospiData?.kosdaq} />
        </div>
        <div className="ml-2 w-full rounded-2xl border border-border-color border-opacity-20 p-3">
          <div>
            <h1 className="font-bolt text-[22px] text-border-color">코스피</h1>
          </div>
          <KospiChart KospiData={KosdaqKospiData?.kospi} />
        </div>
      </div>
    </div>
  );
};
