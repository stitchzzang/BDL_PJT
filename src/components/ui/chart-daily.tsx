import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { _ky } from '@/api/instance';
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
  closeCheck: number;
  closePricePercent: number;
  volume: number;
  changeType: 'RISE' | 'FALL' | 'NONE';
  fiveAverage: number | null;
  twentyAverage: number | null;
  rawDate: Date | null;
  lowPricePercent: number | null;
}

// PeriodType enum 정의
enum PeriodType {
  Day = 1,
  Week = 2,
  Month = 3,
}

interface PeriodChartProps {
  companyId?: number;
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
  height = 450,
  initialLimit = 100,
  initialData,
  onLoadMoreData,
  periodType = 'day', // 기본값은 일봉
  apiBaseUrl = '/api',
}) => {
  // 초기 데이터 (일별 데이터)
  const { data: stockDailyData, isLoading, isError } = useStockDailyData(companyId ?? 1, 1, 50);

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
          closeCheck: item.closePricePercent,
          closePricePercent: item.closePricePercent,
          volume: item.accumulatedVolume,
          changeType: item.closePrice >= item.openPrice ? 'RISE' : 'FALL',
          fiveAverage: item.fiveAverage || null,
          twentyAverage: item.twentyAverage || null,
          rawDate: date,
          lowPricePercent: item.lowPricePercent,
        };
      });
    },
    [formatDate, periodType],
  );

  // 1. 빈 데이터를 null로 설정 (MinuteChart와 동일한 방식)
  const processedChartData = useMemo(() => {
    if (!chartData?.data || chartData.data.length === 0) {
      // 데이터가 없는 경우 빈 배열 반환
      return [];
    }

    // 실제 데이터 변환
    const realData = processChartData(chartData.data);

    // 빈 데이터 추가 전에 마지막 유효한 데이터 포인트 찾기
    const lastValidDataPoint = realData.length > 0 ? realData[realData.length - 1] : null;

    // 빈 데이터 추가 (차트 오른쪽 공간 확보) - 값은 마지막 데이터의 값을 사용하거나 null로 설정
    const emptyData = Array(EMPTY_DATA_COUNT)
      .fill(null)
      .map(() => ({
        date: '',
        // 마지막 유효한 데이터가 있으면 해당 값 사용, 없으면 null
        open: null, // 이전: 0
        high: null, // 이전: 0
        low: null, // 이전: 0
        close: null, // 이전: 0
        closeCheck: null,
        volume: null, // 이전: 0
        changeType: 'NONE',
        fiveAverage: null,
        twentyAverage: null,
        rawDate: null,
        lowPricePercent: null, // 이전: 0
      }));

    // 데이터 반환 - 역순으로 정렬 (날짜순으로)
    return [...realData, ...emptyData];
  }, [chartData, processChartData]);

  // X축 라벨 생성
  const xAxisLabels = useMemo(() => {
    return processedChartData.map((item) => item.date);
  }, [processedChartData]);

  // 2. 캔들 데이터 생성 수정
  const candleData = useMemo(() => {
    return processedChartData.map((item) => {
      if (item.date === '') return [];

      // 기본 캔들 데이터
      const openValue = item.open || 0;
      const closeValue = item.close || 0;
      const lowValue = item.low || 0;
      const highValue = item.high || 0;

      // closeCheck 값에 따라 색상 결정 (값이 있을 때만)
      if (item.closeCheck !== null && item.closeCheck !== undefined) {
        if (item.closeCheck > 0) {
          // 양수일 때 - 상승으로 보이게
          return openValue <= closeValue
            ? [openValue, closeValue, lowValue, highValue] // 이미 상승 패턴
            : [closeValue, openValue, lowValue, highValue]; // 순서 바꿈
        } else {
          // 0 또는 음수일 때 - 하락으로 보이게
          return openValue >= closeValue
            ? [openValue, closeValue, lowValue, highValue] // 이미 하락 패턴
            : [closeValue, openValue, lowValue, highValue]; // 순서 바꿈
        }
      } else {
        // closeCheck 값이 없으면 실제 시가/종가 기준으로 캔들 표시
        return [openValue, closeValue, lowValue, highValue];
      }
    });
  }, [processedChartData]);
  // 3. 거래량 데이터 생성 수정
  const volumeData = useMemo(() => {
    return processedChartData.map((item) => {
      // 빈 데이터인 경우 null 반환
      if (item.date === '') return null;
      return item.volume || 0;
    });
  }, [processedChartData]);
  // 4. 이동평균선 데이터도 동일한 방식으로 수정
  const ema5Data = useMemo(() => {
    return processedChartData.map((item) => (item.date === '' ? null : item.fiveAverage));
  }, [processedChartData]);
  const ema20Data = useMemo(() => {
    return processedChartData.map((item) => (item.date === '' ? null : item.twentyAverage));
  }, [processedChartData]);

  // 색상 스타일 가져오기
  const getItemStyle = useCallback(
    (params: any) => {
      const item = processedChartData[params.dataIndex];
      if (!item) return FALL_COLOR;

      // null인 경우 기본값 설정
      const openPrice = item.open ?? 0;
      const closePrice = item.close ?? 0;
      const checkColor = item.closeCheck ?? 0;

      return checkColor > 0 ? RISE_COLOR : FALL_COLOR;
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

      const {
        date,
        open,
        close,
        low,
        high,
        volume,
        fiveAverage,
        twentyAverage,
        lowPricePercent,
        closeCheck,
        closePricePercent,
      } = item;

      // 색상 설정
      const priceColor = closeCheck > 0 ? RISE_COLOR : FALL_COLOR;
      const priceChangePercent = open > 0 ? (closePricePercent ?? 0 * 100).toFixed(2) : '0.00';
      const priceChangeText = closeCheck > 0 ? `+${priceChangePercent}%` : `${priceChangePercent}%`;

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
            <h1>이평선</h1>
              <div class="flex justify-between items-center mb-1 gap-3">
                <span class="text-gray-600">5일</span>
                <span class="font-medium">${fiveAverage ? formatKoreanNumber(fiveAverage) + '원' : '-'}</span>
              </div>
              <div class="flex justify-between items-center gap-3">
                <span class="text-gray-600">20일</span>
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

      // 왼쪽 경계에 도달했고 아직 추가 데이터가 있으며 로딩 중이 아닐 때만 요청
      if (start <= 5 && hasMoreData && !loading) {
        console.log('추가 데이터 로드 요청');
        console.log(cursorValue);

        // 직접 _ky 사용하여 API 호출
        _ky
          .get(`stocks/${companyId}/daily`, {
            searchParams: {
              periodType: 1,
              cursor: cursorValue,
              limit: 50,
            },
          })
          .json<ApiResponse<StockPeriodDefaultData>>()
          .then((response) => {
            // 응답 처리
            const newData = response.result;

            // 응답 데이터 확인
            console.log('받은 새 데이터:', newData);

            // 기존 데이터와 새 데이터 병합
            setChartData((prevData) => {
              if (!prevData) return newData;

              // 두 데이터 세트 병합
              return {
                ...newData,
                data: [...newData.data, ...prevData.data], // 새 데이터를 뒤에 추가
                cursor: newData.cursor, // 새 cursor 값으로 업데이트
              };
            });

            // 새 커서 값 업데이트
            setCursorValue(newData.cursor);

            // 새 데이터가 추가되었으므로 표시 범위 조정
            console.log('시작값 변경');
            setDataZoomRange({
              start: start + 10,
              end: end + 10,
            });
          })
          .catch((error) => {
            console.error('추가 데이터 로드 실패:', error);
            console.log('현재 커서는', cursorValue);
          });
      }
    }, 300),
    [hasMoreData, loading, cursorValue],
  );

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
    const isRising =
      latestCandle &&
      latestCandle[1] != null &&
      latestCandle[0] != null &&
      latestCandle[1] >= latestCandle[0];
    const priceColor = isRising ? RISE_COLOR : FALL_COLOR;

    return {
      title: {
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
          min: function (value) {
            // 실제 데이터만 필터링 (빈 데이터 제외)
            const realData = processedChartData.filter((item) => item.date !== '');

            if (realData.length === 0) return 0;

            // 실제 데이터의 최소값에서 약간의 여백을 제공 (5% 정도)
            const minPrice = Math.min(...realData.map((item) => item.low || Infinity));
            return minPrice === Infinity ? 0 : minPrice * 0.95;
          },
          max: function (value) {
            // 실제 데이터만 필터링 (빈 데이터 제외)
            const realData = processedChartData.filter((item) => item.date !== '');

            if (realData.length === 0) return 1000;

            // 실제 데이터의 최대값에 약간의 여백을 제공 (5% 정도)
            const maxPrice = Math.max(...realData.map((item) => item.high || 0));
            return maxPrice * 1.05;
          },
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
          maxSpan: 70,
          textStyle: {
            fontFamily:
              'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
          },
        },
        // {
        //   show: true,
        //   xAxisIndex: [0, 1],
        //   type: 'slider',
        //   bottom: '10%',
        //   start: dataZoomRange.start,
        //   end: dataZoomRange.end,
        //   textStyle: {
        //     fontFamily:
        //       'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
        //   },
        // },
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
                  yAxis: latestPrice !== null ? latestPrice : undefined, // null을 undefined로 변환
                  label: {
                    formatter: () => {
                      return new Intl.NumberFormat('ko-KR').format(Math.floor(latestPrice ?? 0));
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
    periodType,
    processedChartData,
    formatKoreanNumber,
    lastValidData,
  ]);

  return (
    <div className="relative animate-fadeIn">
      <div
        className="flex h-full w-full flex-col rounded-2xl"
        style={{ backgroundColor: '#0D192B' }}
      >
        <div className="">
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
