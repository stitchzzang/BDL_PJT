import React, { useState } from 'react';

import { RealTimeChartFall } from '@/components/home-page/real-time-chart/real-time-chart-fall';
import { RealTimeChartRise } from '@/components/home-page/real-time-chart/real-time-chart-rise';
import { RealTimeChartTransaction } from '@/components/home-page/real-time-chart/real-time-chart-transaction';
import { Tabs } from '@/components/ui/tabs';

// 차트 타입 정의
enum chartType {
  TRADING_VOLUME = '거래대금',
  RAPID_RISE = '급상승',
  RAPID_FALL = '급하락',
}

export const RealTimeChart = () => {
  const [isActive, setIsActive] = useState<chartType>(chartType.TRADING_VOLUME);

  // Record를 사용하여 컴포넌트 매핑
  const components: Record<chartType, React.ReactNode> = {
    [chartType.TRADING_VOLUME]: <RealTimeChartTransaction />,
    [chartType.RAPID_RISE]: <RealTimeChartRise />,
    [chartType.RAPID_FALL]: <RealTimeChartFall />,
  };

  const chartTabs = [
    { title: '거래대금', value: 'TRADING_VOLUME', content: <RealTimeChartTransaction /> },
    { title: '급상승', value: 'RAPID_RISE', content: <RealTimeChartRise /> },
    { title: '급하락', value: 'RAPID_FALL', content: <RealTimeChartFall /> },
  ];

  return (
    <div>
      <div>
        <Tabs
          tabs={chartTabs}
          activeTabClassName="bg-btn-blue-color"
          contentClassName="mt-3 rounded-xl p-[20px] bg-modal-background-color"
        />
      </div>
    </div>
  );
};
