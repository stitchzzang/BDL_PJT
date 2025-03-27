import ReactECharts from 'echarts-for-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  CandleResponse,
  ChartDataPoint,
  convertMinuteCandleToChartData,
  convertPeriodCandleToChartData,
  MinuteCandleData,
  PeriodCandleData,
} from '@/mocks/dummy-data';

// ResizeObserver 패치를 위한 타입 확장
declare global {
  interface Window {
    __RESIZE_OBSERVERS__?: ResizeObserver[];
    __PATCHED_RESIZE_OBSERVER__?: boolean;
    ResizeObserver: {
      new (callback: ResizeObserverCallback): ResizeObserver;
      prototype: ResizeObserver;
    };
  }
}

// echarts-for-react 라이브러리 내부의  오류 패치
// disconnect 메서드 호출 시 undefined 참조 오류를 방지
if (typeof window !== 'undefined' && !window.__PATCHED_RESIZE_OBSERVER__) {
  try {
    // 기존 ResizeObserver 저장
    const OriginalResizeObserver = window.ResizeObserver;

    if (OriginalResizeObserver) {
      // 전역 객체에 저장되는 모든 ResizeObserver 참조를 저장
      window.__RESIZE_OBSERVERS__ = [];

      // ResizeObserver 재정의
      window.ResizeObserver = class PatchedResizeObserver extends OriginalResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          super(callback);

          // 인스턴스 추적을 위해 배열에 저장
          if (window.__RESIZE_OBSERVERS__) {
            window.__RESIZE_OBSERVERS__.push(this);
          }
        }

        // disconnect 메서드 오버라이드 - 안전하게 처리
        disconnect() {
          try {
            super.disconnect();
          } catch {
            // 오류 무시 - disconnect가 undefined일 경우 발생하는 오류 처리
          }
        }

        // observe 메서드 오버라이드
        observe(target: Element, options?: ResizeObserverOptions) {
          try {
            return super.observe(target, options);
          } catch (e) {
            // 오류 무시
          }
        }

        // unobserve 메서드 오버라이드
        unobserve(target: Element) {
          return super.unobserve(target);
        }
      } as unknown as typeof ResizeObserver;

      // 패치 적용 표시
      window.__PATCHED_RESIZE_OBSERVER__ = true;
    }
  } catch {
    // ResizeObserver 패치 중 오류 무시
  }
}

interface ChartComponentProps {
  readonly height?: number;
  readonly ratio?: number;
  readonly minuteData?: CandleResponse<MinuteCandleData>;
  readonly periodData?: CandleResponse<PeriodCandleData>;
}

type PeriodType = 'MINUTE' | 'DAY' | 'WEEK' | 'MONTH';

const RISE_COLOR = '#ef5350'; // 빨강
const FALL_COLOR = '#1976d2'; // 파랑

// DataZoomParams 타입을 직접 정의합니다.
interface DataZoomParams {
  batch?: { start: number; end: number }[];
  start?: number;
  end?: number;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  height = 700,
  minuteData,
  periodData,
}) => {
  const [period, setPeriod] = useState<PeriodType>('MINUTE');
  const chartRef = useRef<ReactECharts>(null);
  const [dataZoomRange, setDataZoomRange] = useState({ start: 30, end: 100 });
  const [visibleDataIndices, setVisibleDataIndices] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });

  // API 데이터를 차트 데이터로 변환
  const transformedChartData = useMemo(() => {
    if (period === 'MINUTE' && minuteData?.data) {
      return minuteData.data.map(convertMinuteCandleToChartData);
    } else if (periodData?.data) {
      return periodData.data.map(convertPeriodCandleToChartData);
    }
    return [];
  }, [period, minuteData, periodData]);

  // 차트 데이터가 비어있는지 확인
  const effectiveChartData = useMemo(() => {
    if (transformedChartData.length === 0) {
      return [];
    }
    return transformedChartData;
  }, [transformedChartData]);

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

  // 주봉 데이터 처리 함수
  const getWeekData = useCallback(
    (dayData: ChartDataPoint[]) => {
      return dayData.reduce<ChartDataPoint[]>((acc, curr, i) => {
        if (i % 5 === 0) {
          const weekData = dayData.slice(i, i + 5);
          if (weekData.length > 0) {
            const weekDate = weekData[0].rawDate as Date;
            acc.push({
              ...curr,
              periodType: 'WEEK',
              volume: weekData.reduce((sum, item) => sum + item.volume, 0),
              high: Math.max(...weekData.map((item) => item.high)),
              low: Math.min(...weekData.map((item) => item.low)),
              open: weekData[0].open,
              close: weekData[weekData.length - 1].close,
              date: formatChartDate(weekDate),
              rawDate: weekDate, // 원시 날짜 정보 저장
            });
          }
        }
        return acc;
      }, []);
    },
    [formatChartDate],
  );

  // 월봉 데이터 처리 함수
  const getMonthData = useCallback(
    (dayData: ChartDataPoint[]) => {
      return dayData.reduce<ChartDataPoint[]>((acc, curr) => {
        const date = curr.rawDate as Date;
        const month = date.getMonth();
        const year = date.getFullYear();

        const existingMonthIndex = acc.findIndex((item) => {
          const itemDate = item.rawDate as Date;
          return itemDate.getMonth() === month && itemDate.getFullYear() === year;
        });

        if (existingMonthIndex === -1) {
          // 해당 월의 첫 데이터
          const monthFirstDay = new Date(year, month, 1);
          acc.push({
            ...curr,
            periodType: 'MONTH',
            volume: curr.volume,
            high: curr.high,
            low: curr.low,
            open: curr.open,
            close: curr.close,
            date: formatChartDate(monthFirstDay),
            rawDate: monthFirstDay,
          });
        } else {
          // 이미 해당 월의 데이터가 있으면 업데이트
          const existingData = acc[existingMonthIndex];
          existingData.volume += curr.volume;
          existingData.high = Math.max(existingData.high, curr.high);
          existingData.low = Math.min(existingData.low, curr.low);
          existingData.close = curr.close; // 마지막 종가로 업데이트
        }

        return acc;
      }, []);
    },
    [formatChartDate],
  );

  // 기간별 날짜 포맷팅 함수 (상세 표시용)
  const formatDetailDate = useCallback(
    (date: Date): string => {
      switch (period) {
        case 'MINUTE':
          // YYYY-MM-DD HH:MM 형식
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        case 'DAY':
          // YYYY-MM-DD 형식
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        case 'WEEK':
          // YYYY-MM-DD (주) 형식 - 해당 주의 첫 날짜 표시
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} (주)`;
        case 'MONTH':
          // YYYY-MM 형식
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        default:
          return date.toISOString().split('T')[0];
      }
    },
    [period],
  );

  const getData = useCallback(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(9, 0, 0, 0);

    let result: ChartDataPoint[];
    let dayData: ChartDataPoint[];

    switch (period) {
      case 'MINUTE':
        if (!minuteData?.data) return [];
        result = minuteData.data.map(convertMinuteCandleToChartData);
        break;

      case 'WEEK':
        if (!periodData?.data) return [];
        // 주봉: 월~금 5일 단위로 데이터 그룹화
        dayData = periodData.data
          .filter((item) => item.periodType === '1')
          .map(convertPeriodCandleToChartData);

        result = getWeekData(dayData);
        break;

      case 'MONTH':
        if (!periodData?.data) return [];
        // 월봉: 실제 월 단위로 데이터 그룹화
        dayData = periodData.data
          .filter((item) => item.periodType === '1')
          .map(convertPeriodCandleToChartData);

        result = getMonthData(dayData);
        break;

      case 'DAY':
      default:
        if (!periodData?.data) return [];
        // 일봉: 하루 단위 데이터 그대로 사용
        result = periodData.data
          .filter((item) => item.periodType === '1')
          .map(convertPeriodCandleToChartData);
        break;
    }

    return result;
  }, [period, minuteData, periodData, getWeekData, getMonthData]);

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

  // 앞쪽에 빈 데이터 없이 실제 데이터만 사용
  const extendedChartData = useMemo(() => {
    // 앞쪽에 10개의 빈 데이터 추가
    const baseData = [
      ...Array(10)
        .fill({})
        .map(() => ({
          date: '',
          open: 0,
          high: 0,
          low: 0,
          close: 0,
          volume: 0,
          changeType: 'NONE' as const,
        })),
      ...effectiveChartData,
    ];

    return baseData;
  }, [effectiveChartData]);

  // X축 레이블 데이터 생성
  const xAxisLabels = useMemo(() => {
    if (period === 'MINUTE') {
      // 앞쪽 빈 데이터에 대한 레이블 생성
      const labels = extendedChartData.map((item, index) => {
        if (index < 10) {
          // 앞쪽 빈 데이터에 대한 레이블 생성
          return ''; // 왼쪽 여백에는 빈 문자열로 레이블 생성
        }
        // 데이터가 있는 경우 포맷팅된 날짜 반환
        if ('rawDate' in item && item.rawDate) {
          return formatChartDate(item.rawDate as Date);
        }
        return item.date;
      });

      // 다음 거래일 데이터 추가 (마지막 데이터 이후부터 연속적으로)
      if (labels.length > 0 && effectiveChartData.length > 0) {
        const lastItem = effectiveChartData[effectiveChartData.length - 1];
        if (lastItem && lastItem.rawDate) {
          const lastDataTime = new Date(lastItem.rawDate as Date);

          // 장 마감 시간 계산
          const endTime = new Date(lastDataTime);
          endTime.setHours(15, 30, 0, 0);

          // 1. 현재 거래일 내 남은 시간 추가 (현재 시간부터 15:30까지)
          if (lastDataTime < endTime) {
            // 거래 시간 내 연속 추가 (장 종료 시간까지)
            const nextMinute = new Date(lastDataTime);
            nextMinute.setMinutes(nextMinute.getMinutes() + 1);

            while (nextMinute <= endTime) {
              labels.push(formatChartDate(nextMinute));
              nextMinute.setMinutes(nextMinute.getMinutes() + 1);
            }
          }

          // 2. 다음 거래일 데이터 추가 (09:01부터 시작)
          // 다음 거래일 설정
          const nextTradingDay = new Date(lastDataTime);
          nextTradingDay.setDate(nextTradingDay.getDate() + 1);

          // 주말 건너뛰기
          const dayOfWeek = nextTradingDay.getDay();
          if (dayOfWeek === 6) {
            // 토요일
            nextTradingDay.setDate(nextTradingDay.getDate() + 2); // 월요일로
          } else if (dayOfWeek === 0) {
            // 일요일
            nextTradingDay.setDate(nextTradingDay.getDate() + 1); // 월요일로
          }

          // 다음 거래일 시작 시간 (09:01)으로 설정
          nextTradingDay.setHours(9, 1, 0, 0);
          const nextDayEnd = new Date(nextTradingDay);
          nextDayEnd.setHours(15, 30, 0, 0);

          // 다음 거래일 시간 추가 (09:01 ~ 15:30)
          const tradingMinutes = new Date(nextTradingDay);
          while (tradingMinutes <= nextDayEnd) {
            labels.push(formatChartDate(tradingMinutes));
            tradingMinutes.setMinutes(tradingMinutes.getMinutes() + 1);

            // 충분한 여백 데이터만 추가 (30개 정도)
            if (labels.length > extendedChartData.length + 30) break;
          }
        }
      }

      return labels;
    } else {
      // 다른 기간의 경우도 왼쪽 여백 추가
      const labels = extendedChartData.map((item, index) => {
        if (index < 10) {
          return ''; // 왼쪽 여백에는 빈 문자열로 레이블 생성
        }
        // 데이터가 있는 경우 포맷팅된 날짜 반환
        if ('rawDate' in item && item.rawDate) {
          return formatChartDate(item.rawDate as Date);
        }
        return item.date;
      });

      // 오른쪽 여유 공간 추가 (10개의 레이블)
      if (labels.length > 0 && effectiveChartData.length > 0) {
        // 마지막 실제 데이터 가져오기
        const lastRealData = effectiveChartData[effectiveChartData.length - 1];
        if (!lastRealData || !lastRealData.rawDate) return labels;

        // 마지막 데이터의 실제 날짜 (툴팁에 표시되는 날짜)
        const lastActualDate = new Date(lastRealData.rawDate as Date);

        // 다음 날짜/월/연도 데이터 생성 (오른쪽 여백용)
        for (let i = 1; i <= 10; i++) {
          let newLabel = '';
          const nextDate = new Date(lastActualDate);

          switch (period) {
            case 'DAY': {
              // 다음 날짜 계산
              nextDate.setDate(nextDate.getDate() + i);

              // 레이블 형식에 맞게 변환
              const day = nextDate.getDate();
              if (day === 1) {
                // 월의 첫 날에는 '월'을 표시
                newLabel = `${nextDate.getMonth() + 1}월`;
              } else {
                newLabel = `${day}일`;
              }
              break;
            }
            case 'WEEK': {
              // 다음 주 계산 (7일 단위)
              nextDate.setDate(nextDate.getDate() + i * 7);

              // 레이블 형식에 맞게 변환
              const day = nextDate.getDate();
              if (day <= 7) {
                // 월의 첫 주에는 '월'을 표시
                newLabel = `${nextDate.getMonth() + 1}월`;
              } else {
                newLabel = `${day}일`;
              }
              break;
            }
            case 'MONTH': {
              // 다음 월 계산
              nextDate.setMonth(nextDate.getMonth() + i);

              // 레이블 형식에 맞게 변환
              const month = nextDate.getMonth() + 1;
              if (month === 1) {
                // 년의 첫 월에는 '년'을 표시
                newLabel = `${nextDate.getFullYear()}년`;
              } else {
                newLabel = `${month}월`;
              }
              break;
            }
          }

          if (newLabel) {
            labels.push(newLabel);
          }
        }
      }

      return labels;
    }
  }, [extendedChartData, period, formatChartDate, effectiveChartData]);

  // EMA 계산 함수
  const calculateEMA = (data: (number | null | string)[], period: number): (number | null)[] => {
    const k = 2 / (period + 1);
    const emaData: (number | null)[] = [];

    // 첫 번째 유효한 값 찾기
    let firstValidIndex = 0;
    while (
      firstValidIndex < data.length &&
      (data[firstValidIndex] === null ||
        data[firstValidIndex] === undefined ||
        data[firstValidIndex] === '-')
    ) {
      firstValidIndex++;
    }

    let prevEma = typeof data[firstValidIndex] === 'number' ? (data[firstValidIndex] as number) : 0;

    for (let i = 0; i < data.length; i++) {
      const currentPrice = data[i];
      if (currentPrice === null || currentPrice === undefined || currentPrice === '-') {
        emaData.push(null);
        continue;
      }

      const numericPrice = Number(currentPrice);
      const currentEma =
        i === firstValidIndex ? numericPrice : Math.floor(numericPrice * k + prevEma * (1 - k));
      emaData.push(currentEma);
      prevEma = currentEma;
    }

    return emaData;
  };

  const closePrices = extendedChartData.map((item, index) =>
    index < 10 ? null : Math.floor(item.close),
  );
  const ema5Data = calculateEMA(closePrices, 5);
  const ema20Data = calculateEMA(closePrices, 20);

  // 거래량 차트의 높이 비율 상수 정의 (전체 높이의 30%)
  const VOLUME_HEIGHT_RATIO = 0.3;
  // 거래량 차트와 캔들차트 사이의 간격 비율 (전체 높이의 5%)
  const VOLUME_GAP_RATIO = 0.05;

  // 거래량 데이터 최대값 계산
  const getMaxVolume = useCallback(() => {
    // 유효한 데이터만 필터링
    const validData = effectiveChartData.filter((d) => d !== null && d !== undefined);
    if (validData.length === 0) return 0;

    return Math.max(...validData.map((d) => d.volume));
  }, [effectiveChartData]);

  // 가격 범위 계산
  // const getPriceRange = useCallback(() => {
  //   // 유효한 데이터만 필터링
  //   const validData = effectiveChartData.filter((d) => d !== null && d !== undefined);
  //   if (validData.length === 0) return { min: 0, max: 100 };

  //   // 가격 범위 계산 (고가, 저가, 시가, 종가 기준)
  //   const prices = validData.flatMap((d) => [d.high, d.low, d.open, d.close]);
  //   const min = Math.min(...prices);
  //   const max = Math.max(...prices);

  //   // 패딩 추가
  //   const padding = (max - min) * 0.05; // 5% 패딩
  //   return {
  //     min: Math.max(0, min - padding),
  //     max: max + padding,
  //   };
  // }, [effectiveChartData]);

  // Y축 범위 계산에 getMaxVolume 사용
  const yAxisVolumeRange = useMemo(() => {
    const maxVolume = getMaxVolume();
    return {
      min: 0,
      max: Math.ceil(maxVolume * 1.1), // 최대값에 10% 여유 추가
    };
  }, [getMaxVolume]);

  // 데이터 줌 범위 계산
  const getDataZoomRange = useCallback(() => {
    switch (period) {
      case 'MINUTE':
        return { start: 30, end: 100 }; // 1분봉은 최근 70% 데이터만 표시
      case 'DAY':
        return { start: 50, end: 100 }; // 일봉은 최근 50% 데이터만 표시
      case 'WEEK':
      case 'MONTH':
        return { start: 10, end: 100 }; // 주봉, 월봉은 90% 데이터 표시
      default:
        return { start: 10, end: 90 };
    }
  }, [period]);

  // 현재 데이터 (마지막 실제 데이터)
  const currentData = useMemo(() => {
    const realDataLength = effectiveChartData.length;
    if (realDataLength === 0) {
      return {
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0,
      };
    }
    return effectiveChartData[realDataLength - 1];
  }, [effectiveChartData]);

  // 현재 가격 색상 계산
  const currentPriceColor = useMemo(() => {
    if (!currentData) return FALL_COLOR;
    return currentData.close >= currentData.open ? RISE_COLOR : FALL_COLOR;
  }, [currentData]);

  // 데이터 표시 범위에 따라 차트 데이터 필터링
  const filteredChartData = useMemo(() => {
    return effectiveChartData.slice(visibleDataIndices.start, visibleDataIndices.end + 1);
  }, [effectiveChartData, visibleDataIndices]);

  // 현재 보이는 데이터 범위 계산 함수
  const updateVisibleDataIndices = useCallback(
    (start: number, end: number) => {
      // X축 데이터의 전체 길이
      const totalLength = extendedChartData.length;

      // dataZoom의 start와 end 값(%)을 실제 배열 인덱스로 변환
      const startIdx = Math.max(0, Math.floor((totalLength * start) / 100));
      const endIdx = Math.min(totalLength - 1, Math.floor((totalLength * end) / 100));

      setVisibleDataIndices({ start: startIdx, end: endIdx });
    },
    [extendedChartData.length],
  );

  // 초기 보이는 데이터 범위 설정
  useEffect(() => {
    const initialRange = getDataZoomRange();
    setDataZoomRange(initialRange);
    updateVisibleDataIndices(initialRange.start, initialRange.end);
  }, [period, getDataZoomRange, updateVisibleDataIndices]);

  // 데이터 줌 이벤트 핸들러 최적화
  const handleDataZoom = useCallback(
    (params: DataZoomParams) => {
      try {
        let start, end;
        if (params.batch) {
          // 배치 업데이트인 경우
          ({ start, end } = params.batch[0]);
        } else if (params.start !== undefined && params.end !== undefined) {
          // 단일 업데이트인 경우
          start = params.start;
          end = params.end;
        } else {
          return; // 유효하지 않은 파라미터
        }

        // 상태 업데이트를 한 번만 수행
        setDataZoomRange({ start, end });
        updateVisibleDataIndices(start, end);
      } catch {
        // 오류 무시
      }
    },
    [updateVisibleDataIndices],
  );

  // echarts 옵션 이벤트 설정 최적화 - 최소화
  const eventHandlers = useMemo(() => {
    // 최소화된 이벤트 핸들러 - 오류 방지를 위해 datazoom만 유지
    return {
      datazoom: handleDataZoom,
    };
  }, [handleDataZoom]);

  // 기간 선택 핸들러 단순화
  const handlePeriodChange = (newPeriod: PeriodType) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
  };

  // ECharts 옵션 설정
  const memoizedOption = useMemo(() => {
    return {
      animation: false,
      backgroundColor: '#0D192B',
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: {
          type: 'cross' as const,
          crossStyle: {
            color: 'rgba(255, 255, 255, 0.2)',
            width: 1,
          },
          label: {
            show: true,
            backgroundColor: FALL_COLOR,
          },
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.2)',
            width: 1,
            type: 'dashed' as const,
          },
        },
        confine: true,
        enterable: false,
        appendToBody: false,
        showContent: true,
        alwaysShowContent: false,
        backgroundColor: 'rgba(19, 23, 34, 0.9)',
        borderColor: '#2e3947',
        textStyle: {
          color: '#fff',
        },
        formatter: (params: any) => {
          const candleData = params.find((p: any) => p.seriesName === '캔들차트');
          const ema5Data = params.find((p: any) => p.seriesName === '5일 이평선');
          const ema20Data = params.find((p: any) => p.seriesName === '20일 이평선');

          if (!candleData) return '';

          const date = params[0].data[0];
          const dataIndex = params[0].dataIndex;

          // 왼쪽 여백 데이터 처리
          if (dataIndex < 10) {
            return `
              <div style="font-size: 12px;">
                <div style="margin-bottom: 4px;">-</div>
                <div>시가: -</div>
                <div>고가: -</div>
                <div>저가: -</div>
                <div>종가: -</div>
                <div>5이평선: -</div>
                <div>20이평선: -</div>
                <div>거래량: -</div>
              </div>
            `;
          }

          // 유효하지 않은 데이터 처리
          if (
            !candleData.data ||
            !Array.isArray(candleData.data) ||
            candleData.data.some((val: number) => typeof val !== 'number' || isNaN(val))
          ) {
            return `
              <div style="font-size: 12px;">
                <div style="margin-bottom: 4px;">${date || '-'}</div>
                <div>시가: -</div>
                <div>고가: -</div>
                <div>저가: -</div>
                <div>종가: -</div>
                <div>5이평선: -</div>
                <div>20이평선: -</div>
                <div>거래량: -</div>
              </div>
            `;
          }

          // 실제 데이터 범위를 벗어난 경우 (다음 거래일 데이터)
          if (dataIndex >= 10 + transformedChartData.length) {
            // 미래 데이터일 경우 올바른 날짜 표시
            let formattedDate = date || '-';

            if (period === 'MINUTE' && date) {
              // 마지막 실제 데이터 가져오기
              const lastRealData = effectiveChartData[effectiveChartData.length - 1];
              if (lastRealData && lastRealData.rawDate) {
                const lastDate = new Date(lastRealData.rawDate as Date);
                const endTime = new Date(lastDate);
                endTime.setHours(15, 30, 0, 0);

                // 시간 정보 추출 (HH:MM 형식)
                const timeParts = date.split(':');
                if (timeParts.length === 2) {
                  const hour = Number(timeParts[0]);
                  const minute = Number(timeParts[1]);

                  // 시간이 거래 시간 범위 내인지 확인 (09:01 ~ 15:30)
                  if (
                    (hour === 9 && minute >= 1) ||
                    (hour > 9 && hour < 15) ||
                    (hour === 15 && minute <= 30)
                  ) {
                    // 날짜 계산
                    const targetDate = new Date(lastDate);

                    // 시간이 마지막 데이터 시간보다 이전인 경우, 다음 거래일로 설정
                    if (
                      hour < lastDate.getHours() ||
                      (hour === lastDate.getHours() && minute <= lastDate.getMinutes())
                    ) {
                      targetDate.setDate(targetDate.getDate() + 1);

                      // 주말 건너뛰기
                      const dayOfWeek = targetDate.getDay();
                      if (dayOfWeek === 6) {
                        // 토요일
                        targetDate.setDate(targetDate.getDate() + 2); // 월요일로
                      } else if (dayOfWeek === 0) {
                        // 일요일
                        targetDate.setDate(targetDate.getDate() + 1); // 월요일로
                      }
                    } else if (lastDate >= endTime) {
                      // 마지막 데이터가 15:30이거나 그 이후인 경우, 다음 거래일로 설정
                      targetDate.setDate(targetDate.getDate() + 1);

                      // 주말 건너뛰기
                      const dayOfWeek = targetDate.getDay();
                      if (dayOfWeek === 6) {
                        // 토요일
                        targetDate.setDate(targetDate.getDate() + 2); // 월요일로
                      } else if (dayOfWeek === 0) {
                        // 일요일
                        targetDate.setDate(targetDate.getDate() + 1); // 월요일로
                      }
                    }

                    // 시간 설정
                    targetDate.setHours(hour, minute, 0, 0);
                    formattedDate = formatDetailDate(targetDate);
                  }
                }
              }
            } else if ((period === 'DAY' || period === 'WEEK' || period === 'MONTH') && date) {
              // 일봉/주봉/월봉의 경우 날짜 포맷팅
              const dayMatch = date.match(/(\d+)일/);
              const monthMatch = date.match(/(\d+)월/);
              const yearMatch = date.match(/(\d+)년/);

              if (dayMatch || monthMatch || yearMatch) {
                const lastRealData = effectiveChartData[effectiveChartData.length - 1];
                if (lastRealData && lastRealData.rawDate) {
                  const lastDate = new Date(lastRealData.rawDate as Date);
                  const newDate = new Date(lastDate);

                  // 연도 처리
                  if (yearMatch) {
                    const year = Number(yearMatch[1]);
                    newDate.setFullYear(year);
                    newDate.setMonth(0);
                    newDate.setDate(1);
                  }
                  // 월 처리
                  else if (monthMatch) {
                    const month = Number(monthMatch[1]) - 1;
                    newDate.setMonth(month);
                    newDate.setDate(1);
                  }
                  // 일 처리
                  else if (dayMatch) {
                    const day = Number(dayMatch[1]);
                    newDate.setDate(day);
                  }

                  formattedDate = formatDetailDate(newDate);
                }
              }
            }

            return `
              <div style="font-size: 12px;">
                <div style="margin-bottom: 4px;">${formattedDate}</div>
                <div>시가: -</div>
                <div>고가: -</div>
                <div>저가: -</div>
                <div>종가: -</div>
                <div>5이평선: -</div>
                <div>20이평선: -</div>
                <div>거래량: -</div>
              </div>
            `;
          }

          // 원본 데이터에서 직접 값을 가져옴
          const originalItem = extendedChartData[dataIndex];
          const open = originalItem.open;
          const close = originalItem.close;
          const low = originalItem.low;
          const high = originalItem.high;
          const volume = originalItem.volume;

          // 날짜 형식 변환 - 요구사항에 맞게 포맷팅
          let formattedDate = date;
          if ('rawDate' in originalItem && originalItem.rawDate instanceof Date) {
            formattedDate = formatDetailDate(originalItem.rawDate);
          }

          // 전일 종가 (이전 날짜의 종가) 가져오기
          let previousClose = 0;
          if (dataIndex > 10) {
            // 왼쪽 패딩(10개)을 고려해 이전 날짜 데이터 가져오기
            const prevItem = extendedChartData[dataIndex - 1];
            if (prevItem && prevItem.close) {
              previousClose = prevItem.close;
            }
          } else {
            // 첫 데이터인 경우 같은 값 사용
            previousClose = open;
          }

          // 변동률 계산 함수
          const calculateChangePercent = (current: number, previous: number) => {
            if (!previous) return 0;
            return ((current - previous) / previous) * 100;
          };

          // 변동률 계산
          const openChangePercent = calculateChangePercent(open, previousClose);
          const highChangePercent = calculateChangePercent(high, previousClose);
          const lowChangePercent = calculateChangePercent(low, previousClose);
          const closeChangePercent = calculateChangePercent(close, previousClose);

          // 변동률 색상 지정 함수
          const getPercentColor = (percent: number) => {
            return percent > 0 ? RISE_COLOR : percent < 0 ? FALL_COLOR : '#FFFFFF';
          };

          // 변동률 문자열 포맷팅
          const formatPercent = (percent: number) => {
            const sign = percent > 0 ? '+' : '';
            return `<span style="color: ${getPercentColor(percent)}">(${sign}${percent.toFixed(2)}%)</span>`;
          };

          // 숫자 여부 확인하고 문자열 포맷팅
          const openStr = open
            ? `${formatKoreanNumber(open)}원 ${formatPercent(openChangePercent)}`
            : '-';
          const closeStr = close
            ? `${formatKoreanNumber(close)}원 ${formatPercent(closeChangePercent)}`
            : '-';
          const lowStr = low
            ? `${formatKoreanNumber(low)}원 ${formatPercent(lowChangePercent)}`
            : '-';
          const highStr = high
            ? `${formatKoreanNumber(high)}원 ${formatPercent(highChangePercent)}`
            : '-';
          const volumeStr = volume ? formatVolumeNumber(volume) : '-';
          const ema5Str =
            Array.isArray(ema5Data) &&
            ema5Data.length > 0 &&
            typeof ema5Data[0] === 'number' &&
            !isNaN(ema5Data[0])
              ? formatKoreanNumber(ema5Data[0]) + '원'
              : '-';
          const ema20Str =
            Array.isArray(ema20Data) &&
            ema20Data.length > 0 &&
            typeof ema20Data[0] === 'number' &&
            !isNaN(ema20Data[0])
              ? formatKoreanNumber(ema20Data[0]) + '원'
              : '-';

          return `
            <div style="font-size: 12px;">
              <div style="margin-bottom: 4px;">${formattedDate || '-'}</div>
              <div>시가: ${openStr}</div>
              <div>고가: ${highStr}</div>
              <div>저가: ${lowStr}</div>
              <div>종가: ${closeStr}</div>
              <div>5이평선: ${ema5Str}</div>
              <div>20이평선: ${ema20Str}</div>
              <div>거래량: ${volumeStr}</div>
            </div>
          `;
        },
      },
      axisPointer: {
        link: [{ xAxisIndex: [0, 1] }],
        label: {
          backgroundColor: FALL_COLOR,
        },
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
          type: 'dashed' as const,
        },
      },
      grid: [
        {
          left: '5%',
          right: '15%',
          top: '8%',
          height: `${VOLUME_HEIGHT_RATIO * height}px`,
          containLabel: true,
          show: true,
          borderColor: '#2e3947',
          backgroundColor: 'transparent',
        },
        {
          left: '5%',
          right: '15%',
          top: `${8 + VOLUME_HEIGHT_RATIO * 100}%`,
          height: `${(1 - VOLUME_HEIGHT_RATIO - VOLUME_GAP_RATIO) * height}px`,
          containLabel: true,
          show: true,
          borderColor: '#2e3947',
          backgroundColor: 'transparent',
        },
      ],
      xAxis: [
        {
          type: 'category' as const,
          data: xAxisLabels,
          gridIndex: 0,
          axisLine: { lineStyle: { color: '#2e3947' } },
          axisLabel: {
            show: true,
            color: '#CCCCCC',
            margin: 12,
            formatter: (value: any, index: any) => {
              if (!value) return '';

              if (period === 'MINUTE' && value === '09:01' && index > extendedChartData.length) {
                return `{nextDay|${value}}`;
              }

              return value;
            },
            rich: {
              nextDay: {
                color: '#ff9800',
                fontWeight: 'bold' as const,
              },
            },
          },
          splitLine: {
            show: true,
            lineStyle: { color: 'rgba(100, 100, 100, 0.2)' },
          },
          axisTick: { show: true },
          boundaryGap: true,
          scale: true,
          min: 'dataMin',
          max: 'dataMax',
        },
        {
          type: 'category' as const,
          data: xAxisLabels,
          gridIndex: 1,
          axisLine: { lineStyle: { color: '#2e3947' } },
          axisLabel: {
            show: true,
            color: '#CCCCCC',
            margin: 12,
          },
          splitLine: {
            show: true,
            lineStyle: { color: 'rgba(100, 100, 100, 0.2)' },
          },
          axisTick: { show: true },
          boundaryGap: true,
          scale: true,
          min: 'dataMin',
          max: 'dataMax',
        },
      ],
      yAxis: [
        {
          type: 'value' as const,
          position: 'right' as const,
          scale: true,
          splitNumber: 8,
          gridIndex: 0,
          axisLine: { lineStyle: { color: '#2e3947' } },
          splitLine: {
            show: true,
            lineStyle: { color: 'rgba(100, 100, 100, 0.2)' },
          },
          axisLabel: {
            color: '#CCCCCC',
            formatter: (value: number) => formatKoreanNumber(Math.floor(value)),
            inside: false,
            margin: 8,
            fontSize: 12,
          },
          min: (value: any) => Math.floor(value.min * 0.995),
          max: (value: any) => Math.ceil(value.max * 1.005),
        },
        {
          type: 'value' as const,
          position: 'right' as const,
          gridIndex: 1,
          axisLine: { lineStyle: { color: '#2e3947' } },
          axisLabel: {
            color: '#CCCCCC',
            formatter: (value: number) => formatVolumeNumber(value),
            inside: false,
            margin: 8,
            fontSize: 12,
          },
          splitLine: {
            show: true,
            lineStyle: { color: 'rgba(100, 100, 100, 0.2)' },
          },
          min: 0,
          max: yAxisVolumeRange.max,
        },
      ],
      dataZoom: [
        {
          type: 'inside' as const,
          xAxisIndex: [0, 1],
          filterMode: 'filter' as const,
          start: dataZoomRange.start,
          end: dataZoomRange.end,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          preventDefaultMouseMove: false,
          minSpan: 5,
          maxSpan: 100,
        },
        {
          type: 'slider' as const,
          show: true,
          xAxisIndex: [0, 1],
          filterMode: 'filter' as const,
          start: dataZoomRange.start,
          end: dataZoomRange.end,
          height: 30,
          bottom: 10,
          borderColor: '#2e3947',
          fillerColor: 'rgba(80, 80, 100, 0.3)',
          handleStyle: {
            color: '#8392A5',
          },
          minSpan: 5,
          maxSpan: 100,
        },
      ],
      series: [
        {
          name: '캔들차트',
          type: 'candlestick' as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: filteredChartData.map((item) => [item.open, item.close, item.low, item.high]),
          itemStyle: {
            color: RISE_COLOR,
            color0: FALL_COLOR,
            borderColor: RISE_COLOR,
            borderColor0: FALL_COLOR,
          },
          barWidth: '70%',
          markLine: {
            symbol: 'none',
            lineStyle: {
              color: currentPriceColor,
              width: 1,
              type: 'dashed' as const,
            },
            label: {
              show: true,
              position: 'end' as const,
              formatter: formatKoreanNumber(Math.floor(currentData.close)),
              backgroundColor: currentPriceColor,
              padding: [4, 8],
              borderRadius: 2,
              color: '#FFFFFF',
              fontSize: 10,
            },
            data: [
              {
                yAxis: currentData.close,
                lineStyle: {
                  color: currentPriceColor,
                },
              },
            ],
          },
        },
        {
          name: '5일 이평선',
          type: 'line' as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: ema5Data,
          smooth: true,
          lineStyle: {
            opacity: 0.8,
            color: '#f6c85d',
            width: 1,
          },
          symbol: 'none',
          connectNulls: true,
        },
        {
          name: '20일 이평선',
          type: 'line' as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: ema20Data,
          smooth: true,
          lineStyle: {
            opacity: 0.8,
            color: '#8b62d9',
            width: 1,
          },
          symbol: 'none',
          connectNulls: true,
        },
        {
          name: '거래량',
          type: 'bar' as const,
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: extendedChartData.map((item, index) => {
            if (index < 10) return 0;
            return item.volume;
          }),
          itemStyle: {
            color: (params: any) => {
              const index = params.dataIndex;
              if (index < 0 || index >= extendedChartData.length) return FALL_COLOR;

              const currentItem = extendedChartData[index];
              const prevItem = index > 0 ? extendedChartData[index - 1] : null;

              if (!prevItem) return currentItem.close >= currentItem.open ? RISE_COLOR : FALL_COLOR;
              return currentItem.close >= prevItem.close ? RISE_COLOR : FALL_COLOR;
            },
          },
          barWidth: '70%',
          markLine: {
            symbol: 'none',
            lineStyle: {
              width: 1,
              type: 'solid' as const,
            },
            label: {
              show: true,
              position: 'end' as const,
              formatter: formatVolumeNumber(currentData.volume),
              backgroundColor: currentPriceColor,
              padding: [4, 8],
              borderRadius: 2,
              color: '#FFFFFF',
              fontSize: 10,
            },
            data: [
              {
                yAxis: currentData.volume,
                lineStyle: {
                  color: currentPriceColor,
                },
              },
            ],
          },
        },
      ],
    };
  }, [
    period,
    dataZoomRange,
    xAxisLabels,
    extendedChartData,
    ema5Data,
    ema20Data,
    currentData,
    formatKoreanNumber,
    formatDetailDate,
    formatVolumeNumber,
    effectiveChartData,
    transformedChartData.length,
    currentPriceColor,
    height,
    filteredChartData,
    yAxisVolumeRange,
  ]);

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    // 차트 인스턴스 참조 저장
    let chartInstance: any = null;
    let isDestroyed = false;

    // 차트 인스턴스 가져오기
    if (chartRef.current) {
      try {
        chartInstance = chartRef.current.getEchartsInstance();
      } catch (e) {
        // 차트 인스턴스 가져오기 실패 오류 무시
      }
    }

    // 성능 최적화를 위한 리사이즈 이벤트 처리
    const handleResize = () => {
      if (chartInstance && !isDestroyed && !chartInstance.isDisposed()) {
        try {
          chartInstance.resize();
        } catch (e) {
          // 차트 리사이즈 중 오류 무시
        }
      }
    };

    // 윈도우 리사이즈 이벤트 등록
    window.addEventListener('resize', handleResize);

    // echarts-for-react 내부의 resize-detector가 ResizeObserver를 사용하면서 오류가 발생하므로
    // 이를 패치하기 위한 함수
    const patchEChartsResizeObserver = () => {
      // 전역 참조가 없다면 추가
      if (!window.__PATCHED_RESIZE_OBSERVER__) {
        // echarts-for-react의 내부 함수에 접근하기 위한 시도
        if (chartRef.current) {
          const echartsElement = chartRef.current as any;

          // 원래 dispose 함수를 저장하고 덮어쓰기
          if (echartsElement && echartsElement.dispose) {
            const originalDispose = echartsElement.dispose;
            echartsElement.dispose = function (...args: unknown[]) {
              isDestroyed = true;
              try {
                return originalDispose.apply(this, args);
              } catch (e) {
                // echartsElement.dispose 오류 무시
              }
            };
          }

          window.__PATCHED_RESIZE_OBSERVER__ = true;
        }
      }
    };

    // 패치 적용
    patchEChartsResizeObserver();

    // 언마운트 시 정리
    return () => {
      // 플래그 설정
      isDestroyed = true;

      // 윈도우 리사이즈 이벤트 제거
      window.removeEventListener('resize', handleResize);

      // 모든 ResizeObserver 관련 작업 전에 약간의 지연을 줌
      setTimeout(() => {
        try {
          // 차트 인스턴스 정리
          if (chartInstance && !chartInstance.isDisposed()) {
            try {
              // 모든 이벤트 핸들러 제거
              chartInstance.off();
              // 차트 내용 정리
              chartInstance.clear();
            } catch (e) {
              // 차트 정리 중 오류 무시
            }

            try {
              // dispose 호출
              chartInstance.dispose();
            } catch (e) {
              // 차트 dispose 중 오류 무시
            }
          }
        } catch (e) {
          // 차트 정리 중 오류 무시
        }
      }, 0);
    };
  }, []);

  // 기본 렌더 함수
  const renderChart = useCallback(() => {
    return (
      <ReactECharts
        ref={chartRef}
        option={memoizedOption}
        style={{ height: `${height}px`, width: '100%' }}
        notMerge={false}
        lazyUpdate={true}
        opts={{
          renderer: 'canvas',
          devicePixelRatio: window.devicePixelRatio || 1,
        }}
        onEvents={eventHandlers}
        // 기간 변경 시에만 키가 변경되도록 설정
        key={`chart-${period}`}
      />
    );
  }, [memoizedOption, height, eventHandlers, period]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: '#0D192B' }}
    >
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
      {renderChart()}
    </div>
  );
};

export default ChartComponent;
