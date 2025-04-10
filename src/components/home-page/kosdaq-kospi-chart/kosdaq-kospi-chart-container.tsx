import { useKosdaqKospiData } from '@/api/home.api';
import { ChartLoadingAnimation } from '@/components/common/chart-loading-animation';
import { ErrorScreen } from '@/components/common/error-screen';
import { KosdaqChart } from '@/components/home-page/kosdaq-kospi-chart/kosdaq-chart';
import { KospiChart } from '@/components/home-page/kosdaq-kospi-chart/kospi-chart';
import { TermTooltip } from '@/components/ui/term-tooltip';
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
        <div className="ml-2 w-full rounded-2xl border border-border-color border-opacity-20 p-3">
          <div>
            <h1 className="font-bolt mb-2 text-[22px] text-border-color">
              <TermTooltip term="코스피">코스피</TermTooltip>
            </h1>
          </div>
          <KospiChart KospiData={KosdaqKospiData?.kospi} />
        </div>
        <div className="mr-2 w-full rounded-2xl  border border-border-color border-opacity-20 p-3">
          <div>
            <h1 className="font-bolt mb-2 text-[22px] text-border-color">
              <TermTooltip term="코스닥">코스닥</TermTooltip>
            </h1>
          </div>
          <KosdaqChart kosdaqData={KosdaqKospiData?.kosdaq} />
        </div>
      </div>
    </div>
  );
};
