import ReactECharts from 'echarts-for-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DataPoint } from '@/mocks/dummy-data';

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

// echarts-for-react 라이브러리 내부의 ResizeObserver 오류 패치
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
            // 원본 메서드 호출
            super.disconnect();
          } catch (e) {
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
          try {
            return super.unobserve(target);
          } catch (e) {
            // 오류 무시
          }
        }
      } as unknown as typeof ResizeObserver;

      // 패치 적용 표시
      window.__PATCHED_RESIZE_OBSERVER__ = true;
    }
  } catch (e) {
    // ResizeObserver 패치 중 오류 무시
  }
}

// 기존 DataPoint 확장 인터페이스 (rawDate 속성 추가)
interface ExtendedDataPoint extends DataPoint {
  rawDate?: Date;
}

interface ChartComponentProps {
  readonly height?: number;
  readonly ratio?: number;
  readonly data: DataPoint[];
}

type PeriodType = 'MINUTE' | 'DAY' | 'WEEK' | 'MONTH';

const RISE_COLOR = '#ef5350'; // 빨강
const FALL_COLOR = '#1976d2'; // 파랑

const ChartComponent: React.FC<ChartComponentProps> = ({ height = 700, data }) => {
  const [period, setPeriod] = useState<PeriodType>('MINUTE');
  const chartRef = useRef<ReactECharts>(null);
  const [dataZoomRange, setDataZoomRange] = useState({ start: 30, end: 100 });
  const [visibleDataIndices, setVisibleDataIndices] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });
  const [showVolume, _setShowVolume] = useState<boolean>(true);

  // 서비스 동작을 위한 더미 데이터 생성 함수
  const generateDummyMinuteData = useCallback((): ExtendedDataPoint[] => {
    const result: ExtendedDataPoint[] = [];

    // 시작 날짜 설정 (오늘 9:00)
    const startDate = new Date();
    startDate.setHours(9, 0, 0, 0);

    // 기본 가격 설정
    const basePrice = 50000;
    let prevClose = basePrice;

    // 9:01부터 15:30까지 1분 단위로 데이터 생성
    for (let i = 1; i <= 390; i++) {
      // 9:01 ~ 15:30까지 390분
      const currentDate = new Date(startDate);
      currentDate.setMinutes(currentDate.getMinutes() + i);

      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();

      // 장 운영 시간이 아니면 건너뛰기 (9:01-15:20 및 15:30만 포함)
      const isValidTime =
        (hours === 9 && minutes >= 1) ||
        (hours > 9 && hours < 15) ||
        (hours === 15 && minutes <= 20) ||
        (hours === 15 && minutes === 30);

      if (!isValidTime) continue;

      // 동시호가 시간(15:21~15:29)인지 확인
      const isDynamicAuction = hours === 15 && minutes >= 21 && minutes <= 29;

      // 랜덤 가격 변동 (-200 ~ +200)
      const priceChange = isDynamicAuction ? 0 : Math.floor(Math.random() * 400) - 200;
      const close = prevClose + priceChange;

      // 고가와 저가 계산
      const volatility = isDynamicAuction ? 50 : 500;
      const high = close + Math.floor(Math.random() * volatility);
      const low = close - Math.floor(Math.random() * volatility);

      // 거래량 계산 (동시호가 시간에는 0)
      const volume = isDynamicAuction ? 0 : Math.floor(Math.random() * 10000) + 1000;

      // 시가는 이전 종가를 기준으로 약간의 변동을 줌
      const open = prevClose + (Math.floor(Math.random() * 100) - 50);

      result.push({
        date: currentDate.toString(), // 실제 날짜 문자열 저장
        open,
        high,
        low,
        close,
        volume,
        changeType: close >= open ? 'RISE' : 'FALL',
        rawDate: currentDate,
        periodType: 'MINUTE' as const,
      });

      prevClose = close;
    }

    return result;
  }, []);

  // 1분봉 더미 데이터 생성 (최초 한 번만)
  const minuteDummyData = useMemo(() => generateDummyMinuteData(), [generateDummyMinuteData]);

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

  // 기간별 날짜 포맷팅 함수 (상세 표시용)
  const formatDetailDate = useCallback(
    (date: Date): string => {
      switch (period) {
        case 'MINUTE':
          // YYYY-MM-DD HH:MM 형식
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        case 'DAY':
        case 'WEEK':
          // YYYY-MM-DD 형식
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        case 'MONTH':
          // YYYY-MM 형식
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        default:
          return date.toISOString().split('T')[0];
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

    let result: ExtendedDataPoint[];

    switch (period) {
      case 'MINUTE':
        // 1분봉: 직접 생성한 더미 데이터 사용
        result = minuteDummyData.map((item) => ({
          ...item,
          date: formatChartDate(item.rawDate as Date), // X축 라벨용 포맷팅
        }));
        break;

      case 'WEEK':
        // 주봉: 월~금 5일 단위로 데이터 그룹화
        result = data.reduce<DataPoint[]>((acc, curr, i) => {
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
                rawDate: weekDate, // 원시 날짜 정보 저장
              });
            }
          }
          return acc;
        }, []) as ExtendedDataPoint[];
        break;

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

        result = Object.entries(monthlyGroups)
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
              rawDate: monthDate, // 원시 날짜 정보 저장
            };
          }) as ExtendedDataPoint[];
        break;
      }

      case 'DAY':
      default:
        // 일봉: 하루 단위 데이터 그대로 사용
        result = data.map((item) => {
          const date = new Date(item.date);
          return {
            ...item,
            date: formatChartDate(date),
            periodType: 'DAY' as const,
            rawDate: date, // 원시 날짜 정보 저장
          };
        }) as ExtendedDataPoint[];
        break;
    }

    return result;
  }, [period, data, minuteDummyData, formatChartDate]);

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

  const chartData = getData();

  // 차트 데이터가 비어있는지 확인하고, 분봉의 경우 데이터가 없으면 더미 데이터 사용
  const effectiveChartData = useMemo(() => {
    if (period === 'MINUTE' && chartData.length === 0) {
      return minuteDummyData;
    }
    return chartData;
  }, [period, chartData, minuteDummyData]);

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
        return item.date;
      });

      // 다음 거래일 데이터 추가 (15:00 이후 9:01부터)
      if (labels.length > 0 && effectiveChartData.length > 0) {
        const lastItem = effectiveChartData[effectiveChartData.length - 1];
        if (lastItem && lastItem.rawDate) {
          const lastDataTime = lastItem.rawDate as Date;
          const nextDay = new Date(lastDataTime);

          // 다음 날 9:01부터 표시
          nextDay.setDate(nextDay.getDate() + 1);
          nextDay.setHours(9, 1, 0, 0);

          // 여유 공간 추가 (다음 거래일 9:01 ~ 9:30)
          for (let i = 0; i < 30; i++) {
            const newTime = new Date(nextDay);
            newTime.setMinutes(newTime.getMinutes() + i);
            labels.push(formatChartDate(newTime));
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
        return item.date;
      });

      // 오른쪽 여유 공간 추가 (10개의 레이블)
      if (labels.length > 0 && effectiveChartData.length > 0) {
        const lastLabel = labels[labels.length - 1];

        // 다른 기간의 경우 기존 로직 유지
        for (let i = 1; i <= 10; i++) {
          let newLabel = '';

          switch (period) {
            case 'DAY': {
              const dayMatch = lastLabel.match(/(\d+)일/);
              const monthMatch = lastLabel.match(/(\d+)월/);

              if (dayMatch) {
                let day = parseInt(dayMatch[1]) + i;
                let month = monthMatch ? parseInt(monthMatch[1]) : 1;

                const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                while (day > daysInMonth[month]) {
                  day -= daysInMonth[month];
                  month++;
                  if (month > 12) month = 1;
                }

                if (day === 1) {
                  newLabel = `${month}월`;
                } else {
                  newLabel = `${day}일`;
                }
              }
              break;
            }
            case 'WEEK': {
              const dayMatch = lastLabel.match(/(\d+)일/);
              const monthMatch = lastLabel.match(/(\d+)월/);

              if (dayMatch) {
                let day = parseInt(dayMatch[1]) + i * 7;
                let month = monthMatch ? parseInt(monthMatch[1]) : 1;

                const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                while (day > daysInMonth[month]) {
                  day -= daysInMonth[month];
                  month++;
                  if (month > 12) month = 1;
                }

                if (day <= 7) {
                  newLabel = `${month}월`;
                } else {
                  newLabel = `${day}일`;
                }
              }
              break;
            }
            case 'MONTH': {
              const monthMatch = lastLabel.match(/(\d+)월/);
              const yearMatch = lastLabel.match(/(\d+)년/);

              let month, year;

              // 마지막 레이블이 '월'인 경우 (예: '12월')
              if (monthMatch) {
                month = parseInt(monthMatch[1]) + i;
                // 마지막 레이블에 표시된 연도가 없는 경우 현재 연도를 사용
                // 하지만 실제로는 마지막 데이터의 연도를 사용해야 함
                year = new Date().getFullYear(); // 기본값

                // chartData에서 마지막 데이터의 연도 가져오기 (더 정확함)
                if (
                  effectiveChartData.length > 0 &&
                  effectiveChartData[effectiveChartData.length - 1].rawDate
                ) {
                  year = (
                    effectiveChartData[effectiveChartData.length - 1].rawDate as Date
                  ).getFullYear();
                }

                // 12월에서 1월로 넘어갈 때 연도 증가
                if (monthMatch[1] === '12' && month > 12) {
                  year += 1;
                  month = month - 12;
                }
                // 그 외 일반적인 월 증가에 따른 연도 처리
                else if (month > 12) {
                  year += Math.floor((month - 1) / 12);
                  month = ((month - 1) % 12) + 1;
                }
              }
              // 마지막 레이블이 '년'인 경우 (예: '2024년')
              else if (yearMatch) {
                year = parseInt(yearMatch[1]);
                month = i;

                if (month > 12) {
                  year += Math.floor((month - 1) / 12);
                  month = ((month - 1) % 12) + 1;
                }
              }
              // 어떤 경우도 해당하지 않을 때는 현재 날짜 사용
              else {
                const now = new Date();
                year = now.getFullYear();
                month = now.getMonth() + 1 + i;

                if (month > 12) {
                  year += Math.floor((month - 1) / 12);
                  month = ((month - 1) % 12) + 1;
                }
              }

              // 1월인 경우 연도 표시
              if (month === 1) {
                newLabel = `${year}년`;
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

  // 거래량 범위 계산
  const getVolumeRange = useCallback(() => {
    const maxVolume = getMaxVolume();
    return {
      min: 0,
      max: Math.ceil(maxVolume * 1.1),
    };
  }, [getMaxVolume]);

  // 가격 범위 계산
  const getPriceRange = useCallback(() => {
    // 유효한 데이터만 필터링
    const validData = effectiveChartData.filter((d) => d !== null && d !== undefined);
    if (validData.length === 0) return { min: 0, max: 100, volumeMax: 10 };

    // 데이터 줌 상태에 따라 현재 보이는 데이터만 사용
    let visibleData = validData;
    if (visibleDataIndices.end > visibleDataIndices.start) {
      // 왼쪽 패딩 영역(10개 항목)을 고려하여 인덱스 조정
      const adjustedStart = Math.max(0, visibleDataIndices.start - 10);
      const adjustedEnd = Math.min(effectiveChartData.length - 1, visibleDataIndices.end - 10);

      if (adjustedEnd >= adjustedStart) {
        visibleData = effectiveChartData
          .slice(adjustedStart, adjustedEnd + 1)
          .filter((d) => d !== null && d !== undefined);
      }
    }

    // 빈 배열 확인
    if (visibleData.length === 0) visibleData = validData;

    const prices = visibleData.flatMap((d) => [d.high, d.low]);
    let min = Math.min(...prices);
    let max = Math.max(...prices);

    // EMA 데이터도 포함해서 범위 계산 (현재 보이는 부분만)
    let visibleEma5Data = ema5Data;
    let visibleEma20Data = ema20Data;

    if (visibleDataIndices.end > visibleDataIndices.start) {
      // ema 데이터는 effectiveChartData와 길이가 같도록 맞춰져 있음
      visibleEma5Data = ema5Data.slice(visibleDataIndices.start, visibleDataIndices.end + 1);
      visibleEma20Data = ema20Data.slice(visibleDataIndices.start, visibleDataIndices.end + 1);
    }

    const validEma5 = visibleEma5Data.filter((d): d is number => d !== null && d !== undefined);
    const validEma20 = visibleEma20Data.filter((d): d is number => d !== null && d !== undefined);

    if (validEma5.length > 0) {
      min = Math.min(min, ...validEma5);
      max = Math.max(max, ...validEma5);
    }

    if (validEma20.length > 0) {
      min = Math.min(min, ...validEma20);
      max = Math.max(max, ...validEma20);
    }

    // 최대 거래량 계산 (현재 보이는 부분만)
    const visibleVolumeMax = Math.max(...visibleData.map((d) => d.volume));
    const volumeMax = visibleVolumeMax * 1.1; // 10% 여유 공간

    // 패딩 추가
    const padding = (max - min) * 0.05; // 5% 패딩
    const adjustedMin = Math.max(0, min - padding);
    const adjustedMax = max + padding;

    // 가격 차트와 거래량 차트 사이의 간격을 위한
    // 전체 Y축 높이를 늘려 각 차트가 별도의 영역을 갖도록 함
    const totalRangeHeight =
      (adjustedMax - adjustedMin) / (1 - VOLUME_HEIGHT_RATIO - VOLUME_GAP_RATIO);
    const newMax = adjustedMin + totalRangeHeight;

    return {
      min: adjustedMin,
      max: newMax,
      volumeMax,
    };
  }, [effectiveChartData, ema5Data, ema20Data, visibleDataIndices]);

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

  // 구분선 위치 계산
  const dividerLinePosition = useCallback(() => {
    const priceRange = getPriceRange();
    const priceHeight = priceRange.max - priceRange.min;
    return priceRange.min + priceHeight * VOLUME_HEIGHT_RATIO;
  }, [getPriceRange]);

  // 캔들 데이터 스케일링
  const scaledCandleData = useMemo(() => {
    const priceRange = getPriceRange();
    const priceHeight = priceRange.max - priceRange.min;
    // 캔들차트 표시 영역 (구분선 위)
    const candleChartMin = priceRange.min + priceHeight * (VOLUME_HEIGHT_RATIO + VOLUME_GAP_RATIO);

    return extendedChartData.map((item, index) => {
      // 왼쪽 여백 데이터 처리
      if (index < 10) {
        return ['-', '-', '-', '-'];
      }

      // 실제 데이터 처리
      const open = Number(item.open);
      const close = Number(item.close);
      const low = Number(item.low);
      const high = Number(item.high);

      if (isNaN(open) || isNaN(close) || isNaN(low) || isNaN(high)) {
        return ['-', '-', '-', '-'];
      }

      // 기존 값 범위에서 캔들차트 영역으로 스케일링
      // min, max 함수 대신 minValue, maxValue 함수 사용
      const minValue = () => {
        const minValues = effectiveChartData
          .filter((d) => d !== null && d !== undefined)
          .map((d) => Math.min(d.low, d.high, d.open, d.close));
        return Math.min(...minValues);
      };

      const maxValue = () => {
        const maxValues = effectiveChartData
          .filter((d) => d !== null && d !== undefined)
          .map((d) => Math.max(d.low, d.high, d.open, d.close));
        return Math.max(...maxValues);
      };

      const originalRange = maxValue() - minValue();
      const chartRange = priceRange.max - candleChartMin;
      const scaleFactor = chartRange / (originalRange || 1); // 0으로 나누기 방지

      const scaledOpen = candleChartMin + (open - minValue()) * scaleFactor;
      const scaledClose = candleChartMin + (close - minValue()) * scaleFactor;
      const scaledLow = candleChartMin + (low - minValue()) * scaleFactor;
      const scaledHigh = candleChartMin + (high - minValue()) * scaleFactor;

      return [
        Math.floor(scaledOpen),
        Math.floor(scaledClose),
        Math.floor(scaledLow),
        Math.floor(scaledHigh),
      ];
    });
  }, [extendedChartData, getPriceRange, effectiveChartData]);

  // EMA 데이터 스케일링
  const scaledEMA5Data = useMemo(() => {
    const priceRange = getPriceRange();
    const priceHeight = priceRange.max - priceRange.min;
    // EMA 표시 영역 (구분선 위)
    const emaMin = priceRange.min + priceHeight * (VOLUME_HEIGHT_RATIO + VOLUME_GAP_RATIO);

    return ema5Data.map((value) => {
      if (value === null) return '-';

      // 원본 데이터에서 EMA 영역으로 스케일링
      const originalMin = Math.min(
        ...effectiveChartData
          .filter((d) => d !== null && d !== undefined)
          .map((d) => Math.min(d.low, d.open, d.close)),
      );

      const originalMax = Math.max(
        ...effectiveChartData
          .filter((d) => d !== null && d !== undefined)
          .map((d) => Math.max(d.high, d.open, d.close)),
      );

      const originalRange = originalMax - originalMin;
      const chartRange = priceRange.max - emaMin;
      const scaleFactor = chartRange / (originalRange || 1);

      const scaledValue = emaMin + (value - originalMin) * scaleFactor;
      return Math.floor(scaledValue);
    });
  }, [ema5Data, getPriceRange, effectiveChartData]);

  const scaledEMA20Data = useMemo(() => {
    const priceRange = getPriceRange();
    const priceHeight = priceRange.max - priceRange.min;
    // EMA 표시 영역 (구분선 위)
    const emaMin = priceRange.min + priceHeight * (VOLUME_HEIGHT_RATIO + VOLUME_GAP_RATIO);

    return ema20Data.map((value) => {
      if (value === null) return '-';

      // 원본 데이터에서 EMA 영역으로 스케일링
      const originalMin = Math.min(
        ...effectiveChartData
          .filter((d) => d !== null && d !== undefined)
          .map((d) => Math.min(d.low, d.open, d.close)),
      );

      const originalMax = Math.max(
        ...effectiveChartData
          .filter((d) => d !== null && d !== undefined)
          .map((d) => Math.max(d.high, d.open, d.close)),
      );

      const originalRange = originalMax - originalMin;
      const chartRange = priceRange.max - emaMin;
      const scaleFactor = chartRange / (originalRange || 1);

      const scaledValue = emaMin + (value - originalMin) * scaleFactor;
      return Math.floor(scaledValue);
    });
  }, [ema20Data, getPriceRange, effectiveChartData]);

  // 거래량 데이터 스케일링
  const scaledVolumeData = useMemo(() => {
    const priceRange = getPriceRange();
    const volumeRange = getVolumeRange();

    // 가격 차트와 거래량 차트의 높이 비율 계산
    const priceHeight = priceRange.max - priceRange.min;
    const volumeHeight = priceHeight * VOLUME_HEIGHT_RATIO;

    return extendedChartData.map((item, index) => {
      // 왼쪽 여백 데이터 처리
      if (index < 10) {
        return 0; // null 대신 0 사용하여 타입 오류 방지
      }

      const volume = Number(item.volume);
      if (isNaN(volume) || volume === 0) {
        return 0; // null 대신 0 사용하여 타입 오류 방지
      }

      // 원래 거래량을 0~최대거래량 범위에서 -> 0~volumeHeight 범위로 스케일링
      const volumeRatio = volume / volumeRange.max;
      // 거래량은 구분선 아래에만 표시
      const scaledVolume = priceRange.min + volumeRatio * volumeHeight;

      return Math.floor(scaledVolume);
    });
  }, [extendedChartData, getPriceRange, getVolumeRange]);

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
    (params: any) => {
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
        confine: true, // 툴크 영역 제한
        enterable: false, // 툴크 마우스 진입 비활성화
        appendToBody: false, // 툴크를 body에 추가하지 않음
        showContent: true, // 툴크 콘텐츠 표시 활성화
        alwaysShowContent: false, // 항상 표시 비활성화
        backgroundColor: 'rgba(19, 23, 34, 0.9)',
        borderColor: '#2e3947',
        textStyle: {
          color: '#fff',
        },
        formatter: (params: any) => {
          const candleData = params.find((p: any) => p.seriesName === '캔들차트');
          const volumeData = params.find((p: any) => p.seriesName === '거래량');
          const ema5Data = params.find((p: any) => p.seriesName === '5일 이평선');
          const ema20Data = params.find((p: any) => p.seriesName === '20일 이평선');

          if (!candleData) return '';

          const date = candleData.name;
          const dataIndex = candleData.dataIndex;

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
            candleData.data.some((val: any) => typeof val !== 'number' || isNaN(val))
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
          if (dataIndex >= 10 + chartData.length) {
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

          // 데이터 추출 - ECharts 캔들차트 데이터 순서는 [open, close, low, high]
          const [open, close, low, high] = candleData.data;

          // 날짜 형식 변환 - 요구사항에 맞게 포맷팅
          let formattedDate = date;
          const item = extendedChartData[dataIndex];
          if (item && 'rawDate' in item && item.rawDate instanceof Date) {
            formattedDate = formatDetailDate(item.rawDate);
          }

          // 거래량 데이터 추출
          const volume = volumeData ? extendedChartData[dataIndex].volume : 0;

          // 숫자 여부 확인하고 문자열 포맷팅
          const openStr =
            typeof open === 'number' && !isNaN(open) ? formatKoreanNumber(open) + '원' : '-';
          const closeStr =
            typeof close === 'number' && !isNaN(close) ? formatKoreanNumber(close) + '원' : '-';
          const lowStr =
            typeof low === 'number' && !isNaN(low) ? formatKoreanNumber(low) + '원' : '-';
          const highStr =
            typeof high === 'number' && !isNaN(high) ? formatKoreanNumber(high) + '원' : '-';
          const volumeStr = volume ? formatVolumeNumber(volume) : '-';
          const ema5Str =
            ema5Data && typeof ema5Data.value === 'number' && !isNaN(ema5Data.value)
              ? formatKoreanNumber(ema5Data.value) + '원'
              : '-';
          const ema20Str =
            ema20Data && typeof ema20Data.value === 'number' && !isNaN(ema20Data.value)
              ? formatKoreanNumber(ema20Data.value) + '원'
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
        link: [{ xAxisIndex: 'all' as const }],
        label: {
          backgroundColor: FALL_COLOR,
          formatter: (params: any) => {
            // 값이 빈 문자열이거나 숫자인 경우 그대로 반환
            if (!params.value || typeof params.value === 'number') {
              return params.value;
            }

            // 현재 레이블 위치에 해당하는 데이터 인덱스 찾기
            const labelIndex = xAxisLabels.findIndex((label) => label === params.value);
            if (labelIndex < 0 || labelIndex < 10 || labelIndex >= extendedChartData.length) {
              return params.value; // 원래 레이블 반환
            }

            // 해당 인덱스의 데이터 찾기
            const item = extendedChartData[labelIndex];
            if (!item) return params.value;

            // rawDate 속성이 있는지 확인
            if ('rawDate' in item && item.rawDate instanceof Date) {
              return formatDetailDate(item.rawDate);
            }

            return params.value;
          },
        },
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
          type: 'dashed' as const,
        },
        snap: true,
        triggerTooltip: false,
      },
      grid: {
        left: '5%',
        right: '15%',
        top: '8%',
        bottom: '15%',
        containLabel: true,
        show: true,
        borderColor: '#2e3947',
        backgroundColor: 'transparent',
      },
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
              const isBold = isFirstOfPeriod(value, index);

              // 다음 거래일 시작 (9:01) 표시 강화
              if (period === 'MINUTE' && value === '09:01' && index > extendedChartData.length) {
                return `{nextDay|${value}}`;
              }

              return isBold ? value : value;
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
          axisPointer: {
            label: {
              formatter: (params: any) => {
                // 값이 빈 문자열이거나 숫자인 경우 그대로 반환
                if (!params.value || typeof params.value === 'number') {
                  return params.value;
                }

                // 현재 레이블 위치에 해당하는 데이터 인덱스 찾기
                const labelIndex = xAxisLabels.findIndex((label) => label === params.value);
                if (labelIndex < 0 || labelIndex < 10 || labelIndex >= extendedChartData.length) {
                  return params.value; // 원래 레이블 반환
                }

                // 해당 인덱스의 데이터 찾기
                const item = extendedChartData[labelIndex];
                if (!item) return params.value;

                // rawDate 속성이 있는지 확인
                if ('rawDate' in item && item.rawDate instanceof Date) {
                  return formatDetailDate(item.rawDate);
                }

                return params.value;
              },
            },
          },
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
            formatter: (value: number) => {
              const priceRange = getPriceRange();
              const priceHeight = priceRange.max - priceRange.min;
              const dividerPos = priceRange.min + priceHeight * VOLUME_HEIGHT_RATIO;

              if (value >= dividerPos) {
                return formatKoreanNumber(Math.floor(value));
              } else {
                // 음수 값이나 0 미만인 경우 처리
                if (value < 0) return '0';

                const volumeHeight = Math.max(0, priceRange.volumeMax - priceRange.min);
                if (volumeHeight <= 0) return '0';

                const volumeRatio = (value - priceRange.min) / volumeHeight;
                const originalVolume = volumeRatio * priceRange.volumeMax;
                return formatVolumeNumber(Math.max(0, Math.floor(originalVolume)));
              }
            },
            inside: false,
            margin: 8,
            fontSize: 12,
          },
          axisPointer: {
            label: {
              formatter: (params: any) => {
                try {
                  const numValue = Number(params.value);
                  const priceRange = getPriceRange();
                  const priceHeight = priceRange.max - priceRange.min;
                  const dividerPos = priceRange.min + priceHeight * VOLUME_HEIGHT_RATIO;

                  if (numValue >= dividerPos) {
                    return formatKoreanNumber(Math.floor(numValue));
                  } else {
                    // 음수 값이나 0 미만인 경우 처리
                    if (numValue < 0) return '0';

                    const volumeHeight = Math.max(0, priceRange.volumeMax - priceRange.min);
                    if (volumeHeight <= 0) return '0';

                    const volumeRatio = (numValue - priceRange.min) / volumeHeight;
                    const originalVolume = volumeRatio * priceRange.volumeMax;
                    return formatVolumeNumber(Math.max(0, Math.floor(originalVolume)));
                  }
                } catch {
                  // 오류 무시
                }
                return '-';
              },
              backgroundColor: FALL_COLOR,
            },
          },
          min: getPriceRange().min,
          max: getPriceRange().max,
        },
      ],
      dataZoom: [
        {
          type: 'inside' as const,
          filterMode: 'filter' as const,
          start: dataZoomRange.start,
          end: dataZoomRange.end,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          preventDefaultMouseMove: false,
          rangeMode: ['value', 'value'] as ['value', 'value'],
          minSpan: 5,
          maxSpan: 100,
        },
        {
          type: 'slider' as const,
          show: true,
          filterMode: 'filter' as const,
          start: dataZoomRange.start,
          end: dataZoomRange.end,
          height: 20,
          bottom: 50,
          borderColor: '#2e3947',
          fillerColor: 'rgba(80, 80, 100, 0.3)',
          handleStyle: {
            color: '#8392A5',
          },
          rangeMode: ['value', 'value'] as ['value', 'value'],
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
          data: scaledCandleData,
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
                // 현재가를 캔들차트 영역으로 스케일링
                yAxis: (() => {
                  if (!currentData) return 0;
                  const priceRange = getPriceRange();
                  const priceHeight = priceRange.max - priceRange.min;
                  const candleChartMin =
                    priceRange.min + priceHeight * (VOLUME_HEIGHT_RATIO + VOLUME_GAP_RATIO);

                  const originalMin = Math.min(
                    ...effectiveChartData
                      .filter((d) => d !== null && d !== undefined)
                      .map((d) => Math.min(d.low, d.open, d.close)),
                  );

                  const originalMax = Math.max(
                    ...effectiveChartData
                      .filter((d) => d !== null && d !== undefined)
                      .map((d) => Math.max(d.high, d.open, d.close)),
                  );

                  const originalRange = originalMax - originalMin;
                  const chartRange = priceRange.max - candleChartMin;
                  const scaleFactor = chartRange / (originalRange || 1);

                  return Math.floor(
                    candleChartMin + (currentData.close - originalMin) * scaleFactor,
                  );
                })(),
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
          data: scaledEMA5Data,
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
          data: scaledEMA20Data,
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
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: showVolume ? scaledVolumeData : [],
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
                // null 값이 들어갈 수 있는 경우 0 또는 기본값 사용
                yAxis:
                  scaledVolumeData.length > 0
                    ? scaledVolumeData[scaledVolumeData.length - 1] || 0
                    : 0,
                lineStyle: {
                  color: 'transparent',
                },
              },
            ],
          },
        },
        {
          name: '구분선',
          type: 'line' as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              color: '#2e3947',
              width: 2,
              type: 'solid' as const,
            },
            label: {
              show: false,
            },
            data: [
              {
                yAxis: dividerLinePosition(),
                lineStyle: {
                  width: 2,
                  color: '#2e3947',
                  type: 'solid' as const,
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
    visibleDataIndices,
    xAxisLabels,
    getPriceRange,
    scaledCandleData,
    scaledEMA5Data,
    scaledEMA20Data,
    scaledVolumeData,
    currentData,
    showVolume,
    FALL_COLOR,
    RISE_COLOR,
    formatKoreanNumber,
    formatDetailDate,
    formatVolumeNumber,
    dividerLinePosition,
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
