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

  const getChangeColor = (percent: number) => {
    if (percent > 0) {
      return RISE_COLOR; // 상승 색상
    } else if (percent < 0) {
      return FALL_COLOR; // 하락 색상
    }
    return '#ffffff'; // 기본 색상
  };

  const tooltipFormatter = useCallback(
    (params: any): string => {
      if (!params || params.length === 0) return 'No data';

      const { dataIndex } = params[0];
      const item = chartData[dataIndex] as ChartDataPoint;

      if (!item) return 'No data';

      // 빈 데이터 구간은 제외
      if (dataIndex < EMPTY_DATA_COUNT || !item.date) {
        return 'No data';
      }

      // 차트데이터와 원본 데이터 매핑
      const realIndex = dataIndex - EMPTY_DATA_COUNT;
      let originalData;
      if (
        period === 'MINUTE' &&
        minuteData?.data &&
        realIndex >= 0 &&
        realIndex < minuteData.data.length
      ) {
        originalData = minuteData.data[realIndex];
      } else if (periodData?.data && realIndex >= 0) {
        const filteredData = periodData.data.filter((d) => d.periodType === '1');
        if (realIndex < filteredData.length) {
          originalData = filteredData[realIndex];
        }
      }

      const { date, open, close, low, high, volume } = item;

      let openPercent = 0;
      let closePercent = 0;
      let lowPercent = 0;
      let highPercent = 0;
      let ma5 = 0;
      let ma20 = 0;

      if (originalData) {
        openPercent = originalData.openPricePercent;
        closePercent = originalData.closePricePercent;
        lowPercent = originalData.lowPricePercent;
        highPercent = originalData.highPricePercent;
        ma5 = originalData.fiveAverage;
        ma20 = originalData.twentyAverage;
      } else {
        ma5 = item.fiveAverage;
        ma20 = item.twentyAverage;
      }

      // 색상 설정
      const openColor = getChangeColor(openPercent);
      const closeColor = getChangeColor(closePercent);
      const lowColor = getChangeColor(lowPercent);
      const highColor = getChangeColor(highPercent);

      return `
        ${date}<br />
        <br />
        시가: ${formatKoreanNumber(open)}원 (<span style="color: ${openColor};">${openPercent.toFixed(2)}%</span>)<br />
        종가: ${formatKoreanNumber(close)}원 (<span style="color: ${closeColor};">${closePercent.toFixed(2)}%</span>)<br />
        저가: ${formatKoreanNumber(low)}원 (<span style="color: ${lowColor};">${lowPercent.toFixed(2)}%</span>)<br />
        고가: ${formatKoreanNumber(high)}원 (<span style="color: ${highColor};">${highPercent.toFixed(2)}%</span>)<br />
        <br />
        5이평선: ${formatKoreanNumber(ma5)}원<br />
        20이평선: ${formatKoreanNumber(ma20)}원<br />
        <br />
        거래량: ${formatVolumeNumber(volume)}<br />
      `;
    },
    [
      chartData,
      formatKoreanNumber,
      formatVolumeNumber,
      period,
      minuteData,
      periodData,
      EMPTY_DATA_COUNT,
    ],
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
          boundaryGap: false,
          axisLine: { onZero: false },
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
          },
        },
        {
          type: 'category',
          gridIndex: 1,
          data: xAxisLabels,
          boundaryGap: false,
          axisLine: { onZero: false },
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
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
          },
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
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
          },
          axisTick: { show: false },
          splitLine: {
            show: false,
          },
          position: 'right',
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: dataZoomRange.start,
          end: dataZoomRange.end,
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          bottom: 0,
          start: dataZoomRange.start,
          end: dataZoomRange.end,
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
        },
        {
          name: 'MA5',
          type: 'line',
          data: ema5Data,
          smooth: true,
          lineStyle: {
            opacity: 0.5,
          },
          symbol: 'none',
        },
        {
          name: 'MA20',
          type: 'line',
          data: ema20Data,
          smooth: true,
          lineStyle: {
            opacity: 0.5,
          },
          symbol: 'none',
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
