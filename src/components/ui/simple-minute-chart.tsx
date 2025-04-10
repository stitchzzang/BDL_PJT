import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { useMemo } from 'react';

// 5분봉 차트 데이터 타입
export interface MinuteChartDataItem {
  stockCandleMinuteId: number;
  companyId: string;
  openPrice: number;
  openPricePercent: number;
  highPrice: number;
  highPricePercent: number;
  lowPrice: number;
  lowPricePercent: number;
  closePrice: number;
  closePricePercent: number;
  contractingVolume: number;
  accumulatedTradeAmount: number;
  tradingTime: string;
  fiveAverage: number;
  twentyAverage: number;
}

// 일봉 차트 데이터 타입
export interface DailyChartDataItem {
  stockCandleId: number;
  companyId: string;
  openPrice: number;
  openPricePercent: number;
  highPrice: number;
  highPricePercent: number;
  lowPrice: number;
  lowPricePercent: number;
  closePrice: number;
  closePricePercent: number;
  accumulatedVolume: number;
  accumulatedTradeAmount: number;
  tradingDate: string;
  periodType: number;
  fiveAverage: number;
  twentyAverage: number;
}

// 차트 데이터 컨테이너 타입
export interface ChartData<T> {
  companyId: string;
  limit: number;
  cursor: string;
  data: T[];
}

// 간단한 차트 컴포넌트 공통 프롭스
export interface SimpleChartProps<T> {
  data: T[];
  height?: number;
  width?: number;
}

/**
 * 간단한 분봉 차트 컴포넌트
 * 캔들스틱 차트로 1분 단위의 주가 데이터를 표시합니다.
 */
export const SimpleMinuteChart: React.FC<SimpleChartProps<MinuteChartDataItem>> = ({
  data,
  height = 160,
  width = 330,
}) => {
  // 차트 옵션 생성
  const option = useMemo<EChartsOption>(() => {
    // 날짜와 시간 포맷팅
    const formatTime = (dateStr: string) => {
      const date = new Date(dateStr);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    // 데이터 변환
    const categories = data.map((item) => formatTime(item.tradingTime));
    const values = data.map((item) => [
      item.openPrice,
      item.closePrice,
      item.lowPrice,
      item.highPrice,
    ]);

    return {
      grid: {
        left: '10%',
        right: '5%',
        top: '10%',
        bottom: '15%',
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLabel: {
          fontSize: 10,
          interval: 0,
        },
        axisLine: {
          lineStyle: {
            color: '#ccc',
          },
        },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: {
          fontSize: 10,
          formatter: (value: number) => value.toLocaleString(),
        },
        splitLine: {
          lineStyle: {
            color: '#eee',
          },
        },
      },
      series: [
        {
          type: 'candlestick',
          data: values,
          itemStyle: {
            color: '#ef5350', // 양봉(상승) 색상
            color0: '#1976d2', // 음봉(하락) 색상
            borderColor: '#ef5350',
            borderColor0: '#1976d2',
          },
        },
      ],
      tooltip: {
        show: false,
      },
      animation: false,
    };
  }, [data]);

  return (
    <ReactECharts
      option={option}
      style={{ height: `${height}px`, width: `${width}px` }}
      notMerge={true}
      lazyUpdate={false}
    />
  );
};
