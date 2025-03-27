import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import {
  CandleResponse,
  ChartDataPoint,
  convertMinuteCandleToChartData,
  convertPeriodCandleToChartData,
  MinuteCandleData,
  PeriodCandleData,
} from '@/mocks/dummy-data'; // dummy-data 파일 경로 수정

// 타입 정의
interface ChartComponentProps {
  readonly height?: number;
  readonly minuteData?: CandleResponse<MinuteCandleData>;
  readonly periodData?: CandleResponse<PeriodCandleData>;
  readonly ratio?: number;
}

type PeriodType = 'MINUTE' | 'DAY' | 'WEEK' | 'MONTH';

// 상수 정의
const RISE_COLOR = '#ef5350';
const FALL_COLOR = '#1976d2';
const DEFAULT_DATA_ZOOM_START = 30;
const DEFAULT_DATA_ZOOM_END = 100;
const EMPTY_DATA_COUNT = 10;

const ChartComponent: React.FC<ChartComponentProps> = ({
  height = 700,
  minuteData,
  periodData,
}) => {
  const [period, setPeriod] = useState<PeriodType>('DAY'); // 기본값을 DAY로 설정
  const chartRef = useRef<ReactECharts>(null);
  const [dataZoomRange] = useState({
    start: DEFAULT_DATA_ZOOM_START,
    end: DEFAULT_DATA_ZOOM_END,
  });

  // 기간 선택 핸들러
  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
  };

  // 데이터 변환 및 필터링
  const rawChartData = useMemo(() => {
    let data: ChartDataPoint[] = [];
    if (period === 'MINUTE' && minuteData?.data) {
      data = minuteData.data.map(convertMinuteCandleToChartData);
    } else if (periodData?.data) {
      data = periodData.data
        .filter((item) => item.periodType === '1')
        .map(convertPeriodCandleToChartData);
    }
    return data;
  }, [period, minuteData, periodData]);

  const formatChartDate = useCallback(
    (date: Date): string => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes();

      switch (period) {
        case 'MINUTE':
          return `${year}-${month}-${day} ${hours}:${String(minutes).padStart(2, '0')}`;
        case 'DAY':
          return `${year}-${month}-${day}`;
        case 'WEEK':
          return `${year}-${month}-${day}`;
        case 'MONTH':
          return `${year}-${month}`;
        default:
          return '';
      }
    },
    [period],
  );

  const createChartDataPoint = useCallback(
    (data: ChartDataPoint[], index: number, newDate: Date): ChartDataPoint => {
      const weekData = data.slice(index, index + 5);
      const volume = weekData.reduce((sum, item) => sum + item.volume, 0);
      const high = Math.max(...weekData.map((item) => item.high));
      const low = Math.min(...weekData.map((item) => item.low));
      const open = weekData[0].open;
      const close = weekData[weekData.length - 1].close;

      return {
        date: formatChartDate(newDate),
        open,
        high,
        low,
        close,
        volume,
        changeType: close >= open ? 'RISE' : 'FALL',
        fiveAverage: 0,
        twentyAverage: 0,
        rawDate: newDate,
        periodType: 'WEEK',
      };
    },
    [formatChartDate],
  );

  const getWeekData = useCallback(
    (dayData: ChartDataPoint[]): ChartDataPoint[] => {
      const weekData: ChartDataPoint[] = [];
      for (let i = 0; i < dayData.length; i += 5) {
        const newDate = new Date(dayData[i].date);
        weekData.push(createChartDataPoint(dayData, i, newDate));
      }
      return weekData;
    },
    [createChartDataPoint],
  );

  const getMonthData = useCallback(
    (dayData: ChartDataPoint[]): ChartDataPoint[] => {
      const monthData: ChartDataPoint[] = [];
      let currentMonth = -1;
      let monthCache: ChartDataPoint[] = [];

      dayData.forEach((item) => {
        const date = new Date(item.date);
        const month = date.getMonth();

        if (month !== currentMonth) {
          if (monthCache.length > 0) {
            monthData.push(createChartDataPoint(monthCache, 0, new Date(monthCache[0].date)));
          }
          monthCache = [];
          currentMonth = month;
        }
        monthCache.push(item);
      });

      if (monthCache.length > 0) {
        monthData.push(createChartDataPoint(monthCache, 0, new Date(monthCache[0].date)));
      }

      return monthData;
    },
    [createChartDataPoint],
  );

  const chartData = useMemo(() => {
    let data = [...rawChartData];

    if (period === 'WEEK') {
      data = getWeekData(data);
    } else if (period === 'MONTH') {
      data = getMonthData(data);
    }

    const emptyData = Array(EMPTY_DATA_COUNT)
      .fill(null)
      .map(() => ({
        date: '',
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0,
      }));
    return [...emptyData, ...data];
  }, [rawChartData, period, getWeekData, getMonthData]);

  const xAxisLabels = useMemo(() => {
    return chartData.map((item) => item?.date || '');
  }, [chartData]);

  const candleData = useMemo(() => {
    return chartData.map((item) => [
      item?.open || 0,
      item?.close || 0,
      item?.low || 0,
      item?.high || 0,
    ]);
  }, [chartData]);

  const volumeData = useMemo(() => {
    return chartData.map((item) => item?.volume || 0);
  }, [chartData]);

  const formatKoreanNumber = useCallback((value: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.floor(value));
  }, []);

  const formatVolumeNumber = useCallback(
    (value: number) => {
      if (value >= 1000000000) {
        return `${Math.floor(value / 1000000000)}B`;
      } else if (value >= 1000000) {
        return `${Math.floor(value / 1000000)}M`;
      } else if (value >= 1000) {
        return `${Math.floor(value / 1000)}K`;
      } else {
        return formatKoreanNumber(value);
      }
    },
    [formatKoreanNumber],
  );

  const calculateEMA = useCallback((data: (number | null)[], period: number): (number | null)[] => {
    const k = 2 / (period + 1);
    const emaData: (number | null)[] = [];
    let ema: number | null = null;

    for (let i = 0; i < data.length; i++) {
      const currentValue = data[i];

      // 현재 값이 null 또는 undefined이면 이전 EMA 값을 유지
      if (currentValue === null || currentValue === undefined) {
        emaData[i] = ema;
        continue;
      }

      // 첫 번째 유효한 값이 나오면 EMA 초기화
      if (ema === null) {
        ema = currentValue;
      } else {
        ema = currentValue * k + ema * (1 - k);
      }

      emaData[i] = ema;
    }

    return emaData;
  }, []);

  const ema5Data = useMemo(() => {
    const closeValues = chartData.map((item) => (item?.close !== undefined ? item.close : null));
    return calculateEMA(closeValues, 5);
  }, [chartData, calculateEMA]);

  const ema20Data = useMemo(() => {
    const closeValues = chartData.map((item) => (item?.close !== undefined ? item.close : null));
    return calculateEMA(closeValues, 20);
  }, [chartData, calculateEMA]);

  const getItemStyle = useCallback(
    (params: any) => {
      const item = chartData[params.dataIndex];
      return item?.open <= item?.close ? RISE_COLOR : FALL_COLOR;
    },
    [chartData],
  );

  const tooltipFormatter = useCallback(
    (params: any): string => {
      if (!params || params.length === 0) return 'No data';

      const { dataIndex } = params[0];
      const item = chartData[dataIndex];

      if (!item) return 'No data';

      const { date, open, close, low, high, volume } = item;

      return `
            ${date}<br />
            시가: ${formatKoreanNumber(open)}<br />
            종가: ${formatKoreanNumber(close)}<br />
            저가: ${formatKoreanNumber(low)}<br />
            고가: ${formatKoreanNumber(high)}<br />
            거래량: ${formatVolumeNumber(volume)}
        `;
    },
    [chartData, formatKoreanNumber, formatVolumeNumber],
  );

  const option: EChartsOption = useMemo(
    () => ({
      animation: false,
      backgroundColor: '#0D192B',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
        formatter: tooltipFormatter,
      },
      axisPointer: {
        link: [{ xAxisIndex: 'all' }],
      },
      grid: [
        {
          left: '5%',
          right: '10%',
          bottom: '45%',
          top: '5%',
          height: '50%',
          containLabel: false,
        },
        {
          left: '5%',
          right: '10%',
          top: '60%',
          height: '30%',
          containLabel: false,
        },
      ],
      xAxis: [
        {
          type: 'category',
          data: xAxisLabels,
          boundaryGap: true,
          axisLine: {
            onZero: false,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
              width: 2,
            },
          },
          axisTick: { show: false },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              width: 1,
            },
          },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax',
          maxInterval: 3600 * 24 * 1000 * 5,
          axisPointer: {
            label: {
              formatter: (params) => {
                return String(params.value);
              },
            },
          },
          axisLabel: {
            margin: 8,
            color: 'rgba(255, 255, 255, 0.7)',
            hideOverlap: true,
            interval: 'auto',
            align: 'center',
          },
        },
        {
          type: 'category',
          gridIndex: 1,
          data: xAxisLabels,
          boundaryGap: true,
          axisLine: {
            onZero: false,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
              width: 2,
            },
          },
          axisTick: { show: false },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              width: 1,
            },
          },
          axisLabel: { show: false },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax',
          maxInterval: 3600 * 24 * 1000 * 5,
        },
      ],
      yAxis: [
        {
          scale: true,
          splitArea: {
            show: false,
          },
          axisLabel: {
            inside: false,
            margin: 8,
            color: 'rgba(255, 255, 255, 0.7)',
            formatter: (value: number) => formatKoreanNumber(value),
          },
          position: 'right',
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.1)',
              width: 1,
            },
          },
          axisLine: {
            show: true,
            onZero: false,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
              width: 2,
            },
          },
          axisTick: { show: false },
          scale: true,
          offset: 0,
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: {
            show: true,
            inside: false,
            margin: 8,
            color: 'rgba(255, 255, 255, 0.7)',
            formatter: (value: number) => formatVolumeNumber(value),
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
              width: 2,
            },
          },
          axisTick: { show: false },
          splitLine: {
            show: false,
          },
          position: 'right',
          offset: 0,
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: dataZoomRange.start,
          end: dataZoomRange.end,
          filterMode: 'filter',
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          bottom: 0,
          start: dataZoomRange.start,
          end: dataZoomRange.end,
          filterMode: 'filter',
        },
      ],
      series: [
        {
          name: 'Candle',
          type: 'candlestick',
          data: candleData,
          itemStyle: {
            color: RISE_COLOR,
            color0: FALL_COLOR,
            borderColor: RISE_COLOR,
            borderColor0: FALL_COLOR,
          },
          clip: true,
          barWidth: '70%',
          barCategoryGap: '20%',
        },
        {
          name: 'Volume',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumeData,
          itemStyle: {
            color: getItemStyle,
          },
          clip: true,
          barWidth: '70%',
          barCategoryGap: '20%',
        },
        {
          name: 'MA5',
          type: 'line',
          data: ema5Data,
          smooth: true,
          lineStyle: {
            opacity: 0.5,
            width: 2,
          },
          symbol: 'none',
          clip: true,
          connectNulls: true,
        },
        {
          name: 'MA20',
          type: 'line',
          data: ema20Data,
          smooth: true,
          lineStyle: {
            opacity: 0.5,
            width: 2,
          },
          symbol: 'none',
          clip: true,
          connectNulls: true,
        },
      ],
    }),
    [
      xAxisLabels,
      candleData,
      volumeData,
      ema5Data,
      ema20Data,
      getItemStyle,
      dataZoomRange,
      tooltipFormatter,
    ],
  );

  return (
    <div className="relative">
      {/* 기간 선택 버튼 */}
      <div className="flex items-center gap-4 p-4 text-sm text-white">
        <div className="ml-auto flex items-center gap-2">
          <button
            className={`rounded px-4 py-2 ${period === 'MINUTE' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => handlePeriodChange('MINUTE')}
            type="button"
          >
            1분
          </button>
          <button
            className={`rounded px-4 py-2 ${period === 'DAY' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => handlePeriodChange('DAY')}
            type="button"
          >
            일
          </button>
          <button
            className={`rounded px-4 py-2 ${period === 'WEEK' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => handlePeriodChange('WEEK')}
            type="button"
          >
            주
          </button>
          <button
            className={`rounded px-4 py-2 ${period === 'MONTH' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => handlePeriodChange('MONTH')}
            type="button"
          >
            월
          </button>
        </div>
      </div>
      <ReactECharts ref={chartRef} option={option} style={{ height: `${height}px` }} />
    </div>
  );
};

export default ChartComponent;
