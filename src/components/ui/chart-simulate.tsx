import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { debounce, throttle } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { _ky } from '@/api/instance';

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
  fiveAverage: number;
  twentyAverage: number;
  rawDate: Date | null;
}

// 틱 데이터
interface TickData {
  /** 종목 코드 (예: "005930") */
  stockCode: string;

  /** 주식 체결 시간 (문자열, HHmmss 형식 등) */
  stckCntgHour: string;

  /** 주식 현재가 (체결 가격) */
  stckPrpr: number;

  /** 주식 시가 */
  stckOprc: number;

  /** 주식 최고가 */
  stckHgpr: number;

  /** 주식 최저가 */
  stckLwpr: number;

  /** 체결 거래량 */
  cntgVol: number;

  /** 누적 거래량 */
  acmlVol: number;

  /** 누적 거래 대금 */
  acmlTrPbm: number;

  /** 체결구분 (예: "1" - 매수, "3" - 장전, "5" - 매도) */
  ccldDvsn: string;
}

interface MinuteChartProps {
  companyId?: string;
  height?: number;
  initialLimit?: number;
  initialData?: StockMinuteDefaultData; // 부모 컴포넌트에서 받는 초기 데이터
  onLoadMoreData?: (cursor: string) => Promise<StockMinuteDefaultData | null>; // 추가 데이터 로드 콜백
  TickData?: TickData | null;
}

// 상수 정의
const RISE_COLOR = '#ef5350'; // 상승 색상 (빨간색)
const FALL_COLOR = '#1976d2'; // 하락 색상 (파란색)
const DEFAULT_DATA_ZOOM_START = 50; // 데이터줌 시작 위치
const DEFAULT_DATA_ZOOM_END = 100; // 데이터줌 종료 위치
const EMPTY_DATA_COUNT = 10; // 빈 데이터 개수 (여백용)
const Y_AXIS_MARGIN_PERCENT = 5; // Y축 여백 비율 (%)

// 커스텀 비교 함수 - 실제로 props가 변경되었는지 확인
const arePropsEqual = (prevProps: MinuteChartProps, nextProps: MinuteChartProps) => {
  // TickData 비교 로직 개선
  if (
    prevProps.TickData?.stckPrpr !== nextProps.TickData?.stckPrpr ||
    prevProps.TickData?.stckCntgHour !== nextProps.TickData?.stckCntgHour
  ) {
    return false; // 다른 값이면 리렌더링
  }

  // 다른 props도 필요에 따라 비교
  if (prevProps.height !== nextProps.height) return false;
  if (prevProps.companyId !== nextProps.companyId) return false;
  if (prevProps.initialLimit !== nextProps.initialLimit) return false;
  if (prevProps.TickData !== nextProps.TickData) return false;

  // onLoadMoreData는 함수이므로 참조 변경을 확인하지 않음
  // 함수는 useCallback으로 메모이제이션하는 것이 좋음

  return true;
};

const MinuteChartComponent: React.FC<MinuteChartProps> = ({
  companyId,
  height = 600,
  initialLimit = 100,
  initialData,
  onLoadMoreData,
  TickData,
}) => {
  const [minuteData, setMinuteData] = useState<StockMinuteDefaultData | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dataZoomRange, setDataZoomRange] = useState({
    start: DEFAULT_DATA_ZOOM_START,
    end: DEFAULT_DATA_ZOOM_END,
  });
  const chartRef = useRef<ReactECharts>(null);
  // const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [cursorValue, setCursorValue] = useState<string>('0');

  // 커서 페이지네이션을 위한 변수
  const [cursorForQuery, setCursorForQuery] = useState<string | undefined>(initialData?.cursor);
  const [hasLoadedAdditionalData, setHasLoadedAdditionalData] = useState(false);

  // 2. 초기 데이터 설정 - 커서 값도 함께 업데이트
  useEffect(() => {
    if (initialData) {
      setMinuteData(initialData);
      setCursorValue(initialData.cursor);
    }
  }, [initialData]);
  // 시간 조정을 위한 유틸리티 함수 추가
  const addNineHours = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + 9);
    return newDate;
  };
  // 분봉 데이터를 차트 데이터 포인트로 변환하는 함수 수정
  const convertMinuteDataToChartData = useCallback((data: StockMinuteData): ChartDataPoint => {
    // tradingTime에서 Date 객체 생성 후 9시간 추가
    const adjustedDate = addNineHours(new Date(data.tradingTime));

    return {
      date: adjustedDate.toLocaleTimeString('ko-KR', {
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
      rawDate: adjustedDate, // 조정된 날짜 저장
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

  // 현재 보이는 데이터 범위에 따라 Y축 범위를 계산하는 함수 추가
  const getVisibleDataRange = useCallback(() => {
    if (chartData.length === 0) return { min: 0, max: 1 };

    // 데이터줌 범위 계산 (백분율을 실제 인덱스로 변환)
    const dataLength = chartData.length - EMPTY_DATA_COUNT;
    const startIdx = Math.max(0, Math.floor((dataLength * dataZoomRange.start) / 100));
    const endIdx = Math.min(dataLength - 1, Math.floor((dataLength * dataZoomRange.end) / 100));

    // 현재 보이는 데이터 추출
    const visibleData = chartData.slice(startIdx, endIdx + 1);

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
  }, [chartData, dataZoomRange]);

  // yAxisRange 훅을 기존 코드에서 제거하고 getVisibleDataRange 함수로 대체
  const yAxisRange = useMemo(() => getVisibleDataRange(), [getVisibleDataRange]);

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

      // 날짜 포맷팅 (이미 addNineHours가 적용된 rawDate 사용)
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
  const handleDataZoomChange = useCallback(
    debounce((params: any) => {
      console.log('DataZoom 이벤트 발생:', params);
      console.log('DataZoom 이벤트 발생 타입:', params.type); // 이벤트 타입
      console.log('DataZoom start/end:', params.start, params.end); // start와 end 값
      console.log('DataZoom 전체 파라미터:', JSON.stringify(params)); // 전체 파라미터 구조
      if (!params || !params.batch || params.batch.length === 0) return;

      // batch 배열의 첫 번째 요소에서 start와 end 값을 가져옴
      const batchItem = params.batch[0];
      const start = batchItem?.start;
      const end = batchItem?.end;

      if (start === undefined || start === null) return;
      if (end === undefined || end === null) return;

      console.log('처리할 start/end 값:', start, end);

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

      // 왼쪽 경계에 도달했고 아직 추가 데이터를 로드하지 않았을 때만 요청
      if (start <= 5 && !hasLoadedAdditionalData) {
        console.log('추가 데이터 로드 요청');
        console.log(cursorValue);

        // 가장 오래된 데이터의 시간을 커서로 사용

        // 직접 _ky 사용하여 API 호출
        _ky
          .get(`stocks/${1}/minute`, {
            searchParams: {
              cursor: cursorValue,
              limit: 50,
            },
          })
          .json<ApiResponse<StockMinuteDefaultData>>()
          .then((response) => {
            // 응답 처리
            const newData = response.result;

            // 응답 데이터 확인
            console.log('받은 새 데이터:', newData);

            // 기존 데이터와 새 데이터 병합
            setMinuteData((prevData) => {
              if (!prevData) return newData;

              // 두 데이터 세트 병합
              return {
                ...newData,
                data: [...newData.data, ...prevData.data], // 새 데이터를 앞에 추가
                cursor: newData.cursor, // 새 cursor 값으로 업데이트
              };
            });

            // 새 커서 값 업데이트
            setCursorValue(newData.cursor);

            // 새 데이터가 추가되었으므로 표시 범위 조정
            console.log('시작값 변경');
            setDataZoomRange({
              start: 10,
              end: end,
            });
          })
          .catch((error) => {
            console.error('추가 데이터 로드 실패:', error);
            console.log('현재 커서는', cursorValue);
          });
      }
    }, 300),
    [onLoadMoreData, hasLoadedAdditionalData, cursorValue, getVisibleDataRange],
  );

  // useEffect 추가: 데이터가 변경될 때마다 Y축 범위 업데이트
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
  }, [chartData, getVisibleDataRange]);

  useEffect(() => {
    // 차트가 마운트된 후 이벤트 리스너 등록
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      if (chartInstance) {
        // 기존 이벤트 리스너 제거 후 다시 등록
        chartInstance.off('datazoom');
        chartInstance.on('datazoom', handleDataZoomChange);

        console.log('데이터줌 이벤트 리스너 직접 등록 완료');
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

  // 최적화된 틱 데이터 처리를 위한 코드 구현

  // 1. 추가 상태 및 ref 정의
  // 마지막으로 처리된 틱 데이터 참조 (불필요한 업데이트 방지)
  const prevTickDataRef = useRef<TickData | null>(null);
  // 스로틀링된 차트 업데이트 함수에서 사용할 최신 상태
  const minuteDataRef = useRef<StockMinuteDefaultData | undefined>(minuteData);
  // 업데이트가 필요한지 확인하는 플래그
  const [needsUpdate, setNeedsUpdate] = useState<boolean>(false);

  // minuteData가 변경될 때 ref 업데이트
  useEffect(() => {
    minuteDataRef.current = minuteData;
  }, [minuteData]);

  // updateChartWithTickData 함수 수정 부분 (전체 컴포넌트 중 문제 부분만 수정)
  const updateChartWithTickData = useCallback((tickData: TickData) => {
    // 차트 인스턴스가 없거나 minuteData가 없으면 처리하지 않음
    if (
      !chartRef.current ||
      !minuteDataRef.current?.data ||
      minuteDataRef.current.data.length === 0
    )
      return;

    const chartInstance = chartRef.current.getEchartsInstance();
    if (!chartInstance) return;

    console.log('틱 데이터 업데이트 - 마지막 데이터만 수정');

    // 마지막 데이터 가져오기 (최신 데이터 = 배열의 마지막)
    const lastIdx = minuteDataRef.current.data.length - 1;
    const latestMinuteData = minuteDataRef.current.data[lastIdx];

    // 틱 업데이트를 위한 값 계산
    const updatedOpen = latestMinuteData.openPrice; // 시가는 유지
    const updatedClose = tickData.stckPrpr || latestMinuteData.closePrice;
    const updatedHigh = Math.max(latestMinuteData.highPrice, tickData.stckHgpr || 0);
    const updatedLow = Math.min(latestMinuteData.lowPrice, tickData.stckLwpr || 0);
    const updatedVolume = tickData.cntgVol || latestMinuteData.contractingVolume;
    const updatedAmount = tickData.acmlTrPbm || latestMinuteData.accumulatedTradeAmount;

    // 1. 차트 직접 업데이트 (시각적 업데이트)
    try {
      // 캔들 데이터 업데이트 (마지막 항목만)
      const option = chartInstance.getOption();

      if (
        option.series &&
        Array.isArray(option.series) &&
        option.series[0] &&
        Array.isArray(option.series[0].data)
      ) {
        // 실제 데이터 길이 계산 (EMPTY_DATA_COUNT를 제외한 실제 데이터)
        const realDataLength = option.series[0].data.length - EMPTY_DATA_COUNT;
        if (realDataLength <= 0) return;

        // 마지막 실제 데이터 항목의 인덱스 (빈 데이터 직전)
        const lastRealDataIndex = realDataLength - 1;

        // 캔들 데이터 복사 후 마지막 데이터만 업데이트
        const candleData = [...option.series[0].data];
        candleData[lastRealDataIndex] = [updatedOpen, updatedClose, updatedLow, updatedHigh];

        // 거래량 데이터 업데이트
        let volumeData: number[] = [];
        if (option.series[1] && Array.isArray(option.series[1].data)) {
          volumeData = [...option.series[1].data];
          volumeData[lastRealDataIndex] = updatedVolume;
        }

        // 차트 부분 업데이트 (전체 리렌더링 방지)
        chartInstance.setOption(
          {
            series: [{ data: candleData }, { data: volumeData }],
          },
          { notMerge: false, lazyUpdate: true, silent: true },
        );

        console.log('차트 틱 업데이트 완료 - 마지막 데이터만 변경');
      }
    } catch (error) {
      console.error('차트 틱 업데이트 오류:', error);
    }

    // 2. 상태 업데이트 (데이터 상태 관리)
    setMinuteData((prev) => {
      if (!prev || !prev.data || prev.data.length === 0) return prev;

      // 마지막 항목만 업데이트한 새 배열 생성
      const updatedLastItem = {
        ...prev.data[prev.data.length - 1],
        closePrice: updatedClose,
        highPrice: updatedHigh,
        lowPrice: updatedLow,
        contractingVolume: updatedVolume,
        accumulatedTradeAmount: updatedAmount,
      };

      // 불변성을 유지하면서 마지막 항목만 변경
      const updatedData = [...prev.data.slice(0, -1), updatedLastItem];

      return {
        ...prev,
        companyId: prev.companyId,
        limit: prev.limit,
        cursor: prev.cursor,
        data: updatedData,
      };
    });

    // 3. 참조 업데이트 (다음 틱 처리를 위한 최신 상태 유지)
    setTimeout(() => {
      if (minuteDataRef.current) {
        const updatedLastItem = {
          ...minuteDataRef.current.data[minuteDataRef.current.data.length - 1],
          closePrice: updatedClose,
          highPrice: updatedHigh,
          lowPrice: updatedLow,
          contractingVolume: updatedVolume,
          accumulatedTradeAmount: updatedAmount,
        };

        minuteDataRef.current = {
          ...minuteDataRef.current,
          companyId: minuteDataRef.current.companyId,
          limit: minuteDataRef.current.limit,
          cursor: minuteDataRef.current.cursor,
          data: [...minuteDataRef.current.data.slice(0, -1), updatedLastItem],
        };
      }
    }, 0);
  }, []);

  // 추가로 필요한 이동평균선 계산 헬퍼 함수
  const calculateFiveAverage = (currentPrice: number, data: StockMinuteData[]): number => {
    if (!data || data.length === 0) return currentPrice;

    // 기존 데이터에서 최근 4개 + 현재 가격으로 5일 이평선 계산
    const prices = data.slice(0, 4).map((item) => item.closePrice);
    prices.unshift(currentPrice); // 현재 가격 추가

    const sum = prices.reduce((acc, price) => acc + price, 0);
    return prices.length > 0 ? sum / prices.length : currentPrice;
  };

  const calculateTwentyAverage = (currentPrice: number, data: StockMinuteData[]): number => {
    if (!data || data.length === 0) return currentPrice;

    // 기존 데이터에서 최근 19개 + 현재 가격으로 20일 이평선 계산
    const prices = data.slice(0, 19).map((item) => item.closePrice);
    prices.unshift(currentPrice); // 현재 가격 추가

    const sum = prices.reduce((acc, price) => acc + price, 0);
    return prices.length > 0 ? sum / prices.length : currentPrice;
  };

  // 3. 스로틀링된 틱 데이터 처리 함수
  const throttledUpdateWithTickData = useCallback(
    throttle((tickData: TickData) => {
      // 이전 틱과 동일한지 확인 (불필요한 업데이트 방지)
      if (
        prevTickDataRef.current &&
        prevTickDataRef.current.stckPrpr === tickData.stckPrpr &&
        prevTickDataRef.current.stckHgpr === tickData.stckHgpr &&
        prevTickDataRef.current.stckLwpr === tickData.stckLwpr &&
        prevTickDataRef.current.cntgVol === tickData.cntgVol
      ) {
        return;
      }

      // 틱 데이터로 차트 직접 업데이트
      updateChartWithTickData(tickData);

      // 참조 업데이트
      prevTickDataRef.current = { ...tickData };
    }, 100), // 스로틀링 시간 100ms로 감소하여 반응성 개선
    [updateChartWithTickData],
  );
  // 4. 차트 전체 업데이트 필요 시 처리
  // 4. 차트 전체 업데이트 필요 시 처리 (option 직접 참조 제거)
  useEffect(() => {
    if (needsUpdate && chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      if (chartInstance) {
        // 차트의 현재 상태를 기반으로 새로운 옵션 계산 및 설정
        // 직접 option 변수 참조하지 않음
        chartInstance.setOption({
          series: [
            {
              // 캔들 데이터 업데이트
              data: candleData,
            },
            {
              // 거래량 데이터 업데이트
              data: volumeData,
            },
            {
              // 5일 이동평균선 업데이트
              data: ema5Data,
            },
            {
              // 20일 이동평균선 업데이트
              data: ema20Data,
            },
          ],
        });
        setNeedsUpdate(false);
      }
    }
  }, [needsUpdate, candleData, volumeData, ema5Data, ema20Data]);

  // 5. TickData prop 변경 시 스로틀링된 함수 호출
  useEffect(() => {
    if (TickData) {
      console.log('새 틱 데이터 수신:', TickData);

      // 필수 필드 확인
      if (!TickData.stckCntgHour || !TickData.stckPrpr) {
        console.warn('틱 데이터에 필수 필드 없음:', TickData);
        return;
      }

      throttledUpdateWithTickData(TickData);
    }
  }, [TickData, throttledUpdateWithTickData]);

  // 6. 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 스로틀링된 함수의 타이머 정리
      throttledUpdateWithTickData.cancel();
    };
  }, [throttledUpdateWithTickData]);

  // 7. 차트 인스턴스 직접 접근을 위한 함수 (성능 진단용)
  const getChartPerformanceInfo = useCallback(() => {
    if (chartRef.current) {
      const chartInstance = chartRef.current.getEchartsInstance();
      if (chartInstance) {
        console.log('차트 성능 정보:', {
          renderedCount: chartInstance.getOption()?.__renderedCount || 0,
          currentDataLength: chartData.length,
        });
      }
    }
  }, [chartData.length]);

  // 보조 함수들

  // 틱 시간(HHmmss)을 포맷팅하는 함수
  const formatTickTime = (tickTime: string): string => {
    // HHmmss 형식의 문자열을 HH:mm 형식으로 변환
    if (tickTime.length >= 6) {
      const hour = tickTime.substring(0, 2);
      const minute = tickTime.substring(2, 4);
      return `${hour}:${minute}`;
    }
    return tickTime;
  };

  // 틱 시간을 Date 객체로 변환하는 함수
  const convertTickTimeToDate = (tickTime: string): Date | null => {
    if (!tickTime || tickTime.length < 6) return null;

    const now = new Date();
    const hour = parseInt(tickTime.substring(0, 2), 10);
    const minute = parseInt(tickTime.substring(2, 4), 10);
    const second = parseInt(tickTime.substring(4, 6), 10);

    const result = new Date(now);
    result.setHours(hour, minute, second, 0);

    // 9시간 추가
    return addNineHours(result);
  };
  // 두 날짜가 같은 분(minute)에 속하는지 확인하는 함수
  const isSameMinute = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false;

    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate() &&
      date1.getHours() === date2.getHours() &&
      date1.getMinutes() === date2.getMinutes()
    );
  };

  // 차트 옵션 설정
  const option: EChartsOption = useMemo(() => {
    // 실제 데이터 구간에서 마지막 유효한 캔들 찾기
    const dataEndIndex = chartData.length - EMPTY_DATA_COUNT - 1;
    const latestCandle =
      dataEndIndex >= 0
        ? [
            chartData[dataEndIndex].open,
            chartData[dataEndIndex].close,
            chartData[dataEndIndex].low,
            chartData[dataEndIndex].high,
          ]
        : null;
    const latestPrice = latestCandle ? latestCandle[1] : 0; // 종가 값

    // 상승/하락 여부 확인 (안전하게)
    const isRising = latestCandle && latestCandle[1] >= latestCandle[0];
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
          // onZoom: handleDataZoomChange,
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
          // onZoom: handleDataZoomChange,
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
    handleDataZoomChange,
  ]);

  return (
    <div className="relative">
      <div className="bg-modal-background-color">
        <div className="flex items-center gap-4 p-4 text-sm text-white">
          {loading && <div className="text-blue-400">추가 데이터 로딩 중...</div>}
          {error && <div className="text-red-400">{error}</div>}
        </div>

        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: `${height}px` }}
          onEvents={{
            datazoom: handleDataZoomChange, // 기존 이벤트 (모든 dataZoom 이벤트 처리)
            rendered: () => console.log('차트 렌더링 완료'),
            click: () => console.log('차트 클릭됨'),
          }}
        />
      </div>
    </div>
  );
};

// React.memo를 사용하여 컴포넌트 메모이제이션
export const MinuteChart = React.memo<MinuteChartProps>(MinuteChartComponent, arePropsEqual);
