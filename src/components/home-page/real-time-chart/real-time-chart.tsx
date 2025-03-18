import React, { useState } from 'react';

import { RealTimeChartFall } from '@/components/home-page/real-time-chart/real-time-chart-fall';
import { RealTimeChartRise } from '@/components/home-page/real-time-chart/real-time-chart-rise';
import { RealTimeChartTransaction } from '@/components/home-page/real-time-chart/real-time-chart-transaction';

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

  return (
    <div>
      <div>
        <button onClick={() => setIsActive(chartType.TRADING_VOLUME)}>거래대금금</button>
        <button onClick={() => setIsActive(chartType.RAPID_RISE)}>급상승</button>
        <button onClick={() => setIsActive(chartType.RAPID_FALL)}>급하락</button>
      </div>
      <div>{components[isActive]}</div>
    </div>
  );
};
