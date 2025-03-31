import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useStockDailyData } from '@/api/stock.api';

// 타입 정의
interface StockPeriodData {
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
  periodType: number; // 1: 일봉, 2: 주봉, 3: 월봉
  fiveAverage: number;
  twentyAverage: number;
}

interface StockPeriodDefaultData {
  companyId: string;
  limit: number;
  cursor: string;
  data: StockPeriodData[];
}

interface ApiResponse<T> {
  isSuccess: boolean;
  code: number;
  message: string;
  result: T;
}

// 차트 데이터 포인트 타입
interface ChartDataPoint {
  date: string; // 날짜 표시용
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changeType: 'RISE' | 'FALL' | 'NONE';
  fiveAverage: number | null;
  twentyAverage: number | null;
  rawDate: Date | null;
}

// PeriodType enum 정의
enum PeriodType {
  Day = 1,
  Week = 2,
  Month = 3,
}

interface PeriodChartProps {
  companyId?: string;
  height?: number;
  initialLimit?: number;
  initialData?: StockPeriodDefaultData;
  onLoadMoreData?: (cursor: string) => Promise<StockPeriodDefaultData | null>;
  // 일/주/월 구분을 위한 props 추가
  periodType: 'day' | 'week' | 'month';
  apiBaseUrl?: string; // API 기본 URL (옵션)
}

// 상수 정의
const RISE_COLOR = '#ef5350'; // 상승 색상 (빨간색)
const FALL_COLOR = '#1976d2'; // 하락 색상 (파란색)
const DEFAULT_DATA_ZOOM_START = 50; // 데이터줌 시작 위치
const DEFAULT_DATA_ZOOM_END = 100; // 데이터줌 종료 위치
const EMPTY_DATA_COUNT = 10; // 빈 데이터 개수 (여백용)
const Y_AXIS_MARGIN_PERCENT = 5; // Y축 여백 비율 (%)

// periodType 문자열을 PeriodType 열거형으로 변환하는 함수
const convertPeriodTypeToEnum = (periodType: 'day' | 'week' | 'month'): PeriodType => {
  switch (periodType) {
    case 'day':
      return PeriodType.Day;
    case 'week':
      return PeriodType.Week;
    case 'month':
      return PeriodType.Month;
    default:
      return PeriodType.Day; // 기본값은 일봉
  }
};

// 커스텀 비교 함수
const arePropsEqual = (prevProps: PeriodChartProps, nextProps: PeriodChartProps) => {
  // 기본 props 비교
  if (prevProps.height !== nextProps.height) return false;
  if (prevProps.companyId !== nextProps.companyId) return false;
  if (prevProps.initialLimit !== nextProps.initialLimit) return false;
  if (prevProps.periodType !== nextProps.periodType) return false;
  if (prevProps.apiBaseUrl !== nextProps.apiBaseUrl) return false;

  // initialData 비교 - 커서와 companyId만 비교
  if (prevProps.initialData?.cursor !== nextProps.initialData?.cursor) return false;
  if (prevProps.initialData?.companyId !== nextProps.initialData?.companyId) return false;

  // 함수 참조는 비교하지 않음 (useCallback으로 메모이제이션 권장)
  return true;
};

const PeriodChartComponent: React.FC<PeriodChartProps> = ({
  companyId,
  height = 600,
  initialLimit = 100,
  initialData,
  onLoadMoreData,
  periodType = 'day', // 기본값은 일봉
  apiBaseUrl = '/api',
}) => {
  // 초기 데이터 (일별 데이터)
  const { data: stockDailyData, isLoading, isError } = useStockDailyData(1, 1, 50);

  // 상태 관리
  const [chartData, setChartData] = useState<StockPeriodDefaultData | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataZoomRange, setDataZoomRange] = useState({
    start: DEFAULT_DATA_ZOOM_START,
    end: DEFAULT_DATA_ZOOM_END,
  });
  const chartRef = useRef<ReactECharts>(null);
  const [cursorValue, setCursorValue] = useState<string>(initialData?.cursor || '0');
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);

  // 초기 데이터 설정
  useEffect(() => {
    if (stockDailyData) {
      setChartData(stockDailyData.result);
      setCursorValue(stockDailyData.result.cursor);
      setHasMoreData(true); // 초기 데이터 설정 시 더 많은 데이터가 있을 수 있음
    }
  }, [stockDailyData]);

  // 주기 타입에 따른 차트 제목 설정
  const getChartTitle = useCallback(() => {
    switch (periodType) {
      case 'day':
        return '일봉 차트';
      case 'week':
        return '주봉 차트';
      case 'month':
        return '월봉 차트';
      default:
        return '주가 차트';
    }
  }, [periodType]);

  // 날짜 포맷 유틸리티 함수
  const formatDate = useCallback((dateString: string, type: 'day' | 'week' | 'month'): string => {
    try {
      const date = new Date(dateString);

      switch (type) {
        case 'day':
          // 일별 포맷: YYYY-MM-DD
          return date
            .toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
            .replace(/\. /g, '-')
            .replace(/\.$/, '');

        case 'week': {
          // 주별 포맷: YYYY-MM월 W주차
          const weekNumber = Math.ceil(
            (date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7,
          );
          return `${date.getFullYear()}-${date.getMonth() + 1}월 ${weekNumber}주차`;
        }

        case 'month':
          // 월별 포맷: YYYY-MM
          return date
            .toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
            })
            .replace(/\. /g, '-')
            .replace(/\.$/, '');

        default:
          return dateString;
      }
    } catch (error) {
      console.error('날짜 형식 변환 오류:', error);
      return dateString; // 오류 발생 시 원본 문자열 반환
    }
  }, []);

  // 주기별 데이터를 차트 데이터 포인트로 변환하는 함수
  const processChartData = useCallback(
    (data: StockPeriodData[]): ChartDataPoint[] => {
      if (!data || data.length === 0) return [];

      return data.map((item): ChartDataPoint => {
        // 날짜 변환
        const date = new Date(item.tradingDate);

        return {
          date: formatDate(item.tradingDate, periodType),
          open: item.openPrice,
          high: item.highPrice,
          low: item.lowPrice,
          close: item.closePrice,
          volume: item.accumulatedVolume,
          changeType: item.closePrice >= item.openPrice ? 'RISE' : 'FALL',
          fiveAverage: item.fiveAverage || null,
          twentyAverage: item.twentyAverage || null,
          rawDate: date,
        };
      });
    },
    [formatDate, periodType],
  );

  // 차트 데이터 준비
  const processedChartData = useMemo(() => {
    if (!chartData?.data) {
      return [];
    }

    // 실제 데이터 변환
    const realData = processChartData(chartData.data);

    // 빈 데이터 추가 (차트 오른쪽 공간 확보)
    const emptyData: ChartDataPoint[] = Array(EMPTY_DATA_COUNT)
      .fill(null)
      .map(() => ({
        date: '',
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0,
        changeType: 'NONE',
        fiveAverage: null,
        twentyAverage: null,
        rawDate: null,
      }));

    // 데이터 반환 - 역순으로 정렬 (날짜순으로)
    return [...realData.reverse(), ...emptyData];
  }, [chartData, processChartData]);

  // X축 라벨 생성
  const xAxisLabels = useMemo(() => {
    return processedChartData.map((item) => item.date);
  }, [processedChartData]);

  // 캔들 데이터 생성
  const candleData = useMemo(() => {
    return processedChartData.map((item) => [
      item.open || 0,
      item.close || 0,
      item.low || 0,
      item.high || 0,
    ]);
  }, [processedChartData]);

  // 거래량 데이터 생성
  const volumeData = useMemo(() => {
    return processedChartData.map((item) => item.volume || 0);
  }, [processedChartData]);

  // 이동평균선 데이터
  const ema5Data = useMemo(() => {
    return processedChartData.map((item) => item.fiveAverage);
  }, [processedChartData]);

  const ema20Data = useMemo(() => {
    return processedChartData.map((item) => item.twentyAverage);
  }, [processedChartData]);

  // 현재 보이는 데이터 범위에 따라 Y축 범위를 계산하는 함수
  const getVisibleDataRange = useCallback(() => {
    if (processedChartData.length === 0) return { min: 0, max: 1 };

    // 데이터줌 범위 계산 (백분율을 실제 인덱스로 변환)
    const dataLength = processedChartData.length - EMPTY_DATA_COUNT;
    const startIdx = Math.max(0, Math.floor((dataLength * dataZoomRange.start) / 100));
    const endIdx = Math.min(dataLength - 1, Math.floor((dataLength * dataZoomRange.end) / 100));

    // 현재 보이는 데이터 추출
    const visibleData = processedChartData.slice(startIdx, endIdx + 1);

    // 빈 데이터나 무효한 가격 제외
    const prices = visibleData
      .filter((item) => item.high > 0) // 빈 데이터 제외
      .flatMap((item) => [item.high, item.low]);

    if (prices.length === 0) return { min: 0, max: 1 };

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;

    // 여백 추가 (범위의 Y_AXIS_MARGIN_PERCENT %)
    const margin = range * (Y_AXIS_MARGIN_PERCENT / 100);
    return {
      min: Math.max(0, min - margin),
      max: max + margin,
    };
  }, [processedChartData, dataZoomRange]);

  // yAxisRange 계산
  const yAxisRange = useMemo(() => getVisibleDataRange(), [getVisibleDataRange]);

  // 색상 스타일 가져오기
  const getItemStyle = useCallback(
    (params: any) => {
      const item = processedChartData[params.dataIndex];
      if (!item) return FALL_COLOR;
      return item.open <= item.close ? RISE_COLOR : FALL_COLOR;
    },
    [processedChartData],
  );

  // 숫자 포맷팅 (한국어)
  const formatKoreanNumber = useCallback((value: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.floor(value));
  }, []);

  // 거래량 숫자 포맷팅 (K, M, B)
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

  // 툴팁 포맷터
  const tooltipFormatter = useCallback(
    (params: any): string => {
      if (!params || params.length === 0) return '데이터 없음';

      const { dataIndex } = params[0];
      const item = processedChartData[dataIndex] as ChartDataPoint;

      if (!item) return '데이터 없음';

      // 빈 데이터 구간 제외
      if (dataIndex >= processedChartData.length - EMPTY_DATA_COUNT || !item.date) {
        return '데이터 없음';
      }

      const { date, open, close, low, high, volume, fiveAverage, twentyAverage } = item;

      // 색상 설정
      const priceColor = close >= open ? RISE_COLOR : FALL_COLOR;
      const priceChangePercent = open > 0 ? (((close - open) / open) * 100).toFixed(2) : '0.00';
      const priceChangeText = close >= open ? `+${priceChangePercent}%` : `${priceChangePercent}%`;

      return `
        <div class="max-w-md rounded-xl overflow-hidden">
          <div class="p-4">
            <div class="flex flex-col justify-between mb-3 border-b border-gray-200 pb-2">
              <div class="text-base font-semibold text-gray-800">주식 정보</div>
              <div class="text-sm text-gray-500">${date}</div>
            </div>

            <div class="mb-3">
              <div class="flex justify-between items-center mb-1">
                <span class="text-gray-600">시가</span>
                <span class="font-medium">${formatKoreanNumber(open)}원</span>
              </div>
              <div class="flex justify-between items-start mb-1">
                <span class="text-gray-600">종가</span>
                <div class="flex flex-col justify-between items-center">
                  <span class="font-medium">${formatKoreanNumber(close)}원</span>
                  <span style="color: ${priceColor};" class="ml-2 text-xs font-medium">${priceChangeText}</span>
                </div>
              </div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-gray-600">저가</span>
                <span class="font-medium">${formatKoreanNumber(low)}원</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">고가</span>
                <span class="font-medium">${formatKoreanNumber(high)}원</span>
              </div>
            </div>

            <div class="mb-3 pt-2 border-t border-gray-200">
              <div class="flex justify-between items-center mb-1">
                <span class="text-gray-600">5일 이평선</span>
                <span class="font-medium">${fiveAverage ? formatKoreanNumber(fiveAverage) + '원' : '-'}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">20일 이평선</span>
                <span class="font-medium">${twentyAverage ? formatKoreanNumber(twentyAverage) + '원' : '-'}</span>
              </div>
            </div>

            <div class="pt-2 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">거래량</span>
                <span class="font-medium">${formatVolumeNumber(volume)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    },
    [processedChartData, formatKoreanNumber, formatVolumeNumber],
  );

  // 데이터 줌 이벤트 처리
  const handleDataZoomChange = useCallback(
    debounce((params: any) => {
      if (!params || !params.batch || params.batch.length === 0) return;

      // batch 배열의 첫 번째 요소에서 start와 end 값을 가져옴
      const batchItem = params.batch[0];
      const start = batchItem?.start;
      const end = batchItem?.end;

      if (start === undefined || start === null) return;
      if (end === undefined || end === null) return;

      // 데이터 줌 범위 저장
      setDataZoomRange({
        start: start,
        end: end,
      });

      // Y축 범위 업데이트를 위해 차트 인스턴스 접근
      if (chartRef.current) {
        const chartInstance = chartRef.current.getEchartsInstance();
        if (chartInstance) {
          // Y축 범위 다시 계산
          const newRange = getVisibleDataRange();

          // 차트 옵션 업데이트
          chartInstance.setOption({
            yAxis: [
              {
                min: newRange.min,
                max: newRange.max,
              },
              {}, // 두 번째 yAxis는 그대로 유지
            ],
          });
        }
      }

      // 왼쪽 경계에 도달했을 때 추가 데이터 로드
      if (start <= 5) {
        alert('hello');
      }
    }, 300),
    [getVisibleDataRange, hasMoreData, loading],
  );

  // useEffect: 데이터가 변경될 때마다 Y축 범위 업데이트
  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      if (chartInstance) {
        // Y축 범위 다시 계산
        const newRange = getVisibleDataRange();

        // 차트 옵션 업데이트
        chartInstance.setOption({
          yAxis: [
            {
              min: newRange.min,
              max: newRange.max,
            },
            {}, // 두 번째 yAxis는 그대로 유지
          ],
        });
      }
    }
  }, [processedChartData, getVisibleDataRange]);

  // 컴포넌트 마운트 시 데이터줌 이벤트 리스너 등록
  useEffect(() => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      if (chartInstance) {
        // 기존 이벤트 리스너 제거 후 다시 등록
        chartInstance.off('datazoom');
        chartInstance.on('datazoom', handleDataZoomChange);
      }
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 정리
    return () => {
      if (chartRef.current) {
        const chartInstance = chartRef.current.getEchartsInstance();
        if (chartInstance) {
          chartInstance.off('datazoom', handleDataZoomChange);
        }
      }
    };
  }, [handleDataZoomChange]);

  // option useMemo 전에 lastValidData 계산을 컴포넌트 레벨로 올립니다
  const lastValidIndex = processedChartData.findIndex((item) => item.date === '');
  const dataEndIndex =
    lastValidIndex > 0 ? lastValidIndex - 1 : processedChartData.length - EMPTY_DATA_COUNT - 1;
  const lastValidData = dataEndIndex >= 0 ? processedChartData[dataEndIndex] : null;

  // 차트 옵션 설정
  const option: EChartsOption = useMemo(() => {
    // 마지막 캔들 스틱 데이터
    const latestCandle = lastValidData
      ? [lastValidData.open, lastValidData.close, lastValidData.low, lastValidData.high]
      : null;

    // 마지막 종가
    const latestPrice = latestCandle ? latestCandle[1] : 0;

    // 상승/하락 여부 확인
    const isRising = latestCandle && latestCandle[1] >= latestCandle[0];
    const priceColor = isRising ? RISE_COLOR : FALL_COLOR;

    return {
      title: {
        text: getChartTitle(),
        left: 'center',
        textStyle: {
          color: '#FFFFFF',
          fontSize: 16,
          fontFamily:
            'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
        },
        top: 10,
      },
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
        link: [{ xAxisIndex: 'all' }],
        label: {
          backgroundColor: '#1976d2',
          fontFamily:
            'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
        },
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
          top: '65%',
          height: '15%',
          containLabel: false,
        },
      ],
      xAxis: [
        {
          type: 'category',
          data: xAxisLabels,
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
              formatter: (params) => {
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
            rotate: periodType === 'day' ? 0 : 30, // 일봉은 회전 없이, 주/월봉은 30도 회전
          },
        },
        {
          type: 'category',
          gridIndex: 1,
          data: xAxisLabels,
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
          min: yAxisRange.min, // 계산된 최소값
          max: yAxisRange.max, // 계산된 최대값
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
              color: 'rgba(255, 255, 255, 0.3)',
            },
          },
          axisPointer: {
            label: {
              formatter: (params) => {
                return new Intl.NumberFormat('ko-KR').format(Math.floor(Number(params.value)));
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
          max: function (value) {
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
              const numValue = Number(value);
              if (numValue >= 1000000000) {
                return `${Math.floor(numValue / 1000000000)}B`;
              } else if (numValue >= 1000000) {
                return `${Math.floor(numValue / 1000000)}M`;
              } else if (numValue >= 1000) {
                return `${Math.floor(numValue / 1000)}K`;
              }
              return String(Math.floor(numValue));
            },
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
          axisPointer: {
            label: {
              formatter: (params) => {
                const value = Number(params.value);
                if (value >= 1000000000) {
                  return `${Math.floor(value / 1000000000)}B`;
                } else if (value >= 1000000) {
                  return `${Math.floor(value / 1000000)}M`;
                } else if (value >= 1000) {
                  return `${Math.floor(value / 1000)}K`;
                }
                return String(Math.floor(value));
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
          start: dataZoomRange.start,
          end: dataZoomRange.end,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          textStyle: {
            fontFamily:
              'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
          },
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          bottom: '10%',
          start: dataZoomRange.start,
          end: dataZoomRange.end,
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
          ...(latestCandle && {
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
                formatter: (params) => {
                  return new Intl.NumberFormat('ko-KR').format(Math.floor(Number(params.value)));
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
                  // x축 값을 완전히 생략하여 전체 차트에 수평선으로 표시
                  label: {
                    formatter: () => {
                      return new Intl.NumberFormat('ko-KR').format(Math.floor(latestPrice));
                    },
                  },
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
            color: getItemStyle,
          },
        },
        {
          name: '5이평선',
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
          label: {
            fontFamily:
              'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
          },
        },
        {
          name: '20이평선',
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
          label: {
            fontFamily:
              'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
          },
        },
      ],
    };
  }, [
    xAxisLabels,
    candleData,
    volumeData,
    ema5Data,
    ema20Data,
    getItemStyle,
    dataZoomRange,
    tooltipFormatter,
    yAxisRange,
    periodType,
    getChartTitle,
    processedChartData,
    formatKoreanNumber,
    lastValidData,
  ]);

  return (
    <div className="relative">
      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl"
        style={{ backgroundColor: '#0D192B' }}
      >
        <div className="flex items-center gap-4 p-4 text-sm text-white">
          <div className="mr-auto">
            <h3 className="text-lg font-bold">{getChartTitle()}</h3>
            {lastValidData && <p>최근 종가: {formatKoreanNumber(lastValidData.close || 0)}원</p>}
          </div>
          <div className="flex gap-2">{/* 기간 전환 버튼 또는 컨트롤 표시 영역 */}</div>
          {loading && <div className="text-blue-400">추가 데이터 로딩 중...</div>}
          {error && <div className="text-red-400">{error}</div>}
        </div>

        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: `${height}px` }}
          onEvents={{
            datazoom: handleDataZoomChange,
            rendered: () => console.log('차트 렌더링 완료'),
          }}
          notMerge={true}
          lazyUpdate={false}
        />
      </div>
    </div>
  );
}; // PeriodChartComponent 함수 닫기

// React.memo를 사용하여 컴포넌트 메모이제이션 - 컴포넌트 정의 밖에 위치
export const DailyChart = React.memo<PeriodChartProps>(PeriodChartComponent, arePropsEqual);
