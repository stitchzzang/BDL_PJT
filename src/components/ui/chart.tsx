'use client';

import type { EChartsOption, SeriesOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

// Y축 스케일 상태 관리를 위한 인터페이스 추가
interface YAxisScale {
  min: number;
  max: number;
}

// 캔들차트 시리즈 생성 함수
const createCandleSeries = (
  scaledCandleData: number[][],
  scaledEMA5Data: (number | null)[],
  scaledEMA20Data: (number | null)[],
  currentData: ExtendedDataPoint,
  formatKoreanNumber: (value: number) => string,
): SeriesOption[] => {
  const currentPriceColor = currentData.close >= currentData.open ? RISE_COLOR : FALL_COLOR;

  return [
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
      barWidth: '85%',
      markLine: {
        symbol: ['none', 'none'],
        animation: false,
        silent: true,
        lineStyle: {
          color: currentPriceColor,
          width: 1,
          type: 'dashed',
        },
        label: {
          show: true,
          position: 'end',
          distance: 0,
          offset: [0, 0],
          formatter: formatKoreanNumber(Math.floor(currentData.close)),
          backgroundColor: currentPriceColor,
          padding: [4, 7, 4, 7],
          borderRadius: 2,
          color: '#FFFFFF',
          fontSize: 12,
        },
        data: [
          {
            yAxis: Math.floor(currentData.close),
            label: {
              show: true,
              position: 'end',
              distance: 0,
              offset: [0, 0],
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
  ];
};

// 거래량 시리즈 생성 함수
const createVolumeSeries = (
  showVolume: boolean,
  scaledVolumeData: number[],
  extendedChartData: ExtendedDataPoint[],
  currentData: ExtendedDataPoint,
  formatVolumeNumber: (value: number) => string,
): SeriesOption[] => {
  const currentPriceColor = currentData.close >= currentData.open ? RISE_COLOR : FALL_COLOR;

  return [
    {
      name: '거래량',
      type: 'bar',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: showVolume
        ? scaledVolumeData.map((volume, index) => ({
            value: volume,
            itemStyle: {
              color:
                index < 10
                  ? FALL_COLOR
                  : extendedChartData[index].close >= extendedChartData[index].open
                    ? RISE_COLOR
                    : FALL_COLOR,
            },
          }))
        : [],
      barWidth: '85%',
      markLine: {
        symbol: 'none',
        lineStyle: { color: 'transparent' },
        label: {
          show: true,
          position: 'end',
          formatter: formatVolumeNumber(currentData.volume),
          backgroundColor: currentPriceColor,
          padding: [4, 7, 4, 7],
          borderRadius: 2,
          color: '#FFFFFF',
          fontSize: 12,
        },
        data: [
          {
            yAxis: currentData.volume,
            label: {
              show: true,
              position: 'end',
            },
          },
        ],
      },
    },
  ];
};

export const ChartComponent: React.FC<ChartComponentProps> = ({ height = 700, data }) => {
  const [period, setPeriod] = useState<PeriodType>('DAY');
  const [showVolume] = useState<boolean>(true);
  const [volumeHeightRatio, setVolumeHeightRatio] = useState<number>(0.2);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHoveringCandleY, setIsHoveringCandleY] = useState(false);
  const [isHoveringVolumeY, setIsHoveringVolumeY] = useState(false);
  const chartRef = useRef<ReactECharts>(null);
  const [candleYScale, setCandleYScale] = useState<YAxisScale>({ min: 0, max: 100 });
  const [volumeYScale, setVolumeYScale] = useState<YAxisScale>({ min: 0, max: 100 });

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

  // 초기 Y축 스케일 설정
  useEffect(() => {
    const chartData = getData();
    if (chartData.length === 0) return;

    // 캔들차트 스케일 계산
    const prices = chartData.map((item) => [item.high, item.low]).flat();
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const priceMargin = priceRange * 0.1;

    setCandleYScale({
      min: Math.floor(minPrice - priceMargin),
      max: Math.ceil(maxPrice + priceMargin),
    });

    // 거래량 차트 스케일 계산
    const volumes = chartData.map((item) => item.volume);
    const maxVolume = Math.max(...volumes);
    const volumeMargin = maxVolume * 0.1;

    setVolumeYScale({
      min: 0,
      max: Math.ceil(maxVolume + volumeMargin),
    });
  }, [data, period, getData]);

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

  // 기간별 날짜 포맷팅 함수 (포인터 및 툴크용)
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

  // 거래량 차트의 높이 비율 상수 정의
  const VOLUME_HEIGHT_RATIO = volumeHeightRatio;

  // 거래량 데이터 스케일링 함수 수정
  const scaleVolumeData = useCallback(() => {
    // 유효한 데이터만 필터링
    const validData = extendedChartData.filter((item, index) => index >= 10);
    if (validData.length === 0) return [];

    const maxVolume = Math.max(...validData.map((item) => item.volume));
    const volumeRange = volumeYScale.max - volumeYScale.min;

    return extendedChartData.map((item, index) => {
      if (index < 10) return 0;
      return item.volume; // 원본 거래량 값을 직접 사용
    });
  }, [extendedChartData, volumeYScale]);

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
  const currentData =
    chartData.length > 0
      ? chartData[chartData.length - 1]
      : {
          close: 0,
          open: 0,
          volume: 0,
        };
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

  // 드래그 이벤트 핸들러
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    try {
      console.log('handleDragStart called', e);
      e.preventDefault();
      setIsDragging(true);
      document.body.style.cursor = 'row-resize';

      const chartElement = document.querySelector('.echarts-for-react');
      if (chartElement) {
        (chartElement as HTMLElement).style.pointerEvents = 'none';
      }
    } catch (error) {
      console.error('Error in handleDragStart:', error);
    }
  }, []);

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      try {
        if (!isDragging) return;

        const chartElement = document.querySelector('.echarts-for-react');
        if (!chartElement) return;

        const rect = chartElement.getBoundingClientRect();
        const chartTop = rect.top + 40;
        const chartBottom = rect.bottom - 60;
        const chartHeight = chartBottom - chartTop;

        // 마우스 위치가 차트 영역을 벗어나지 않도록 제한
        const mouseY = Math.max(chartTop, Math.min(chartBottom, e.clientY));
        const relativeY = mouseY - chartTop;

        // 비율 계산 (최소 5%, 최대 70%)
        let newRatio = 1 - relativeY / chartHeight;
        newRatio = Math.max(0.05, Math.min(0.7, newRatio));

        setVolumeHeightRatio(newRatio);
      } catch (error) {
        console.error('Error in handleDragMove:', error);
      }
    },
    [isDragging],
  );

  const handleDragEnd = useCallback(() => {
    try {
      setIsDragging(false);
      document.body.style.cursor = 'default';

      const chartElement = document.querySelector('.echarts-for-react');
      if (chartElement) {
        (chartElement as HTMLElement).style.pointerEvents = 'auto';
      }
    } catch (error) {
      console.error('Error in handleDragEnd:', error);
    }
  }, []);

  // 드래그 이벤트 리스너 등록/해제
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      try {
        if (isDragging) {
          handleDragMove(e);
        }
      } catch (error) {
        console.error('Error in handleGlobalMouseMove:', error);
      }
    };

    const handleGlobalMouseUp = () => {
      try {
        if (isDragging) {
          handleDragEnd();
        }
      } catch (error) {
        console.error('Error in handleGlobalMouseUp:', error);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mouseleave', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mouseleave', handleGlobalMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  useEffect(() => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    // 줌 설정 초기화
    const initZoom = () => {
      chart.dispatchAction({
        type: 'dataZoom',
        start: dataZoomRange.start,
        end: dataZoomRange.end,
        xAxisIndex: [0, 1],
      });
    };

    // 마우스 이벤트 핸들러
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.echarts-for-react')) return;

      // 차트 그리드 영역인지 확인
      const gridElements = document.querySelectorAll('.echarts-grid');
      let isInGridArea = false;

      gridElements.forEach((grid) => {
        const rect = grid.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          isInGridArea = true;
        }
      });

      if (!isInGridArea) return;

      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;

      const chartElement = document.querySelector('.echarts-for-react');
      if (chartElement) {
        (chartElement as HTMLElement).style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      // X축 이동 - 데이터줌 사용
      const moveX = e.clientX - lastX;
      const chartWidth = chart.getWidth();
      const moveRatio = (moveX / chartWidth) * 10; // 이동 민감도 조절

      // 현재 dataZoom 상태 가져오기
      const dataZoomOption = chart.getOption() as any;
      const moveCurrentStart = dataZoomOption.dataZoom?.[0]?.start ?? dataZoomRange.start;
      const moveCurrentEnd = dataZoomOption.dataZoom?.[0]?.end ?? dataZoomRange.end;
      const moveRange = moveCurrentEnd - moveCurrentStart;

      // 새 위치 계산 (이동 방향 반대로 적용)
      let newStart = moveCurrentStart - moveRatio;
      let newEnd = moveCurrentEnd - moveRatio;

      // 범위 제한
      if (newStart < 0) {
        newStart = 0;
        newEnd = moveRange;
      } else if (newEnd > 100) {
        newEnd = 100;
        newStart = 100 - moveRange;
      }

      // 데이터줌 적용
      chart.dispatchAction({
        type: 'dataZoom',
        start: newStart,
        end: newEnd,
        xAxisIndex: [0, 1],
      });

      // Y축 이동 (Y축 범위 변경)
      const moveY = e.clientY - lastY;
      const chartHeight = chart.getHeight();
      const yMoveRatio = (moveY / chartHeight) * 5; // Y축 이동 민감도

      // 캔들 차트 Y축 이동
      const currentCandleMin = candleYScale.min;
      const currentCandleMax = candleYScale.max;
      const candleRange = currentCandleMax - currentCandleMin;
      const candleMoveAmount = candleRange * yMoveRatio;

      // 거래량 차트 Y축 이동
      const currentVolumeMin = volumeYScale.min;
      const currentVolumeMax = volumeYScale.max;
      const volumeRange = currentVolumeMax - currentVolumeMin;
      const volumeMoveAmount = volumeRange * yMoveRatio;

      // 새 Y축 범위 설정
      setCandleYScale({
        min: currentCandleMin + candleMoveAmount,
        max: currentCandleMax + candleMoveAmount,
      });

      setVolumeYScale({
        min: Math.max(0, currentVolumeMin + volumeMoveAmount),
        max: currentVolumeMax + volumeMoveAmount,
      });

      // 마지막 위치 업데이트
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseUp = () => {
      if (!isDragging) return;

      isDragging = false;
      const chartElement = document.querySelector('.echarts-for-react');
      if (chartElement) {
        (chartElement as HTMLElement).style.cursor = 'grab';
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.echarts-for-react')) return;

      // 차트 그리드 영역인지 확인
      const gridElements = document.querySelectorAll('.echarts-grid');
      let isInGridArea = false;

      gridElements.forEach((grid) => {
        const rect = grid.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          isInGridArea = true;
        }
      });

      if (!isInGridArea) return;

      e.preventDefault();

      // 줌 방향 감지 (delta가 양수면 축소, 음수면 확대)
      const zoomDirection = e.deltaY > 0 ? 1 : -1;

      // 모든 축 동시에 확대/축소

      // 1. X축 확대/축소
      const zoomFactor = zoomDirection < 0 ? 0.8 : 1.2; // 줌인은 0.8, 줌아웃은 1.2
      const zoomDataOption = chart.getOption() as any;
      const zoomCurrentStart = zoomDataOption.dataZoom?.[0]?.start ?? dataZoomRange.start;
      const zoomCurrentEnd = zoomDataOption.dataZoom?.[0]?.end ?? dataZoomRange.end;
      const zoomCurrentRange = zoomCurrentEnd - zoomCurrentStart;
      const newRange = Math.min(Math.max(zoomCurrentRange * zoomFactor, 5), 100);

      // 줌 센터 계산
      const chartRect = chart.getDom().getBoundingClientRect();
      const mouseX = e.clientX - chartRect.left;
      const totalWidth = chartRect.width;
      const zoomCenter =
        (mouseX / totalWidth) * (zoomCurrentEnd - zoomCurrentStart) + zoomCurrentStart;

      // 새 범위 계산
      const rangeHalf = newRange / 2;
      let newStart = Math.max(0, zoomCenter - rangeHalf);
      let newEnd = Math.min(100, zoomCenter + rangeHalf);

      if (newStart < 0) {
        newStart = 0;
        newEnd = newRange;
      } else if (newEnd > 100) {
        newEnd = 100;
        newStart = 100 - newRange;
      }

      chart.dispatchAction({
        type: 'dataZoom',
        start: newStart,
        end: newEnd,
        xAxisIndex: [0, 1],
      });

      // 2. Y축 확대/축소
      // 캔들 차트 Y축
      const currentCandleMin = candleYScale.min;
      const currentCandleMax = candleYScale.max;
      const candleRange = currentCandleMax - currentCandleMin;
      const newCandleRange = candleRange * zoomFactor;

      // Y축 줌 센터 계산
      const mouseY = e.clientY - chartRect.top;
      const splitPosition = chartRect.height * (1 - volumeHeightRatio);
      const isInCandleArea = mouseY < splitPosition;

      if (isInCandleArea) {
        // 캔들 영역에서 Y축 줌
        const candleHeight = splitPosition;
        const candleRatio = mouseY / candleHeight;
        const centerValue = currentCandleMin + candleRange * candleRatio;

        setCandleYScale({
          min: centerValue - newCandleRange * candleRatio,
          max: centerValue + newCandleRange * (1 - candleRatio),
        });
      } else {
        // 거래량 영역에서 Y축 줌
        const currentVolumeMin = volumeYScale.min;
        const currentVolumeMax = volumeYScale.max;
        const volumeRange = currentVolumeMax - currentVolumeMin;
        const newVolumeRange = volumeRange * zoomFactor;

        const volumeHeight = chartRect.height - splitPosition;
        const volumeRatio = (mouseY - splitPosition) / volumeHeight;
        const centerVolume = currentVolumeMin + volumeRange * volumeRatio;

        setVolumeYScale({
          min: Math.max(0, centerVolume - newVolumeRange * volumeRatio),
          max: centerVolume + newVolumeRange * (1 - volumeRatio),
        });
      }
    };

    // 차트 DOM 스타일과 이벤트 설정
    const chartDom = chart.getDom();
    if (chartDom) {
      chartDom.style.cursor = 'grab';

      chartDom.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseleave', handleMouseUp);
      chartDom.addEventListener('wheel', handleWheel, { passive: false });
    }

    // 초기 줌 설정
    initZoom();

    return () => {
      if (chartDom) {
        chartDom.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mouseleave', handleMouseUp);
        chartDom.removeEventListener('wheel', handleWheel);
      }
    };
  }, [chartRef, dataZoomRange, candleYScale, volumeYScale, volumeHeightRatio]);

  // Y축 스크롤 이벤트 핸들러를 useEffect 내부로 이동
  useEffect(() => {
    const handleYAxisScroll = (event: WheelEvent, isCandle: boolean) => {
      event.preventDefault();
      event.stopPropagation();

      const delta = event.deltaY;
      const zoomFactor = delta > 0 ? 1.1 : 0.9;

      if (isCandle) {
        setCandleYScale((prev) => {
          const range = prev.max - prev.min;
          const centerValue = (prev.max + prev.min) / 2;
          const newRange = range * zoomFactor;

          return {
            min: centerValue - newRange / 2,
            max: centerValue + newRange / 2,
          };
        });
      } else {
        setVolumeYScale((prev) => {
          const range = prev.max - prev.min;
          const centerValue = (prev.max + prev.min) / 2;
          const newRange = range * zoomFactor;

          return {
            min: Math.max(0, centerValue - newRange / 2),
            max: centerValue + newRange / 2,
          };
        });
      }
    };

    const candleYAxisElement = document.querySelector('.candle-y-axis');
    const volumeYAxisElement = document.querySelector('.volume-y-axis');

    const handleCandleWheel = (e: Event) => {
      handleYAxisScroll(e as WheelEvent, true);
    };

    const handleVolumeWheel = (e: Event) => {
      handleYAxisScroll(e as WheelEvent, false);
    };

    if (candleYAxisElement) {
      candleYAxisElement.addEventListener('wheel', handleCandleWheel, { passive: false });
    }

    if (volumeYAxisElement) {
      volumeYAxisElement.addEventListener('wheel', handleVolumeWheel, { passive: false });
    }

    return () => {
      if (candleYAxisElement) {
        candleYAxisElement.removeEventListener('wheel', handleCandleWheel);
      }
      if (volumeYAxisElement) {
        volumeYAxisElement.removeEventListener('wheel', handleVolumeWheel);
      }
    };
  }, []);

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
      },
      backgroundColor: 'rgba(19, 23, 34, 0.9)',
      borderColor: '#2e3947',
      textStyle: {
        color: '#fff',
      },
      formatter: (params: any) => {
        try {
          if (!Array.isArray(params) || params.length === 0) return '';

          const dataIndex = params[0].dataIndex;
          if (dataIndex < 0 || dataIndex >= extendedChartData.length) return '';

          const item = extendedChartData[dataIndex];
          if (!item) return '';

          // 왼쪽 여백 데이터 처리
          if (dataIndex < 10) {
            return `
              <div style="font-size: 12px;">
                <div style="margin-bottom: 4px;">-</div>
                <div>시가: -</div>
                <div>고가: -</div>
                <div>저가: -</div>
                <div>종가: -</div>
                <div>거래량: -</div>
              </div>
            `;
          }

          const formattedDate =
            'rawDate' in item && item.rawDate ? formatDetailDate(item.rawDate) : item.date;
          const volumeStr = formatVolumeNumber(item.volume);
          const openStr = formatKoreanNumber(item.open) + '원';
          const highStr = formatKoreanNumber(item.high) + '원';
          const lowStr = formatKoreanNumber(item.low) + '원';
          const closeStr = formatKoreanNumber(item.close) + '원';

          return `
            <div style="font-size: 12px;">
              <div style="margin-bottom: 4px;">${formattedDate}</div>
              <div>시가: ${openStr}</div>
              <div>고가: ${highStr}</div>
              <div>저가: ${lowStr}</div>
              <div>종가: ${closeStr}</div>
              <div>거래량: ${volumeStr}</div>
            </div>
          `;
        } catch {
          return '';
        }
      },
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
      label: {
        backgroundColor: FALL_COLOR,
        show: false, // 기본적으로 모든 축포인터 레이블을 숨김
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

          // Y축 포인터는 해당하는 축의 포맷터 사용
          const numValue = Number(params.value);
          if (params.axisIndex === 0) {
            return formatKoreanNumber(Math.floor(numValue));
          } else {
            return formatVolumeNumber(Math.floor(numValue));
          }
        },
      },
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.2)',
        width: 1,
        type: 'dashed',
      },
    },
    grid: [
      {
        left: 80,
        right: 100, // Y축 라벨과 겹치지 않도록 여백 증가
        top: 40,
        height: `${(1 - volumeHeightRatio - 0.05) * 100}%`, // 간격 더 넓게
        show: true,
        borderColor: '#1a2536',
        backgroundColor: '#0a1421',
      },
      {
        left: 80,
        right: 100, // Y축 라벨과 겹치지 않도록 여백 증가
        top: `${(1 - volumeHeightRatio + 0.05) * 100}%`, // 간격 더 넓게
        bottom: 60,
        show: true,
        borderColor: '#1a2536',
        backgroundColor: '#0a1421',
      },
    ],
    xAxis: [
      {
        type: 'category',
        data: xAxisLabels,
        gridIndex: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(26, 37, 54, 0.4)',
            width: 1,
            type: [2, 2],
          },
        },
        axisLabel: { show: false },
        axisPointer: {
          show: true,
          label: { show: false },
        },
        boundaryGap: true,
      },
      {
        type: 'category',
        data: xAxisLabels,
        gridIndex: 1,
        position: 'bottom',
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(26, 37, 54, 0.4)',
            width: 1,
            type: [2, 2],
          },
        },
        axisLabel: {
          show: true,
          color: '#999',
          fontSize: 11,
          margin: 12,
        },
        axisPointer: {
          show: true,
          label: {
            show: true,
            backgroundColor: '#2a3546',
            color: '#fff',
            fontSize: 11,
            padding: [4, 8],
          },
        },
        boundaryGap: true,
      },
    ],
    yAxis: [
      {
        type: 'value',
        position: 'right',
        scale: true,
        gridIndex: 0,
        splitNumber: 6,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(26, 37, 54, 0.4)',
            width: 1,
            type: [2, 2],
          },
        },
        axisLabel: {
          inside: false,
          color: '#999',
          fontSize: 11,
          padding: [0, 0, 0, 10],
          formatter: (value: number) => {
            const formattedValue = formatKoreanNumber(Math.floor(value));
            if (Math.abs(value - currentData.close) < 0.1) {
              return `{current|${formattedValue}}`;
            }
            return formattedValue;
          },
          rich: {
            current: {
              backgroundColor: currentPriceColor,
              padding: [2, 6],
              borderRadius: 2,
              color: '#FFFFFF',
              fontSize: 11,
            },
          },
        },
        min: candleYScale.min,
        max: candleYScale.max,
        boundaryGap: ['10%', '10%'],
      },
      {
        type: 'value',
        position: 'right',
        scale: true,
        gridIndex: 1,
        splitNumber: 3,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            color: 'rgba(26, 37, 54, 0.4)',
            width: 1,
            type: [2, 2],
          },
        },
        axisLabel: {
          inside: false,
          color: '#999',
          fontSize: 11,
          padding: [0, 0, 0, 10],
          formatter: (value: number) => formatVolumeNumber(value),
        },
        min: volumeYScale.min,
        max: volumeYScale.max,
        boundaryGap: ['10%', '10%'],
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: dataZoomRange.start,
        end: dataZoomRange.end,
        zoomLock: false,
        moveOnMouseMove: true,
        preventDefaultMouseMove: true,
      },
    ],
    series: [
      {
        name: '캔들차트',
        type: 'candlestick',
        data: scaledCandleData,
        itemStyle: {
          color: RISE_COLOR,
          color0: FALL_COLOR,
          borderColor: RISE_COLOR,
          borderColor0: FALL_COLOR,
          borderWidth: 1,
        },
        barWidth: '70%',
      },
      {
        name: '5일 이평선',
        type: 'line',
        data: scaledEMA5Data,
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
        type: 'line',
        data: scaledEMA20Data,
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
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: scaledVolumeData.map((volume, index) => ({
          value: volume,
          itemStyle: {
            color:
              extendedChartData[index].close >= extendedChartData[index].open
                ? RISE_COLOR
                : FALL_COLOR,
            opacity: 0.8,
          },
        })),
        barWidth: '70%',
      },
    ],
  };

  // 차트 옵션 메모이제이션
  const chartOption = useMemo(
    () => ({
      ...option,
      animation: false,
    }),
    [option],
  );

  // 차트 이벤트 핸들러 메모이제이션
  const onEvents = useMemo(
    () => ({
      finished: () => {
        try {
          const chart = chartRef.current?.getEchartsInstance();
          if (chart && !chart.isDisposed()) {
            requestAnimationFrame(() => {
              if (chart && !chart.isDisposed()) {
                chart.resize();
              }
            });
          }
        } catch (error) {
          console.error('Chart finished event error:', error);
        }
      },
    }),
    [],
  );

  // 차트 크기 조정 핸들러
  const handleResize = useCallback(() => {
    try {
      const chart = chartRef.current?.getEchartsInstance();
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    } catch (error) {
      console.error('Resize error:', error);
    }
  }, []);

  // 컴포넌트 마운트/언마운트 처리
  useEffect(() => {
    let mounted = true;
    let resizeTimeout: number | null = null;

    const handleResize = () => {
      if (resizeTimeout) {
        window.cancelAnimationFrame(resizeTimeout);
      }

      resizeTimeout = window.requestAnimationFrame(() => {
        try {
          const chart = chartRef.current?.getEchartsInstance();
          if (mounted && chart && !chart.isDisposed()) {
            chart.resize();
          }
        } catch (error) {
          console.error('Resize error:', error);
        }
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      if (resizeTimeout) {
        window.cancelAnimationFrame(resizeTimeout);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 차트 옵션 업데이트
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = chartRef.current.getEchartsInstance();
    if (!chart || chart.isDisposed()) return;

    try {
      chart.setOption(chartOption, {
        notMerge: false,
        lazyUpdate: true,
        silent: true,
      });
    } catch (error) {
      console.error('Chart update error:', error);
    }
  }, [chartOption]);

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden relative"
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
      <div className="relative" style={{ height: `${height}px` }}>
        <div
          className="absolute right-0 top-0 bottom-0 w-20 z-10 candle-y-axis"
          style={{ cursor: isHoveringCandleY ? 'ns-resize' : 'default' }}
          onMouseEnter={() => setIsHoveringCandleY(true)}
          onMouseLeave={() => setIsHoveringCandleY(false)}
        />
        <div
          className="absolute right-0 bottom-0 w-20 z-10 volume-y-axis"
          style={{
            height: `${height * volumeHeightRatio}px`,
            cursor: isHoveringVolumeY ? 'ns-resize' : 'default',
          }}
          onMouseEnter={() => setIsHoveringVolumeY(true)}
          onMouseLeave={() => setIsHoveringVolumeY(false)}
        />
        {data && data.length > 0 && (
          <ReactECharts
            ref={chartRef}
            option={chartOption}
            style={{ height: '100%', width: '100%' }}
            opts={{
              renderer: 'canvas',
              width: 'auto',
              height: 'auto',
            }}
            onEvents={onEvents}
            notMerge={false}
            lazyUpdate={true}
            theme="theme_name"
          />
        )}
        <div
          className="absolute z-10"
          style={{
            left: '80px',
            right: '80px',
            top: `${(1 - volumeHeightRatio) * 100}%`,
            height: '8px',
            backgroundColor: isDragging ? '#4a90e2' : '#1a2536',
            transition: isDragging ? 'none' : 'background-color 0.2s ease',
            cursor: 'row-resize',
            transform: 'translateZ(0)',
            willChange: 'transform',
            userSelect: 'none',
            touchAction: 'none',
            pointerEvents: 'auto',
            borderTop: '2px solid #2a3546',
            borderBottom: '2px solid #2a3546',
          }}
          onMouseDown={(e) => {
            try {
              handleDragStart(e);
            } catch (error) {
              console.error('Error in onMouseDown event:', error);
            }
          }}
        />
      </div>
    </div>
  );
};

export default ChartComponent;
