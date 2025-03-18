import { useState } from 'react';

// 차트 타입 정의
enum chartType {
  TRADING_VOLUME = '거래대금',
  RAPID_RISE = '급상승',
  RAPID_FALL = '급하락',
}

export const RealTimeChart = () => {
  const [isActive, setIsActive] = useState<string>('거래대금');
  return (
    <div>
      <div></div>
    </div>
  );
};
