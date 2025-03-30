import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 타입 정의
interface StockMinuteData {
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

interface StockMinuteDefaultData {
  companyId: string;
  limit: number;
  cursor: string;
  data: StockMinuteData[];
}

interface ApiResponse {
  isSuccess: boolean;
  code: number;
  message: string;
  result: StockMinuteDefaultData;
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
  fiveAverage: number;
  twentyAverage: number;
  rawDate: Date | null;
}

interface MinuteChartProps {
  companyId?: string;
  height?: number;
  initialLimit?: number;
  initialData?: StockMinuteDefaultData; // 부모 컴포넌트에서 받는 초기 데이터
  onLoadMoreData?: (cursor: string) => Promise<StockMinuteDefaultData | null>; // 추가 데이터 로드 콜백
}

// 상수 정의
const RISE_COLOR = '#ef5350'; // 상승 색상 (빨간색)
const FALL_COLOR = '#1976d2'; // 하락 색상 (파란색)
const DEFAULT_DATA_ZOOM_START = 50; // 데이터줌 시작 위치
const DEFAULT_DATA_ZOOM_END = 100; // 데이터줌 종료 위치
const EMPTY_DATA_COUNT = 10; // 빈 데이터 개수 (여백용)
const Y_AXIS_MARGIN_PERCENT = 5; // Y축 여백 비율 (%)

export const MinuteChart: React.FC<MinuteChartProps> = ({
  companyId,
  height = 600,
  initialLimit = 100,
  initialData,
  onLoadMoreData,
}) => {
  const [minuteData, setMinuteData] = useState<StockMinuteDefaultData | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataZoomRange, setDataZoomRange] = useState({
    start: DEFAULT_DATA_ZOOM_START,
    end: DEFAULT_DATA_ZOOM_END,
  });
  const chartRef = useRef<ReactECharts>(null);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  // 초기 데이터 설정
  useEffect(() => {
    setMinuteData(initialData);
  }, [initialData]);

  // 추가 데이터 로드 함수
  const loadMoreData = useCallback(async () => {
    // 로드 가능 여부 확인
    if (!onLoadMoreData || !minuteData?.cursor || isLoadingMore) return;

    try {
      // 로딩 상태 설정
      setIsLoadingMore(true);
      setLoading(true);

      const moreData = await onLoadMoreData(minuteData.cursor);

      if (moreData) {
        // 이전 데이터에 새 데이터 추가
        setMinuteData((prev) => {
          if (!prev) {
            // prev가 undefined인 경우 그냥 새 데이터 반환
            return moreData;
          }

          return {
            ...moreData,
            data: [...prev.data, ...moreData.data],
          };
        });
      }
    } catch (err) {
      setError('추가 데이터 로딩 중 오류 발생');
      console.error('추가 데이터 로딩 오류:', err);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [onLoadMoreData, minuteData?.cursor, isLoadingMore]);

  // 분봉 데이터를 차트 데이터 포인트로 변환
  const convertMinuteDataToChartData = useCallback((data: StockMinuteData): ChartDataPoint => {
    return {
      date: new Date(data.tradingTime).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      open: data.openPrice,
      high: data.highPrice,
      low: data.lowPrice,
      close: data.closePrice,
      volume: data.contractingVolume,
      changeType: data.closePrice >= data.openPrice ? 'RISE' : 'FALL',
      fiveAverage: data.fiveAverage,
      twentyAverage: data.twentyAverage,
      rawDate: new Date(data.tradingTime),
    };
  }, []);

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    if (!minuteData?.data) return [];

    // 실제 데이터 변환
    const realData = minuteData.data.map(convertMinuteDataToChartData);

    // 빈 데이터 추가 (차트 오른쪽 공간 확보)
    const emptyData = Array(EMPTY_DATA_COUNT)
      .fill(null)
      .map(() => ({
        date: '',
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0,
        changeType: 'NONE' as const,
        fiveAverage: 0,
        twentyAverage: 0,
        rawDate: null,
      }));

    return [...realData, ...emptyData];
  }, [minuteData, convertMinuteDataToChartData]);

  // X축 라벨 생성
  const xAxisLabels = useMemo(() => {
    return chartData.map((item) => item.date);
  }, [chartData]);

  // 캔들 데이터 생성
  const candleData = useMemo(() => {
    return chartData.map((item) => [
      item.open || 0,
      item.close || 0,
      item.low || 0,
      item.high || 0,
    ]);
  }, [chartData]);

  // 거래량 데이터 생성
  const volumeData = useMemo(() => {
    return chartData.map((item) => item.volume || 0);
  }, [chartData]);

  // 이동평균선 데이터
  const ema5Data = useMemo(() => {
    return chartData.map((item) => item.fiveAverage || null);
  }, [chartData]);

  const ema20Data = useMemo(() => {
    return chartData.map((item) => item.twentyAverage || null);
  }, [chartData]);

  // Y축 범위 계산 (여백 포함)
  const yAxisRange = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 1 };

    const prices = chartData
      .filter((item) => item.high > 0) // 빈 데이터 제외
      .flatMap((item) => [item.high, item.low]);

    if (prices.length === 0) return { min: 0, max: 1 };

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;

    // 여백 추가
    const margin = range * (Y_AXIS_MARGIN_PERCENT / 100);
    return {
      min: Math.max(0, min - margin),
      max: max + margin,
    };
  }, [chartData]);

  // 색상 스타일 가져오기
  const getItemStyle = useCallback(
    (params: any) => {
      const item = chartData[params.dataIndex];
      return item?.open <= item?.close ? RISE_COLOR : FALL_COLOR;
    },
    [chartData],
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
      const item = chartData[dataIndex] as ChartDataPoint;

      if (!item) return '데이터 없음';

      // 빈 데이터 구간 제외
      if (dataIndex >= chartData.length - EMPTY_DATA_COUNT || !item.date) {
        return '데이터 없음';
      }

      const { rawDate, open, close, low, high, volume, fiveAverage, twentyAverage } = item;

      // 날짜 포맷팅
      let formattedDate = '';
      if (rawDate) {
        const year = rawDate.getFullYear();
        const month = String(rawDate.getMonth() + 1).padStart(2, '0');
        const day = String(rawDate.getDate()).padStart(2, '0');
        const hours = String(rawDate.getHours()).padStart(2, '0');
        const minutes = String(rawDate.getMinutes()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
      }

      // 색상 설정
      const priceColor = close >= open ? RISE_COLOR : FALL_COLOR;
      const priceChangePercent = (((close - open) / open) * 100).toFixed(2);
      const priceChangeText = close >= open ? `+${priceChangePercent}%` : `${priceChangePercent}%`;

      return `
        <div class="max-w-md rounded-xl overflow-hidden">
          <div class="p-4">
            <div class="flex flex-col justify-between mb-3 border-b border-gray-200 pb-2">
              <div class="text-base font-semibold text-gray-800">주식 정보</div>
              <div class="text-sm text-gray-500">${formattedDate}</div>
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
                <span class="font-medium">${formatKoreanNumber(fiveAverage)}원</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">20일 이평선</span>
                <span class="font-medium">${formatKoreanNumber(twentyAverage)}원</span>
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
    [chartData, formatKoreanNumber, formatVolumeNumber],
  );

  // 데이터 줌 이벤트 처리
  // 컴포넌트 내부
  const handleDataZoomChange = useCallback(
    debounce((params: any) => {
      if (!params) return;
      if (params.start === undefined || params.start === null) return;
      if (params.end === undefined || params.end === null) return;
      // 데이터 줌 범위 저장
      setDataZoomRange({
        start: params.start,
        end: params.end,
      });

      // 왼쪽 경계에 도달했을 때 더 많은 데이터 로드
      if (params.start <= 5 && !isLoadingMore && onLoadMoreData) {
        loadMoreData();
        console.log('추가 데이터 로드 요청');
      }
      if (params.start <= 5) {
        console.log('끝점');
      }
    }, 300), // 300ms 디바운스
    [loadMoreData, isLoadingMore, onLoadMoreData],
  );

  // 차트 옵션 설정
  const option: EChartsOption = useMemo(
    () => ({
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
          data: xAxisLabels,
          boundaryGap: true,
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
            return value.max * 3; // 예: 최대값의 3배로 설정하여 그래프 높이를 1/3로 줄임
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
          onZoom: handleDataZoomChange,
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
          onZoom: handleDataZoomChange,
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
      yAxisRange,
      handleDataZoomChange,
    ],
  );

  return (
    <div className="relative">
      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl"
        style={{ backgroundColor: '#0D192B' }}
      >
        <div className="flex items-center gap-4 p-4 text-sm text-white">
          <div className="mr-auto">
            <h3 className="text-lg font-bold">분봉 차트</h3>
            {minuteData && (
              <p className="text-xs text-gray-400">
                데이터 기간:{' '}
                {new Date(
                  minuteData.data[minuteData.data.length - 1]?.tradingTime,
                ).toLocaleDateString()}{' '}
                ~ {new Date(minuteData.data[0]?.tradingTime).toLocaleDateString()}
              </p>
            )}
          </div>
          {loading && <div className="text-blue-400">추가 데이터 로딩 중...</div>}
          {error && <div className="text-red-400">{error}</div>}
        </div>

        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: `${height}px` }}
          onEvents={{
            datazoom: handleDataZoomChange, // 이벤트 이름: 핸들러 함수
            rendered: () => console.log('차트 렌더링 완료'),
            click: () => console.log('차트 클릭됨'),
          }}
        />
      </div>
    </div>
  );
};
