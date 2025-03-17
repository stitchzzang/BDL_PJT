'use client';

import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useState } from 'react';

import { DataPoint } from '@/lib/dummy-data';

interface ChartComponentProps {
  readonly height?: number;
  readonly width?: number;
  readonly ratio?: number;
  readonly data: DataPoint[];
}

type PeriodType = 'MINUTE' | 'DAY' | 'WEEK' | 'MONTH';

const RISE_COLOR = '#ef5350'; // 빨강
const FALL_COLOR = '#1976d2'; // 파랑

const ChartComponent: React.FC<ChartComponentProps> = ({ width = 900, height = 700, data }) => {
  const [period, setPeriod] = useState<PeriodType>('DAY');

  // 차트 X축 라벨 포맷팅 함수
  const formatChartDate = useCallback(
    (date: Date): string => {
      switch (period) {
        case 'MINUTE':
          return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        case 'DAY': {
          const day = date.getDate();
          if (day === 1) {
            // 월의 첫 날에는 '월'을 표시
            return `${date.getMonth() + 1}월`;
          }
          return `${day}일`;
        }
        case 'WEEK': {
          const day = date.getDate();
          if (day <= 7) {
            // 월의 첫 주에는 '월'을 표시
            return `${date.getMonth() + 1}월`;
          }
          return `${day}일`;
        }
        case 'MONTH': {
          const month = date.getMonth() + 1;
          if (month === 1) {
            // 년의 첫 월에는 '년'을 표시
            return `${date.getFullYear()}년`;
          }
          return `${month}월`;
        }
        default:
          return '';
      }
    },
    [period],
  );

  const isFirstOfPeriod = useCallback(
    (date: string, index: number): boolean => {
      if (index === 0) return true;

      switch (period) {
        case 'DAY': {
          // 월의 첫 날인지 확인
          return date.includes('월');
        }
        case 'WEEK': {
          // 월의 첫 주인지 확인
          return date.includes('월');
        }
        case 'MONTH': {
          // 년의 첫 월인지 확인
          return date.includes('년');
        }
        default:
          return false;
      }
    },
    [period],
  );

  const getData = useCallback(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(9, 0, 0, 0); // 오전 9시로 설정

    switch (period) {
      case 'MINUTE':
        // 1분봉: 실제 1분 단위 데이터 생성 (9:00 ~ 15:30)
        return data
          .map((item, index) => {
            const date = new Date(startDate);
            date.setMinutes(date.getMinutes() + index);
            return {
              ...item,
              date: formatChartDate(date),
              periodType: 'MINUTE' as const,
            };
          })
          .slice(0, 390); // 6시간 30분

      case 'WEEK':
        // 주봉: 월~금 5일 단위로 데이터 그룹화
        return data.reduce<DataPoint[]>((acc, curr, i) => {
          if (i % 5 === 0) {
            const weekData = data.slice(i, i + 5);
            if (weekData.length > 0) {
              const weekDate = new Date(weekData[0].date);
              acc.push({
                ...curr,
                periodType: 'WEEK' as const,
                volume: weekData.reduce((sum, item) => sum + item.volume, 0),
                high: Math.max(...weekData.map((item) => item.high)),
                low: Math.min(...weekData.map((item) => item.low)),
                open: weekData[0].open,
                close: weekData[weekData.length - 1].close,
                date: formatChartDate(weekDate),
              });
            }
          }
          return acc;
        }, []);

      case 'MONTH': {
        // 월봉: 실제 월 단위로 데이터 그룹화
        const monthlyGroups = data.reduce<Record<string, DataPoint[]>>((groups, item) => {
          const date = new Date(item.date);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(item);
          return groups;
        }, {});

        const monthlyResult = Object.entries(monthlyGroups)
          .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
          .map(([_key, group]) => {
            const monthDate = new Date(group[0].date);
            return {
              ...group[0],
              periodType: 'MONTH' as const,
              volume: group.reduce((sum, item) => sum + item.volume, 0),
              high: Math.max(...group.map((item) => item.high)),
              low: Math.min(...group.map((item) => item.low)),
              open: group[0].open,
              close: group[group.length - 1].close,
              date: formatChartDate(monthDate),
            };
          });
        return monthlyResult;
      }

      case 'DAY':
      default:
        // 일봉: 하루 단위 데이터 그대로 사용
        return data.map((item) => ({
          ...item,
          date: formatChartDate(new Date(item.date)),
          periodType: 'DAY' as const,
        }));
    }
  }, [period, data, formatChartDate]);

  const formatKoreanNumber = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.floor(value));
  };

  const formatVolumeNumber = (value: number) => {
    if (value >= 1000000000) {
      return `${Math.floor(value / 1000000000)}B`;
    } else if (value >= 1000000) {
      return `${Math.floor(value / 1000000)}M`;
    } else if (value >= 1000) {
      return `${Math.floor(value / 1000)}K`;
    } else {
      return formatKoreanNumber(value);
    }
  };

  const calculateEMA = (data: number[], period: number): number[] => {
    const k = 2 / (period + 1);
    const emaData: number[] = [];
    let prevEma = data[0];

    for (let i = 0; i < data.length; i++) {
      const currentPrice = data[i];
      const currentEma = i === 0 ? currentPrice : Math.floor(currentPrice * k + prevEma * (1 - k));
      emaData.push(currentEma);
      prevEma = currentEma;
    }

    return emaData;
  };

  const chartData = getData();
  const closePrices = chartData.map((item) => Math.floor(item.close));
  const ema5Data = calculateEMA(closePrices, 5);
  const ema20Data = calculateEMA(closePrices, 20);
  const currentData = chartData[chartData.length - 1];
  const changePercent = ((currentData.change || 0) / (currentData.prevClose || 1)) * 100;

  // ECharts 옵션 설정
  const option: EChartsOption = {
    animation: false,
    backgroundColor: '#131722',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: 'rgba(255, 255, 255, 0.3)',
        },
        label: {
          show: false,
        },
      },
      backgroundColor: 'rgba(19, 23, 34, 0.9)',
      borderColor: '#2e3947',
      textStyle: {
        color: '#fff',
      },
      formatter: (params: any) => {
        const candleData = params.find((p: any) => p.seriesName === '캔들차트');
        const ema5Data = params.find((p: any) => p.seriesName === '5일 이평선');
        const ema20Data = params.find((p: any) => p.seriesName === '20일 이평선');
        const volumeData = params.find((p: any) => p.seriesName === '거래량');

        if (!candleData) return '';

        const date = candleData.name;
        const { open, close, low, high } = candleData.data;
        const volume = volumeData?.value || 0;

        // 모든 값의 소수점 절삭
        const floorOpen = Math.floor(open);
        const floorHigh = Math.floor(high);
        const floorLow = Math.floor(low);
        const floorClose = Math.floor(close);
        const floorVolume = Math.floor(volume);
        const floorEma5 = ema5Data ? Math.floor(ema5Data.value) : 0;
        const floorEma20 = ema20Data ? Math.floor(ema20Data.value) : 0;

        return `
          <div style="font-size: 12px;">
            <div style="margin-bottom: 4px;">${date}</div>
            <div>시가: ${formatKoreanNumber(floorOpen)}원</div>
            <div>고가: ${formatKoreanNumber(floorHigh)}원</div>
            <div>저가: ${formatKoreanNumber(floorLow)}원</div>
            <div>종가: ${formatKoreanNumber(floorClose)}원</div>
            <div>MA5: ${ema5Data ? formatKoreanNumber(floorEma5) : '-'}원</div>
            <div>MA20: ${ema20Data ? formatKoreanNumber(floorEma20) : '-'}원</div>
            <div>거래량: ${formatVolumeNumber(floorVolume)}</div>
          </div>
        `;
      },
    },
    axisPointer: {
      link: [{ xAxisIndex: [0, 1] }],
      show: true,
      snap: true,
      label: {
        show: false,
      },
    },
    grid: [
      {
        left: '5%',
        right: '5%',
        top: 40,
        bottom: '25%',
        height: '65%',
        show: true,
        borderColor: '#2e3947',
        backgroundColor: 'transparent',
        containLabel: true,
      },
      {
        left: '5%',
        right: '5%',
        top: '80%',
        bottom: 30,
        height: '15%',
        show: true,
        borderColor: '#2e3947',
        backgroundColor: 'transparent',
        containLabel: true,
      },
    ],
    xAxis: [
      {
        type: 'category' as const,
        data: chartData.map((item) => item.date),
        axisLine: { lineStyle: { color: '#2e3947' } },
        axisLabel: {
          show: false,
          color: '#CCCCCC',
        },
        splitLine: {
          show: true,
          lineStyle: { color: 'rgba(100, 100, 100, 0.4)' },
        },
        axisTick: {
          show: false,
        },
        axisPointer: {
          show: false,
        },
        boundaryGap: true,
      },
      {
        type: 'category' as const,
        gridIndex: 1,
        data: chartData.map((item) => item.date),
        axisLine: { lineStyle: { color: '#2e3947' } },
        axisLabel: {
          show: true,
          color: '#CCCCCC',
          margin: 12,
          formatter: (value: string, index: number) => {
            const isBold = isFirstOfPeriod(value, index);
            return isBold ? `{bold|${value}}` : value;
          },
          rich: {
            bold: {
              fontWeight: 'bold',
              fontSize: 12,
            },
          },
        },
        splitLine: {
          show: true,
          lineStyle: { color: 'rgba(100, 100, 100, 0.4)' },
        },
        axisTick: {
          show: true,
          alignWithLabel: true,
        },
        axisPointer: {
          show: true,
        },
        boundaryGap: true,
      },
    ],
    yAxis: [
      {
        position: 'right',
        scale: true,
        splitLine: {
          show: true,
          lineStyle: { color: 'rgba(100, 100, 100, 0.4)' },
        },
        axisLine: { lineStyle: { color: '#2e3947' } },
        axisLabel: {
          color: '#CCCCCC',
          formatter: (value: number) => {
            // 소수점 절삭
            const floorValue = Math.floor(value);
            return formatKoreanNumber(floorValue);
          },
        },
      },
      {
        position: 'right',
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLine: { lineStyle: { color: '#2e3947' } },
        axisLabel: {
          color: '#CCCCCC',
          formatter: (value: number) => {
            // 소수점 절삭
            const floorValue = Math.floor(value);
            return formatVolumeNumber(floorValue);
          },
        },
        splitLine: {
          show: true,
          lineStyle: { color: 'rgba(100, 100, 100, 0.4)' },
        },
      },
    ],
    dataZoom: [
      {
        type: 'inside' as const,
        xAxisIndex: [0, 1],
        start: 0,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        preventDefaultMouseMove: false,
        filterMode: 'filter',
      },
      {
        type: 'slider' as const,
        xAxisIndex: [0, 1],
        show: true,
        height: 20,
        bottom: 0,
        start: 0,
        end: 100,
        borderColor: '#2e3947',
        fillerColor: 'rgba(38, 43, 54, 0.5)',
        textStyle: {
          color: '#CCCCCC',
        },
        handleStyle: {
          color: '#8392a5',
        },
        filterMode: 'filter',
      },
    ],
    series: [
      {
        name: '캔들차트',
        type: 'candlestick' as const,
        data: chartData.map((item) => [
          Math.floor(item.open),
          Math.floor(item.close),
          Math.floor(item.low),
          Math.floor(item.high),
        ]),
        itemStyle: {
          color: RISE_COLOR,
          color0: FALL_COLOR,
          borderColor: RISE_COLOR,
          borderColor0: FALL_COLOR,
        },
        barWidth: '30%',
      },
      {
        name: '5일 이평선',
        type: 'line' as const,
        data: ema5Data,
        smooth: true,
        lineStyle: {
          opacity: 0.8,
          color: '#f6c85d',
          width: 1,
        },
        symbol: 'none',
      },
      {
        name: '20일 이평선',
        type: 'line' as const,
        data: ema20Data,
        smooth: true,
        lineStyle: {
          opacity: 0.8,
          color: '#8b62d9',
          width: 1,
        },
        symbol: 'none',
      },
      {
        name: '거래량',
        type: 'bar' as const,
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: chartData.map((item) => Math.floor(item.volume)),
        itemStyle: {
          color: (params: any) => {
            const item = chartData[params.dataIndex];
            return item.changeType === 'RISE' ? RISE_COLOR : FALL_COLOR;
          },
        },
        barWidth: '30%',
      },
    ],
  };

  return (
    <div className="flex h-full w-full flex-col bg-modal-background-color">
      <div className="mb-4 flex items-center gap-4 p-4 text-sm text-white">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{currentData.stockName || '삼성전자'}</span>
            <span className="text-xs text-gray-400">{currentData.stockCode || '005930'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{formatKoreanNumber(currentData.close)}원</span>
            <span className={currentData.changeType === 'RISE' ? 'text-red-500' : 'text-blue-500'}>
              {currentData.change && currentData.change > 0 ? '+' : ''}
              {formatKoreanNumber(currentData.change || 0)}원 ({Math.floor(changePercent)}%)
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            className={`rounded px-4 py-2 ${period === 'MINUTE' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setPeriod('MINUTE')}
          >
            1분
          </button>
          <button
            className={`rounded px-4 py-2 ${period === 'DAY' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setPeriod('DAY')}
          >
            일
          </button>
          <button
            className={`rounded px-4 py-2 ${period === 'WEEK' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setPeriod('WEEK')}
          >
            주
          </button>
          <button
            className={`rounded px-4 py-2 ${period === 'MONTH' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setPeriod('MONTH')}
          >
            월
          </button>
        </div>
      </div>
      <ReactECharts
        option={option}
        style={{ height: `${height}px`, width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};

export default ChartComponent;
