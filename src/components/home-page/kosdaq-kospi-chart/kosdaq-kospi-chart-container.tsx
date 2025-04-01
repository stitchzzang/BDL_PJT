import { useKosdaqKospiData } from '@/api/home.api';
import { ChartLoadingAnimation } from '@/components/common/chart-loading-animation';
import { ErrorScreen } from '@/components/common/error-screen';
import { KosdaqChart } from '@/components/home-page/kosdaq-kospi-chart/kosdaq-chart';

export const KosdaqKospiChartContainer = () => {
  const { data: KosdaqKospiData, isError, isLoading } = useKosdaqKospiData();
  if (isLoading) {
    <ChartLoadingAnimation />;
  }
  if (isError) {
    <ErrorScreen />;
  }
  return (
    <div>
      <div>
        <KosdaqChart kosdaqData={KosdaqKospiData?.kosdaq} />
      </div>
    </div>
  );
};
