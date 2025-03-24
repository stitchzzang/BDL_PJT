'use client';

import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DataPoint } from '@/mocks/dummy-data';

interface ChartComponentProps {
  readonly height?: number;
  readonly ratio?: number;
  readonly data: DataPoint[];
}

// 드래그 가능한 분할선 컴포넌트
interface DividerLineProps {
  initialRatio: number;
  onRatioChange: (ratio: number) => void;
  height: number;
}

const DividerLine: React.FC<DividerLineProps> = ({ initialRatio, onRatioChange, height }) => {
  const dividerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ratio, setRatio] = useState(initialRatio);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dividerRef.current) return;

      const containerRect = dividerRef.current.parentElement?.getBoundingClientRect();
      if (!containerRect) return;

      // 차트의 실제 영역에 맞게 조정 (상단 헤더와 하단 여백 제외)
      const chartTopOffset = 60; // 상단 헤더 높이
      const chartBottomOffset = 60; // 하단 여백
      const chartHeight = height - chartTopOffset - chartBottomOffset;

      // 마우스 Y 위치를 차트 내부의 상대적 위치로 변환
      const relativeY = e.clientY - containerRect.top - chartTopOffset;
      const chartRelativeY = Math.max(0, Math.min(relativeY, chartHeight));

      // 차트 내에서의 비율 계산 (아래로 내리면 비율이 작아지도록 변경)
      const newRatio = 1 - chartRelativeY / chartHeight;

      // 비율 제한 (10% ~ 50%)
      const clampedRatio = Math.max(0.1, Math.min(0.5, newRatio));

      setRatio(clampedRatio);
      onRatioChange(clampedRatio);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, height, onRatioChange]);

  // 차트 영역 내에서의 위치 계산
  const calculatePosition = () => {
    const chartTopOffset = 60; // 상단 헤더 높이
    const chartBottomOffset = 60; // 하단 여백
    const chartHeight = height - chartTopOffset - chartBottomOffset;

    // 비율에 따른 픽셀 위치 계산 (아래로 내리면 비율이 작아지도록 계산)
    const pixelPosition = chartTopOffset + chartHeight * (1 - ratio);

    // 전체 높이에 대한 백분율 계산
    return (pixelPosition / height) * 100;
  };

  const positionPercent = calculatePosition();

  return (
    <div
      ref={dividerRef}
      className={`absolute cursor-row-resize transition-colors ${isDragging ? 'z-20' : 'z-10'}`}
      style={{
        top: `${positionPercent}%`,
        height: '16px',
        marginTop: '-8px',
        left: '80px', // 그리드 왼쪽 여백과 일치
        right: '80px', // 그리드 오른쪽 여백과 일치
        width: 'calc(100% - 160px)', // 그리드 영역 너비에 맞춤
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`relative h-[4px] w-full transition-all duration-200 ${
          isDragging ? 'bg-blue-500' : 'bg-[#2e3947] hover:bg-blue-500/70'
        }`}
      >
        {/* 드래그 핸들 */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className={`flex h-5 w-10 items-center justify-center rounded-sm bg-[#131722] transition-all duration-200 ${
              isDragging ? 'border border-blue-500' : 'border border-[#2e3947]'
            }`}
          >
            <div className="flex gap-[3px]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-[2px] rounded-full ${
                    isDragging ? 'bg-blue-500' : 'bg-[#2e3947]'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type PeriodType = 'MINUTE' | 'DAY' | 'WEEK' | 'MONTH';

const RISE_COLOR = '#ef5350'; // 빨강
const FALL_COLOR = '#1976d2'; // 파랑

const ChartComponent: React.FC<ChartComponentProps> = ({ height = 700, data }) => {
  const [period, setPeriod] = useState<PeriodType>('DAY');
  const [showVolume, _setShowVolume] = useState<boolean>(true);
  const [zoom, setZoom] = useState<{ start: number; end: number }>({ start: 10, end: 100 });

  // 거래량 차트 비율 상태 추가
  const [volumeRatio, setVolumeRatio] = useState<number>(0.2);

  // 차트 컨테이너 참조
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // ECharts 인스턴스를 참조하기 위한 변수 추가
  const chartRef = useRef<ReactECharts>(null);

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

    let result;

    switch (period) {
      case 'MINUTE':
        // 1분봉: 실제 1분 단위 데이터 생성 (9:00 ~ 15:30)
        result = data
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

        // 우측 여유 공간 추가
        if (result.length > 0) {
          const lastData = result[result.length - 1];
          const lastDate = new Date(lastData.date);

          for (let i = 1; i <= 10; i++) {
            const newDate = new Date(lastDate);
            newDate.setMinutes(newDate.getMinutes() + i);
            if (
              newDate.getHours() <= 15 &&
              (newDate.getHours() < 15 || newDate.getMinutes() <= 30)
            ) {
              result.push({
                date: formatChartDate(newDate),
                open: lastData.close,
                high: lastData.close,
                low: lastData.close,
                close: lastData.close,
                volume: 0,
                changeType: 'NONE' as const,
                periodType: 'MINUTE' as const,
              });
            }
          }
        }
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
              });
            }
          }
          return acc;
        }, []);
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
            };
          });
        break;
      }

      case 'DAY':
      default:
        // 일봉: 하루 단위 데이터 그대로 사용
        result = data.map((item) => ({
          ...item,
          date: formatChartDate(new Date(item.date)),
          periodType: 'DAY' as const,
        }));
        break;
    }

    return result;
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
  // 앞쪽에 10개의 빈 데이터 추가
  const extendedChartData = useMemo(() => {
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

    // 분봉의 경우 우측 여유 공간 추가
    if (period === 'MINUTE' && chartData.length > 0) {
      const lastData = chartData[chartData.length - 1];
      const lastDate = new Date(lastData.date);

      for (let i = 1; i <= 10; i++) {
        const newDate = new Date(lastDate);
        newDate.setMinutes(newDate.getMinutes() + i);
        if (newDate.getHours() <= 15 && (newDate.getHours() < 15 || newDate.getMinutes() <= 30)) {
          baseData.push({
            date: formatChartDate(newDate),
            open: lastData.close,
            high: lastData.close,
            low: lastData.close,
            close: lastData.close,
            volume: 0,
            changeType: 'NONE' as const,
            periodType: 'MINUTE' as const,
          });
        }
      }
    }

    return baseData;
  }, [chartData, period, formatChartDate]);

  const closePrices = extendedChartData.map((item, index) =>
    index < 10 ? '-' : Math.floor(item.close),
  );
  const ema5Data = calculateEMA(
    closePrices.map((p) => (p === '-' ? null : p)),
    5,
  );
  const ema20Data = calculateEMA(
    closePrices.map((p) => (p === '-' ? null : p)),
    20,
  );

  // X축 레이블 데이터 생성 (실제 데이터 + 빈 공간용 레이블)
  const xAxisLabels = useMemo(() => {
    // 앞쪽 빈 데이터에 대한 레이블 생성
    const labels = extendedChartData.map((item, index) => {
      if (index < 10) {
        // 앞쪽 빈 데이터에 대한 레이블 생성
        if (chartData.length > 0) {
          const firstLabel = chartData[0].date;
          let newLabel = '';

          if (period === 'MINUTE') {
            // 분봉의 경우 시간 계산
            const firstDate = new Date(firstLabel);
            const newDate = new Date(firstDate);
            newDate.setMinutes(newDate.getMinutes() - (10 - index));
            return formatChartDate(newDate);
          }

          switch (period) {
            case 'DAY': {
              const dayMatch = firstLabel.match(/(\d+)일/);
              const monthMatch = firstLabel.match(/(\d+)월/);

              if (dayMatch) {
                let day = parseInt(dayMatch[1]) - (10 - index);
                let month = monthMatch ? parseInt(monthMatch[1]) : 1;

                const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                while (day <= 0) {
                  month--;
                  if (month <= 0) month = 12;
                  day += daysInMonth[month];
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
              const dayMatch = firstLabel.match(/(\d+)일/);
              const monthMatch = firstLabel.match(/(\d+)월/);

              if (dayMatch) {
                let day = parseInt(dayMatch[1]) - (10 - index) * 7;
                let month = monthMatch ? parseInt(monthMatch[1]) : 1;

                const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                while (day <= 0) {
                  month--;
                  if (month <= 0) month = 12;
                  day += daysInMonth[month];
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
              const monthMatch = firstLabel.match(/(\d+)월/);
              const yearMatch = firstLabel.match(/(\d+)년/);

              if (monthMatch) {
                let month = parseInt(monthMatch[1]) - (10 - index);
                let year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

                while (month <= 0) {
                  year--;
                  month += 12;
                }

                if (month === 1) {
                  newLabel = `${year}년`;
                } else {
                  newLabel = `${month}월`;
                }
              }
              break;
            }
          }

          return newLabel;
        }
        return '';
      }
      return item.date;
    });

    // 마지막 데이터 이후에 10개의 빈 레이블 추가
    if (labels.length > 0) {
      const lastLabel = labels[labels.length - 1];

      if (period === 'MINUTE') {
        // 분봉의 경우 마지막 시간 이후의 레이블 생성
        const lastDate = new Date(chartData[chartData.length - 1].date);
        for (let i = 1; i <= 10; i++) {
          const newDate = new Date(lastDate);
          newDate.setMinutes(newDate.getMinutes() + i);
          if (newDate.getHours() <= 15 && (newDate.getHours() < 15 || newDate.getMinutes() <= 30)) {
            labels.push(formatChartDate(newDate));
          }
        }
      } else {
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

              if (monthMatch) {
                let month = parseInt(monthMatch[1]) + i;
                let year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

                if (month > 12) {
                  year += Math.floor((month - 1) / 12);
                  month = ((month - 1) % 12) + 1;
                }

                if (month === 1) {
                  newLabel = `${year}년`;
                } else {
                  newLabel = `${month}월`;
                }
              }
              break;
            }
          }

          if (newLabel) {
            labels.push(newLabel);
          }
        }
      }
    }

    return labels;
  }, [extendedChartData, period, chartData, formatChartDate]);

  // 거래량 차트와 캔들차트 사이의 간격 비율 (전체 높이의 2%)
  const VOLUME_GAP_RATIO = 0.01;

  // 거래량 데이터 최대값 계산
  const getMaxVolume = useCallback(() => {
    return Math.max(...chartData.map((d) => d.volume));
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
  const priceData = extendedChartData
    .slice(10)
    .map((item) => [item.low, item.high])
    .flat();
  const minPrice = Math.min(...priceData);
  const maxPrice = Math.max(...priceData);
  const priceRange = maxPrice - minPrice;
  const pricePadding = priceRange * 0.1;

  // 스케일링된 데이터
  const scaledEMA5Data = ema5Data.map((value, index) => {
    if (index < 10 || value === null) return null;
    return value;
  });

  const scaledEMA20Data = ema20Data.map((value, index) => {
    if (index < 10 || value === null) return null;
    return value;
  });

  // 현재가 관련 데이터 계산
  const currentData = chartData[chartData.length - 1];
  const currentPriceColor = currentData.close >= currentData.open ? RISE_COLOR : FALL_COLOR;

  // ECharts 옵션 설정
  const option: EChartsOption = useMemo(() => {
    // 거래량 차트와 캔들차트 사이의 비율 계산
    const candleRatio = 1 - volumeRatio - VOLUME_GAP_RATIO;

    // 거래량 범위 계산
    const volumeData = extendedChartData.slice(10).map((item) => item.volume);
    const maxVolume = Math.max(...volumeData);

    return {
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

          // 앞쪽 빈 데이터 처리
          if (dataIndex < 10) {
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

          // 데이터 추출 - ECharts 캔들차트 데이터 순서는 [open, close, low, high]
          const [open, close, low, high] = candleData.data;

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
                <div style="margin-bottom: 4px;">${date || '-'}</div>
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
        },
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
          type: 'dashed',
        },
      },
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0],
          start: zoom.start,
          end: zoom.end,
          zoomOnMouseWheel: true,
          moveOnMouseMove: true,
          preventDefaultMouseMove: false,
          rangeMode: ['value', 'value'],
          throttle: 100,
          zoomLock: false,
          filterMode: 'filter',
        },
        {
          type: 'slider',
          show: false,
          xAxisIndex: [0],
          start: zoom.start,
          end: zoom.end,
          filterMode: 'filter',
        },
        {
          type: 'inside',
          yAxisIndex: [0],
          zoomOnMouseWheel: true,
          moveOnMouseMove: false,
          preventDefaultMouseMove: false,
          rangeMode: ['value', 'value'],
          orient: 'vertical',
          throttle: 100,
          zoomLock: false,
          filterMode: 'filter',
        },
      ],
      grid: [
        {
          // 통합 차트 영역
          left: 80,
          right: 80,
          top: 40,
          bottom: 60,
          show: true,
          borderColor: '#2e3947',
          backgroundColor: 'transparent',
          containLabel: true,
          tooltip: {
            show: true,
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
            },
          },
        },
      ],
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
              return isBold ? value : value;
            },
            interval: function (index, value) {
              const dataZoomOpt = option.dataZoom;
              const zoomRange =
                Array.isArray(dataZoomOpt) && dataZoomOpt.length > 0
                  ? (dataZoomOpt[0].end as number) - (dataZoomOpt[0].start as number)
                  : 100;

              if (zoomRange < 30) {
                return index % Math.max(1, Math.floor((20 / (zoomRange || 100)) * 10)) === 0;
              }
              return index % 5 === 0 || isFirstOfPeriod(value, index);
            },
            rotate: 0,
          },
          splitLine: {
            show: true,
            lineStyle: { color: 'rgba(100, 100, 100, 0.4)' },
          },
          axisTick: { show: true },
          boundaryGap: true,
        },
      ],
      yAxis: [
        {
          // 가격 Y축 (우측)
          type: 'value',
          position: 'right',
          scale: true,
          splitNumber: 6,
          axisLine: { lineStyle: { color: '#2e3947' } },
          splitLine: {
            show: true,
            lineStyle: { color: 'rgba(100, 100, 100, 0.4)' },
          },
          axisLabel: {
            color: '#CCCCCC',
            formatter: (value) => {
              // 영역에 따라 다른 포맷 사용
              const dividerPos = (minPrice - pricePadding) * volumeRatio;
              if (value <= dividerPos) {
                // 거래량 영역
                const ratio = value / dividerPos;
                const volumeValue = ratio * maxVolume;
                return formatVolumeNumber(Math.floor(volumeValue));
              } else {
                // 가격 영역
                return formatKoreanNumber(Math.floor(value));
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
                  const dividerPos = (minPrice - pricePadding) * volumeRatio;
                  if (numValue <= dividerPos) {
                    // 거래량 영역
                    const ratio = numValue / dividerPos;
                    const volumeValue = ratio * maxVolume;
                    return formatVolumeNumber(Math.floor(volumeValue));
                  } else {
                    // 가격 영역
                    return formatKoreanNumber(Math.floor(numValue));
                  }
                } catch (e) {
                  return '-';
                }
              },
              backgroundColor: FALL_COLOR,
            },
          },
          min: 0,
          max: maxPrice + pricePadding,
        },
      ],
      visualMap: {
        show: false,
        seriesIndex: 0,
        dimension: 1,
        pieces: [
          {
            value: 1,
            color: RISE_COLOR,
          },
          {
            value: -1,
            color: FALL_COLOR,
          },
        ],
      },
      series: [
        {
          name: '캔들차트',
          type: 'candlestick',
          data: extendedChartData.map((item, index) => {
            if (index < 10) return [0, 0, 0, 0];
            return [item.open, item.close, item.low, item.high];
          }),
          itemStyle: {
            color: RISE_COLOR,
            color0: FALL_COLOR,
            borderColor: RISE_COLOR,
            borderColor0: FALL_COLOR,
          },
          barWidth: '60%',
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
          showSymbol: false,
          data: scaledEMA5Data,
          lineStyle: {
            width: 1,
            color: '#FFC107',
          },
        },
        {
          name: '20일 이평선',
          type: 'line',
          showSymbol: false,
          data: scaledEMA20Data,
          lineStyle: {
            width: 1,
            color: '#03A9F4',
          },
        },
        {
          name: '거래량',
          type: 'bar',
          data: showVolume
            ? extendedChartData.map((item, index) => {
                if (index < 10) return 0;

                // 가격 스케일로 거래량 스케일링 - volumeRatio를 적용
                const volRatio = item.volume / maxVolume;
                // 거래량 영역의 최대 높이는 전체 차트 높이 중 volumeRatio 비율만큼
                const volumeHeight = (minPrice - pricePadding) * 0.95; // 0.95로 변경하여 여백 감소
                const scaledVolume = volRatio * volumeHeight * volumeRatio;

                return {
                  value: scaledVolume,
                  itemStyle: {
                    color: item.close >= item.open ? RISE_COLOR : FALL_COLOR,
                  },
                };
              })
            : [],
          barWidth: '60%',
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
                yAxis: (minPrice - pricePadding) * volumeRatio * 0.95, // 거래량 영역의 경계선
                lineStyle: {
                  color: '#2e3947',
                },
              },
            ],
          },
        },
      ],
    };
  }, [
    xAxisLabels,
    ema5Data,
    ema20Data,
    extendedChartData,
    volumeRatio,
    height,
    currentData,
    currentPriceColor,
    zoom,
    period,
    showVolume,
    formatChartDate,
    formatKoreanNumber,
    formatVolumeNumber,
    isFirstOfPeriod,
    VOLUME_GAP_RATIO,
  ]);

  // 볼륨 차트 높이 비율이 변경될 때 차트 재렌더링
  useEffect(() => {
    if (chartContainerRef.current && chartRef.current) {
      // ECharts 인스턴스 가져오기
      const echartsInstance = chartRef.current.getEchartsInstance();
      if (echartsInstance) {
        // 차트 옵션 업데이트
        echartsInstance.setOption(option, { notMerge: true });
        // 차트 리사이즈 트리거
        echartsInstance.resize();
      }
    }
  }, [volumeRatio, option]);

  return (
    <div
      ref={chartContainerRef}
      className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl"
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
      <div className="relative flex-grow">
        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: `${height}px`, width: '100%' }}
          notMerge={true}
          lazyUpdate={true}
          opts={{
            renderer: 'canvas',
            devicePixelRatio: window.devicePixelRatio,
          }}
          onEvents={{
            datazoom: (params: { chart?: any }) => {
              const chart = params.chart;
              if (chart) {
                chart.setOption({
                  animation: false,
                });
                const { start, end } = chart.getOption().dataZoom[0];
                setZoom({ start, end });
              }
            },
          }}
        />
        <DividerLine initialRatio={volumeRatio} onRatioChange={setVolumeRatio} height={height} />

        {/* 캔들차트 레이블 - 분할선 위에 위치 */}
        <div
          className="absolute z-10 rounded bg-[#131722]/80 px-2 py-1 text-xs text-gray-300"
          style={{
            left: '85px',
            top: '65px',
          }}
        >
          캔들차트
        </div>

        {/* 거래량 레이블 - 분할선 아래에 위치 */}
        <div
          className="absolute z-10 rounded bg-[#131722]/80 px-2 py-1 text-xs text-gray-300"
          style={{
            left: '85px',
            top: `${calculateDividerPosition(volumeRatio, height) + 15}px`,
          }}
        >
          거래량
        </div>
      </div>
    </div>
  );
};

function calculateDividerPosition(ratio: number, height: number): number {
  const chartTopOffset = 60; // 상단 헤더 높이
  const chartBottomOffset = 60; // 하단 여백
  const chartHeight = height - chartTopOffset - chartBottomOffset;

  // 비율에 따른 픽셀 위치 계산 (분할선 위치 계산 방식 변경)
  const pixelPosition = chartTopOffset + chartHeight * (1 - ratio);

  return pixelPosition;
}

export default ChartComponent;
