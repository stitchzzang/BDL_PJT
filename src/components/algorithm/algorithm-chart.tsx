import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useMemo } from 'react';

import { StockDailyData } from '@/api/types/algorithm';

// 주식 데이터 타입 정의
interface StockCandleData {
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

// 상수 정의
const RISE_COLOR = '#ef5350'; // 상승 색상 (빨간색)
const FALL_COLOR = '#1976d2'; // 하락 색상 (파란색)
const DEFAULT_DATA_ZOOM_START = 50; // 데이터줌 시작 위치
const DEFAULT_DATA_ZOOM_END = 100; // 데이터줌 종료 위치
const EMPTY_DATA_COUNT = 2; // 빈 데이터 개수 (여백용)

interface CandlestickChartProps {
  data?: StockDailyData[] | null;
  height?: number;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ data, height = 450 }) => {
  // 날짜 포맷 유틸리티 함수
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date
        .toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\. /g, '-')
        .replace(/\.$/, '');
    } catch (error) {
      console.error('날짜 형식 변환 오류:', error);
      return dateString;
    }
  };

  // 데이터 처리
  const processedData = useMemo(() => {
    // 실제 데이터 처리
    const formattedData =
      data?.map((item) => ({
        date: formatDate(item.tradingDate),
        open: item.openPrice,
        close: item.closePrice,
        low: item.lowPrice,
        high: item.highPrice,
        volume: item.accumulatedVolume,
        fiveAverage: item.fiveAverage || null,
        twentyAverage: item.twentyAverage || null,
        changeType: item.closePrice >= item.openPrice ? 'RISE' : 'FALL',
      })) || []; // 기본값을 빈 배열로 설정

    // 공간 확보를 위한 빈 데이터 추가
    const emptyData = Array(EMPTY_DATA_COUNT)
      .fill(null)
      .map(() => ({
        date: '',
        open: 0,
        close: 0,
        low: 0,
        high: 0,
        volume: 0,
        fiveAverage: null,
        twentyAverage: null,
        changeType: 'NONE' as const,
      }));

    return [...formattedData, ...emptyData];
  }, [data]);

  // X축 데이터 (날짜)
  const xAxisData = useMemo(() => {
    return processedData.map((item) => item.date);
  }, [processedData]);

  // 캔들 데이터
  const candleData = useMemo(() => {
    return processedData.map((item) => [item.open, item.close, item.low, item.high]);
  }, [processedData]);

  // 거래량 데이터
  const volumeData = useMemo(() => {
    return processedData.map((item) => item.volume);
  }, [processedData]);

  // 이동평균선 데이터
  const ema5Data = useMemo(() => {
    return processedData.map((item) => item.fiveAverage);
  }, [processedData]);

  const ema20Data = useMemo(() => {
    return processedData.map((item) => item.twentyAverage);
  }, [processedData]);

  // 거래량 바 색상 결정 함수
  const getVolumeColor = (dataIndex: number) => {
    const item = processedData[dataIndex];
    if (!item || item.changeType === 'NONE') return FALL_COLOR;
    return item.changeType === 'RISE' ? RISE_COLOR : FALL_COLOR;
  };

  // 숫자 포맷팅 (한국어)
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('ko-KR').format(Math.floor(value));
  };

  // 거래량 포맷팅 (K, M, B)
  const formatVolume = (value: number): string => {
    if (value >= 1000000000) {
      return `${Math.floor(value / 1000000000)}B`;
    } else if (value >= 1000000) {
      return `${Math.floor(value / 1000000)}M`;
    } else if (value >= 1000) {
      return `${Math.floor(value / 1000)}K`;
    }
    return formatNumber(value);
  };

  // 툴팁 포맷터
  const tooltipFormatter = (params: any): string => {
    if (!params || params.length === 0) return '데이터 없음';

    const { dataIndex } = params[0];
    const item = processedData[dataIndex];

    if (!item || !item.date) return '데이터 없음';

    const { date, open, close, low, high, volume, fiveAverage, twentyAverage } = item;
    const priceColor = close >= open ? RISE_COLOR : FALL_COLOR;
    const priceChangePercent = open > 0 ? (((close - open) / open) * 100).toFixed(2) : '0.00';
    const priceChangeText = close >= open ? `+${priceChangePercent}%` : `${priceChangePercent}%`;

    return `
      <div class="max-w-md rounded-xl overflow-hidden">
        <div class="">
          <div class="flex flex-col justify-between mb-3 border-b border-gray-200 pb-2">
            <div class="text-base font-semibold text-gray-800">주식 정보</div>
            <div class="text-sm text-gray-500">${date}</div>
          </div>

          <div class="mb-3">
            <div class="flex justify-between items-center mb-1">
              <span class="text-gray-600">시가</span>
              <span class="font-medium">${formatNumber(open)}원</span>
            </div>
            <div class="flex justify-between items-start mb-1">
              <span class="text-gray-600">종가</span>
              <div class="flex flex-col justify-between items-center">
                <span class="font-medium">${formatNumber(close)}원</span>
                <span style="color: ${priceColor};" class="ml-2 text-xs font-medium">${priceChangeText}</span>
              </div>
            </div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-gray-600">저가</span>
              <span class="font-medium">${formatNumber(low)}원</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">고가</span>
              <span class="font-medium">${formatNumber(high)}원</span>
            </div>
          </div>

          <div class="mb-3 pt-2 border-t border-gray-200">
            <div class="flex justify-between items-center mb-1 gap-5">
              <span class="text-gray-600">5일 이평선</span>
              <span class="font-medium">${fiveAverage ? formatNumber(fiveAverage) + '원' : '-'}</span>
            </div>
            <div class="flex justify-between items-center gap-5">
              <span class="text-gray-600">20일 이평선</span>
              <span class="font-medium">${twentyAverage ? formatNumber(twentyAverage) + '원' : '-'}</span>
            </div>
          </div>

          <div class="pt-2 border-t border-gray-200">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">거래량</span>
              <span class="font-medium">${formatVolume(volume)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // Y축 범위 계산
  const yAxisRange = useMemo(() => {
    // 빈 데이터 제외
    const validData = processedData.filter((item) => item.high > 0);

    if (validData.length === 0) return { min: 0, max: 1 };

    const prices = validData.flatMap((item) => [item.high, item.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    const margin = range * 0.05; // 5% 여백

    return {
      min: Math.max(0, min - margin),
      max: max + margin,
    };
  }, [processedData]);

  // 마지막 유효 데이터 찾기
  const lastValidData = useMemo(() => {
    const validData = processedData.filter((item) => item.date);
    return validData.length > 0 ? validData[validData.length - 1] : null;
  }, [processedData]);

  // 차트 옵션
  const option: EChartsOption = useMemo(() => {
    // 마지막 종가
    const latestPrice = lastValidData ? lastValidData.close : 0;

    // 상승/하락 여부 확인
    const isRising = lastValidData ? lastValidData.close >= lastValidData.open : false;
    const priceColor = isRising ? RISE_COLOR : FALL_COLOR;

    return {
      animation: false,
      backgroundColor: '#0D192B',
      textStyle: {
        fontFamily:
          'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
          label: {
            backgroundColor: '#1976d2',
            fontFamily:
              'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
          },
        },
        formatter: tooltipFormatter,
        textStyle: {
          fontFamily:
            'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
        },
      },
      axisPointer: {
        link: [{ xAxisIndex: [0, 1] }],
        label: {
          backgroundColor: '#1976d2',
          fontFamily:
            'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
        },
      },
      grid: [
        {
          left: '1%',
          right: '8%',
          bottom: '45%',
          top: '5%',
          height: '50%',
          containLabel: false,
        },
        {
          left: '1%',
          right: '8%',
          top: '65%',
          bottom: '5%',
          height: '15%',
          containLabel: false,
        },
      ],
      xAxis: [
        {
          type: 'category',
          data: xAxisData,
          boundaryGap: true,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(84, 84, 84, 0.1)',
              width: 1,
            },
          },
          splitNumber: 20,
          min: 'dataMin',
          max: 'dataMax',
          axisPointer: {
            label: {
              formatter: (params: any) => {
                return String(params.value);
              },
              fontFamily:
                'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
            },
          },
          axisLabel: {
            margin: 8,
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily:
              'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
            formatter: (value: string) => value,
          },
        },
        {
          type: 'category',
          gridIndex: 1,
          data: xAxisData,
          boundaryGap: true,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(84, 84, 84, 0.1)',
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
          min: yAxisRange.min,
          max: yAxisRange.max,
          splitArea: {
            show: false,
          },
          axisLabel: {
            inside: false,
            margin: 8,
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily:
              'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
          },
          position: 'right',
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(84, 84, 84, 0.1)',
              width: 1,
            },
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(204, 204, 204, 0.1)',
            },
          },
          axisPointer: {
            label: {
              formatter: (params: any) => {
                return formatNumber(Number(params.value));
              },
              fontFamily:
                'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
            },
          },
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          max: function (value: any) {
            return value.max * 3; // 최대값의 3배로 설정하여 그래프 높이를 1/3로 줄임
          },
          axisLabel: {
            show: true,
            inside: false,
            margin: 8,
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily:
              'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
            formatter: (value: number | string) => {
              return formatVolume(Number(value));
            },
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: 'rgba(204, 204, 204, 0.1)',
            },
          },
          axisTick: { show: false },
          splitLine: {
            show: false,
          },
          position: 'right',
          axisPointer: {
            label: {
              formatter: (params: any) => {
                return formatVolume(Number(params.value));
              },
              fontFamily:
                'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
            },
          },
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: DEFAULT_DATA_ZOOM_START,
          end: DEFAULT_DATA_ZOOM_END,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          maxSpan: 100,
          textStyle: {
            fontFamily:
              'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
          },
        },
      ],
      series: [
        {
          name: '캔들',
          type: 'candlestick',
          data: candleData,
          itemStyle: {
            color: RISE_COLOR,
            color0: FALL_COLOR,
            borderColor: RISE_COLOR,
            borderColor0: FALL_COLOR,
          },
          // 최신값이 있을 때만 markLine 표시
          ...(lastValidData && {
            markLine: {
              symbol: 'none',
              lineStyle: {
                color: priceColor,
                type: 'solid',
                width: 1,
                opacity: 0.7,
              },
              label: {
                show: true,
                position: 'end',
                formatter: () => {
                  return formatNumber(latestPrice);
                },
                backgroundColor: priceColor,
                color: '#FFFFFF',
                padding: [6, 10],
                borderRadius: 3,
                fontSize: 14,
                fontWeight: 'bold',
                fontFamily:
                  'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
              },
              data: [
                {
                  name: '최신값',
                  yAxis: latestPrice,
                },
              ],
            },
          }),
        },
        {
          name: '거래량',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumeData,
          itemStyle: {
            color: (params) => getVolumeColor(params.dataIndex),
          },
        },
        {
          name: '5일 이평선',
          type: 'line',
          data: ema5Data,
          smooth: true,
          lineStyle: {
            opacity: 0.5,
            color: '#FFA500',
            width: 1,
          },
          symbol: 'none',
          z: 1,
        },
        {
          name: '20일 이평선',
          type: 'line',
          data: ema20Data,
          smooth: true,
          lineStyle: {
            opacity: 0.5,
            color: '#4169E1',
            width: 1,
          },
          symbol: 'none',
          z: 1,
        },
      ],
    };
  }, [xAxisData, candleData, volumeData, ema5Data, ema20Data, yAxisRange, lastValidData]);

  return (
    <div className="relative">
      <div
        className="flex h-full w-full flex-col rounded-2xl"
        style={{ backgroundColor: '#0D192B' }}
      >
        <ReactECharts
          option={option}
          style={{ height: `${height}px` }}
          notMerge={true}
          lazyUpdate={false}
        />
      </div>
    </div>
  );
};

// App 컴포넌트
export const CandlestickAlgorithmChart: React.FC<CandlestickChartProps> = ({
  data,
  height = 440,
}) => {
  return (
    <div className="h-full w-full rounded-xl bg-modal-background-color p-2">
      <div className="my-2">
        <h1 className="text-[14px] font-bold">주식 차트</h1>
      </div>
      <CandlestickChart data={data} height={height} />
    </div>
  );
};
