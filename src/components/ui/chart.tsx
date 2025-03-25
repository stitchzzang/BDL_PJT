'use client';

import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useMemo, useState } from 'react';

import { DataPoint } from '@/mocks/dummy-data';

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
  const [period, setPeriod] = useState<PeriodType>('DAY');
  const [showVolume, _setShowVolume] = useState<boolean>(true);

  // 서비스 동작을 위한 더미 데이터 생성 함수
  const generateDummyMinuteData = useCallback((): ExtendedDataPoint[] => {
    const result: ExtendedDataPoint[] = [];

    // 시작 날짜 설정 (오늘 9:00)
    const startDate = new Date();
    startDate.setHours(9, 0, 0, 0);

    // 기본 가격 설정
    let basePrice = 50000;
    let prevClose = basePrice;

    // 9:01부터 15:30까지 1분 단위로 데이터 생성
    for (let i = 1; i <= 390; i++) {
      // 9:01 ~ 15:30까지 390분
      const currentDate = new Date(startDate);
      currentDate.setMinutes(currentDate.getMinutes() + i);

      const hours = currentDate.getHours();
      const minutes = currentDate.getMinutes();

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

  const isValidTimeForMinute = useCallback((date: Date): boolean => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // 9:01-15:20까지와 15:30만 유효한 시간으로 처리 (장 운영 시간)
    return (
      (hours === 9 && minutes >= 1) ||
      (hours > 9 && hours < 15) ||
      (hours === 15 && minutes <= 20) ||
      (hours === 15 && minutes === 30)
    );
  }, []);

  const isDynamicAuctionTime = useCallback((date: Date): boolean => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // 15:21-15:29는 동시호가 시간
    return hours === 15 && minutes >= 21 && minutes <= 29;
  }, []);

  const isNextTradingDay = useCallback((date: Date): boolean => {
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // 다음 거래일 시작 (9:01)
    return hours === 9 && minutes === 1;
  }, []);

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
  }, [period, data, minuteDummyData, formatChartDate, isValidTimeForMinute, isDynamicAuctionTime]);

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

  // 기간별 날짜 포맷팅 함수 (포인터 및 툴팁용)
  const formatDetailDate = (date: Date): string => {
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
  };

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

  const chartData = getData();
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
      ...chartData,
    ];

    return baseData;
  }, [chartData]);

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
      if (labels.length > 0 && chartData.length > 0) {
        const lastItem = chartData[chartData.length - 1];
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
      if (labels.length > 0 && chartData.length > 0) {
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
                if (chartData.length > 0 && chartData[chartData.length - 1].rawDate) {
                  year = (chartData[chartData.length - 1].rawDate as Date).getFullYear();
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
  }, [extendedChartData, period, formatChartDate, chartData]);

  const closePrices = extendedChartData.map((item, index) =>
    index < 10 ? null : Math.floor(item.close),
  );
  const ema5Data = calculateEMA(closePrices, 5);
  const ema20Data = calculateEMA(closePrices, 20);

  // 거래량 차트의 높이 비율 상수 정의 (전체 높이의 20%)
  const VOLUME_HEIGHT_RATIO = 0.2;
  // 거래량 차트와 캔들차트 사이의 간격 비율 (전체 높이의 10%)
  const VOLUME_GAP_RATIO = 0.1;

  // 거래량 데이터 최대값 계산
  const getMaxVolume = useCallback(() => {
    // 유효한 데이터만 필터링
    const validData = chartData.filter((d) => d !== null && d !== undefined);
    if (validData.length === 0) return 0;
    return Math.max(...validData.map((d) => d.volume));
  }, [chartData]);

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
    const validData = chartData.filter((d) => d !== null && d !== undefined);
    if (validData.length === 0) {
      return {
        min: 0,
        max: 100,
        candleMin: 0,
        candleMax: 100,
        volumeMax: 0,
      };
    }

    const minPrice = Math.min(...validData.map((d) => d.low));
    const maxPrice = Math.max(...validData.map((d) => d.high));
    const range = maxPrice - minPrice;
    const margin = range * 0.1;

    // 캔들차트 영역의 범위 계산
    const candleMin = Math.floor(minPrice - margin);
    const candleMax = Math.ceil(maxPrice + margin);
    const candleRange = candleMax - candleMin;

    // 전체 차트 영역 계산 (거래량 영역 포함)
    const totalRange = candleRange / (1 - VOLUME_HEIGHT_RATIO - VOLUME_GAP_RATIO);
    const volumeRange = totalRange * VOLUME_HEIGHT_RATIO;

    return {
      min: candleMin - volumeRange - totalRange * VOLUME_GAP_RATIO,
      max: candleMax,
      candleMin: candleMin,
      candleMax: candleMax,
      volumeMax: candleMin - totalRange * VOLUME_GAP_RATIO,
    };
  }, [chartData]);

  // 거래량 데이터 스케일링
  const scaleVolumeData = useCallback(() => {
    const volumeRange = getVolumeRange();
    const priceRange = getPriceRange();
    const volumeHeight = priceRange.volumeMax - priceRange.min;

    return extendedChartData.map((item, index) => {
      if (index < 10) return priceRange.min; // 왼쪽 여백 데이터
      const volumeRatio = item.volume / volumeRange.max;
      return priceRange.min + volumeRatio * volumeHeight;
    });
  }, [extendedChartData, getPriceRange, getVolumeRange]);

  // 구분선 Y축 위치 계산
  const dividerLinePosition = useCallback(() => {
    const priceRange = getPriceRange();
    return priceRange.volumeMax;
  }, [getPriceRange]);

  // 캔들차트 데이터 스케일링
  const scaleCandleData = useCallback(() => {
    return extendedChartData.map((item, index) => {
      if (index < 10) return [0, 0, 0, 0]; // 왼쪽 여백 데이터
      return [item.open, item.close, item.low, item.high];
    });
  }, [extendedChartData]);

  // EMA 데이터 스케일링
  const scaleEMAData = useCallback((emaData: (number | null)[]) => {
    return emaData.map((value, index) => {
      if (index < 10 || value === null) return null;
      return value;
    });
  }, []);

  // 스케일링된 데이터
  const scaledVolumeData = scaleVolumeData();
  const scaledCandleData = scaleCandleData();
  const scaledEMA5Data = scaleEMAData(ema5Data);
  const scaledEMA20Data = scaleEMAData(ema20Data);

  // 현재가 관련 데이터 계산
  const currentData = chartData[chartData.length - 1];
  const currentPriceColor = currentData.close >= currentData.open ? RISE_COLOR : FALL_COLOR;

  // 1분봉 차트의 시작 위치와 종료 위치 계산
  const getDataZoomRange = useCallback(() => {
    if (period === 'MINUTE') {
      // 1분봉의 경우 전체 데이터를 표시
      return {
        start: 10,
        end: 90, // 전체 데이터 중 90%만 표시 (오른쪽 여백 확보)
      };
    }

    // 다른 기간의 경우 기본값 사용
    return {
      start: 10,
      end: 100,
    };
  }, [period]);

  const dataZoomRange = getDataZoomRange();

  // ECharts 옵션 설정
  const option: EChartsOption = {
    animation: false,
    backgroundColor: '#0D192B',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
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
          type: 'dashed',
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

        // 원본 데이터에서 직접 값을 가져옴
        const originalItem = extendedChartData[dataIndex];
        const open = originalItem.open;
        const close = originalItem.close;
        const low = originalItem.low;
        const high = originalItem.high;

        // 날짜 형식 변환 - 요구사항에 맞게 포맷팅
        let formattedDate = date;
        if (originalItem && 'rawDate' in originalItem && originalItem.rawDate) {
          const rawDate = originalItem.rawDate as Date;
          formattedDate = formatDetailDate(rawDate);
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
      link: [{ xAxisIndex: 'all' }],
      label: {
        backgroundColor: FALL_COLOR,
        formatter: (params: any) => {
          // X축 포인터인 경우에만 처리
          if (params.axisDimension === 'x') {
            const value = params.value;

            // 빈 값이나 숫자인 경우 처리
            if (!value || typeof value === 'number') {
              return value;
            }

            // 현재 레이블 위치에 해당하는 데이터 인덱스 찾기
            const labelIndex = xAxisLabels.findIndex((label) => label === value);
            if (labelIndex < 0 || labelIndex < 10 || labelIndex >= extendedChartData.length) {
              return value; // 원래 레이블 반환
            }

            // 해당 인덱스의 데이터 찾기
            const item = extendedChartData[labelIndex];
            if (!item || !('rawDate' in item) || !item.rawDate) {
              return value; // 원래 레이블 반환
            }

            // 기간에 맞는 상세 날짜 포맷으로 변환
            const rawDate = item.rawDate as Date;
            return formatDetailDate(rawDate);
          }

          // Y축 포인터는 기본값 사용
          return params.value;
        },
      },
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.2)',
        width: 1,
        type: 'dashed',
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
        type: 'category',
        data: xAxisLabels,
        gridIndex: 0,
        axisLine: { lineStyle: { color: '#2e3947' } },
        axisLabel: {
          show: true,
          color: '#CCCCCC',
          margin: 12,
          formatter: (value, index) => {
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
              fontWeight: 'bold',
            },
          },
        },
        splitLine: {
          show: true,
          lineStyle: { color: 'rgba(100, 100, 100, 0.4)' },
        },
        axisTick: { show: true },
        boundaryGap: true,
        axisPointer: {
          label: {
            formatter: (params: any) => {
              const value = params.value;

              // 빈 값이나 숫자인 경우 처리
              if (!value || typeof value === 'number') {
                return value;
              }

              // 현재 레이블 위치에 해당하는 데이터 인덱스 찾기
              const labelIndex = xAxisLabels.findIndex((label) => label === value);
              if (labelIndex < 0 || labelIndex < 10 || labelIndex >= extendedChartData.length) {
                return value; // 원래 레이블 반환
              }

              // 해당 인덱스의 데이터 찾기
              const item = extendedChartData[labelIndex];
              if (!item || !('rawDate' in item) || !item.rawDate) {
                return value; // 원래 레이블 반환
              }

              // 기간에 맞는 상세 날짜 포맷으로 변환
              const rawDate = item.rawDate as Date;
              return formatDetailDate(rawDate);
            },
          },
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        position: 'right',
        scale: true,
        splitNumber: 8,
        gridIndex: 0,
        axisLine: { lineStyle: { color: '#2e3947' } },
        splitLine: {
          show: true,
          lineStyle: { color: 'rgba(100, 100, 100, 0.4)' },
        },
        axisLabel: {
          color: '#CCCCCC',
          formatter: (value) => {
            const priceRange = getPriceRange();
            const volumeRange = getVolumeRange();
            const priceHeight = priceRange.max - priceRange.min;
            const dividerPos = priceRange.min + priceHeight * VOLUME_HEIGHT_RATIO;

            if (value >= dividerPos) {
              return formatKoreanNumber(Math.floor(value));
            } else {
              const volumeHeight = priceHeight * VOLUME_HEIGHT_RATIO;
              const volumeRatio = (value - priceRange.min) / volumeHeight;
              const originalVolume = volumeRatio * volumeRange.max;
              return formatVolumeNumber(Math.floor(originalVolume));
            }
          },
          inside: false,
          margin: 8,
          fontSize: 12,
        },
        axisPointer: {
          label: {
            formatter: (params) => {
              try {
                const numValue = Number(params.value);
                const priceRange = getPriceRange();
                const volumeRange = getVolumeRange();
                const priceHeight = priceRange.max - priceRange.min;
                const dividerPos = priceRange.min + priceHeight * VOLUME_HEIGHT_RATIO;

                if (numValue >= dividerPos) {
                  return formatKoreanNumber(Math.floor(numValue));
                } else {
                  const volumeHeight = priceHeight * VOLUME_HEIGHT_RATIO;
                  const volumeRatio = (numValue - priceRange.min) / volumeHeight;
                  const originalVolume = volumeRatio * volumeRange.max;
                  return formatVolumeNumber(Math.floor(originalVolume));
                }
              } catch (e) {
                return '-';
              }
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
        type: 'inside',
        filterMode: 'none',
        start: dataZoomRange.start,
        end: dataZoomRange.end,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        preventDefaultMouseMove: false,
      },
    ],
    series: [
      {
        name: '캔들차트',
        type: 'candlestick',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: scaledCandleData,
        itemStyle: {
          color: RISE_COLOR,
          color0: FALL_COLOR,
          borderColor: RISE_COLOR,
          borderColor0: FALL_COLOR,
        },
        barWidth: '90%',
        markLine: {
          symbol: 'none',
          lineStyle: {
            color: currentPriceColor,
            width: 1,
            type: 'dashed',
          },
          label: {
            show: true,
            position: 'end',
            formatter: formatKoreanNumber(Math.floor(currentData.close)),
            backgroundColor: currentPriceColor,
            padding: [4, 8],
            borderRadius: 2,
            color: '#FFFFFF',
            fontSize: 12,
            distance: 0,
          },
          data: [
            {
              yAxis: Math.floor(currentData.close),
              lineStyle: {
                color: currentPriceColor,
              },
            },
          ],
        },
      },
      {
        name: '5일 이평선',
        type: 'line',
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
        type: 'line',
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
        type: 'bar',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: showVolume ? scaledVolumeData : [],
        itemStyle: {
          color: (params: any) => {
            const index = params.dataIndex;
            if (index < 10 || index >= 10 + chartData.length) return FALL_COLOR;
            return extendedChartData[index].close >= extendedChartData[index].open
              ? RISE_COLOR
              : FALL_COLOR;
          },
        },
        barWidth: '90%',
        markLine: {
          symbol: 'none',
          lineStyle: {
            color: 'transparent',
            width: 0,
            type: 'solid',
          },
          label: {
            show: true,
            position: 'end',
            formatter: formatVolumeNumber(currentData.volume),
            backgroundColor: currentPriceColor,
            padding: [4, 8],
            borderRadius: 2,
            color: '#FFFFFF',
            fontSize: 12,
            distance: 0,
          },
          data: [
            {
              yAxis: scaledVolumeData[scaledVolumeData.length - 1],
              lineStyle: {
                color: 'transparent',
              },
            },
          ],
        },
      },
      {
        name: '구분선',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            color: '#2e3947',
            width: 2,
            type: 'solid',
          },
          label: {
            show: false,
          },
          data: [
            {
              yAxis: dividerLinePosition(),
            },
          ],
        },
      },
    ],
  };

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: '#0D192B' }}
    >
      <div className="flex items-center gap-4 p-4 text-sm text-white">
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
