'use client';

import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useMemo, useState } from 'react';

import { DataPoint } from '@/lib/dummy-data';

interface ChartComponentProps {
  readonly height?: number;
  readonly width?: number;
  readonly ratio?: number;
  readonly data: DataPoint[];
}

type PeriodType = 'MINUTE' | 'DAY' | 'WEEK' | 'MONTH';

const RISE_COLOR = '#ef5350'; // 빨강
const FALL_COLOR = '#1976d2'; // 파랑

const ChartComponent: React.FC<ChartComponentProps> = ({ width = 900, height = 700, data }) => {
  const [period, setPeriod] = useState<PeriodType>('DAY');
  const [showVolume, setShowVolume] = useState<boolean>(true);

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
  const extendedChartData = [
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
  const currentData = chartData[chartData.length - 1];
  const changePercent = ((currentData.change || 0) / (currentData.prevClose || 1)) * 100;

  // 현재 가격 변화 방향에 따른 색상 설정
  const currentPriceColor = currentData.changeType === 'RISE' ? RISE_COLOR : FALL_COLOR;

  // X축 레이블 데이터 생성 (실제 데이터 + 빈 공간용 레이블)
  const xAxisLabels = useMemo(() => {
    // 앞쪽 빈 데이터에 대한 레이블 생성
    const labels = extendedChartData.map((item, index) => {
      if (index < 10) {
        // 앞쪽 빈 데이터에 대한 레이블 생성 - 1분봉에서는 표시하지 않음
        if (chartData.length > 0 && period !== 'MINUTE') {
          const firstLabel = chartData[0].date;
          let newLabel = '';

          switch (period) {
            case 'DAY': {
              // 일 단위: 첫 날짜에서 (10-index)일 빼기
              const dayMatch = firstLabel.match(/(\d+)일/);
              const monthMatch = firstLabel.match(/(\d+)월/);

              if (dayMatch) {
                let day = parseInt(dayMatch[1]) - (10 - index);
                let month = monthMatch ? parseInt(monthMatch[1]) : 1;

                // 월별 일수 계산
                const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                // 월을 넘어가는 경우 처리
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
              // 주 단위: 첫 날짜에서 (10-index)*7일 빼기
              const dayMatch = firstLabel.match(/(\d+)일/);
              const monthMatch = firstLabel.match(/(\d+)월/);

              if (dayMatch) {
                let day = parseInt(dayMatch[1]) - (10 - index) * 7;
                let month = monthMatch ? parseInt(monthMatch[1]) : 1;

                // 월별 일수 계산
                const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                // 월을 넘어가는 경우 처리
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
              // 월 단위: 첫 월에서 (10-index)월 빼기
              const monthMatch = firstLabel.match(/(\d+)월/);
              const yearMatch = firstLabel.match(/(\d+)년/);

              if (monthMatch) {
                let month = parseInt(monthMatch[1]) - (10 - index);
                let year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

                // 연도를 넘어가는 경우 처리
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

      // 1분봉에서는 마지막 데이터 이후의 빈 레이블을 표시하지 않음
      if (period !== 'MINUTE') {
        for (let i = 1; i <= 10; i++) {
          let newLabel = '';

          switch (period) {
            case 'DAY': {
              // 일 단위: 마지막 날짜에 i일 추가 (달력에 맞게)
              const dayMatch = lastLabel.match(/(\d+)일/);
              const monthMatch = lastLabel.match(/(\d+)월/);

              if (dayMatch) {
                let day = parseInt(dayMatch[1]) + i;
                let month = monthMatch ? parseInt(monthMatch[1]) : 1;

                // 월별 일수 계산
                const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                // 월을 넘어가는 경우 처리
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
              // 주 단위: 마지막 날짜에 i*7일 추가
              const dayMatch = lastLabel.match(/(\d+)일/);
              const monthMatch = lastLabel.match(/(\d+)월/);

              if (dayMatch) {
                let day = parseInt(dayMatch[1]) + i * 7;
                let month = monthMatch ? parseInt(monthMatch[1]) : 1;

                // 월별 일수 계산
                const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

                // 월을 넘어가는 경우 처리
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
              // 월 단위: 마지막 월에 i월 추가
              const monthMatch = lastLabel.match(/(\d+)월/);
              const yearMatch = lastLabel.match(/(\d+)년/);

              if (monthMatch) {
                let month = parseInt(monthMatch[1]) + i;
                let year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

                // 연도를 넘어가는 경우 처리
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
  }, [extendedChartData, period, chartData]);

  // 상단 캔들 차트와 하단 거래량 차트 비율 설정
  const candleHeightRatio = 0.75; // 캔들 차트가 전체 높이의 75%
  const volumeHeightRatio = 0.25; // 거래량 차트가 전체 높이의 25%

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
  const getPriceRange = useCallback(() => {
    const minPrice = Math.min(...chartData.map((d) => d.low));
    const maxPrice = Math.max(...chartData.map((d) => d.high));
    const range = maxPrice - minPrice;

    return {
      min: Math.floor(minPrice - range * 0.1),
      max: Math.ceil(maxPrice + range * 0.1),
    };
  }, [chartData]);

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
          backgroundColor: '#2e3947',
        },
        lineStyle: {
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
              <div>MA5: -</div>
              <div>MA20: -</div>
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
              <div>MA5: -</div>
              <div>MA20: -</div>
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
            <div>MA5: ${ema5Str}</div>
            <div>MA20: ${ema20Str}</div>
            <div>거래량: ${volumeStr}</div>
          </div>
        `;
      },
    },
    axisPointer: {
      link: [{ xAxisIndex: 'all' }],
      label: {
        backgroundColor: '#2e3947',
      },
      lineStyle: {
        color: 'rgba(255, 255, 255, 0.2)',
        width: 1,
        type: 'solid',
      },
    },
    grid: {
      left: 80,
      right: 80,
      top: 40,
      bottom: 60,
      show: true,
      borderColor: '#2e3947',
      backgroundColor: 'transparent',
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: xAxisLabels,
      axisLine: { lineStyle: { color: '#2e3947' } },
      axisLabel: {
        show: true,
        color: '#CCCCCC',
        margin: 12,
        formatter: (value, index) => {
          const isBold = isFirstOfPeriod(value, index);
          return isBold ? value : value;
        },
      },
      splitLine: {
        show: true,
        lineStyle: { color: 'rgba(100, 100, 100, 0.4)' },
      },
      axisTick: { show: true },
      boundaryGap: true,
    },
    yAxis: {
      type: 'value',
      position: 'right',
      scale: true,
      splitNumber: 8,
      axisLine: { lineStyle: { color: '#2e3947' } },
      splitLine: {
        show: true,
        lineStyle: { color: 'rgba(100, 100, 100, 0.4)' },
      },
      axisLabel: {
        color: '#CCCCCC',
        formatter: (value) => {
          return formatKoreanNumber(Math.floor(value));
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
              return !isNaN(numValue) ? formatKoreanNumber(Math.floor(numValue)): '-';
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
    dataZoom: [
      {
        type: 'inside',
        start: 10,
        end: 100,
        zoomOnMouseWheel: true,
        moveOnMouseMove: true,
        preventDefaultMouseMove: false,
        filterMode: 'none',
      },
      {
        type: 'slider',
        show: false,
        height: 20,
        bottom: 0,
        start: 10,
        end: 100,
        borderColor: '#2e3947',
        fillerColor: 'rgba(38, 43, 54, 0.5)',
        textStyle: { color: '#CCCCCC' },
        handleStyle: { color: '#8392a5' },
        filterMode: 'none',
      },
    ],
    series: [
      {
        name: '캔들차트',
        type: 'candlestick',
        data: extendedChartData.map((item, index) => {
          if (index < 10) {
            // 앞쪽 빈 데이터는 차트의 최소값보다 아주 작은 값으로 설정하여 화면에 표시되지 않게 함
            const minValue = Math.min(...chartData.map((d) => d.low)) * 0.5;
            return [minValue, minValue, minValue, minValue];
          }

          return [
            Math.floor(item.open), // 시가 (open)
            Math.floor(item.close), // 종가 (close)
            Math.floor(item.low), // 저가 (low)
            Math.floor(item.high), // 고가 (high)
          ];
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
              lineStyle: { color: currentPriceColor },
            },
          ],
        },
      },
      {
        name: '5일 이평선',
        type: 'line',
        data: extendedChartData.map((item, index) => {
          if (index < 10) {
            return '-'; // 앞쪽 빈 데이터는 '-'로 설정하여 연결되지 않게 함
          }
          return ema5Data[index];
        }),
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
        data: extendedChartData.map((item, index) => {
          if (index < 10) {
            return '-'; // 앞쪽 빈 데이터는 '-'로 설정하여 연결되지 않게 함
          }
          return ema20Data[index];
        }),
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
        data: showVolume
          ? extendedChartData.map((item, index) => {
              if (index < 10) return 0; // 앞쪽 빈 데이터는 0으로 설정

              // 거래량을 가격 기준으로 정규화하여 차트 하단에 작게 표시
              const maxVolume = getMaxVolume();
              const priceRange = getPriceRange();
              const volumeScale = ((priceRange.max - priceRange.min) * 0.2) / maxVolume; // 차트 높이의 20%만 사용
              const scaledVolume = priceRange.min + item.volume * volumeScale; // 최소 가격 위에 표시

              return scaledVolume;
            })
          : [],
        itemStyle: {
          color: (params: any) => {
            const index = params.dataIndex;
            if (index < 10 || !extendedChartData[index]) return FALL_COLOR;
            return extendedChartData[index].changeType === 'RISE' ? RISE_COLOR : FALL_COLOR;
          },
        },
        barWidth: '60%',
        barGap: '-100%', // 캔들과 겹치도록 설정
        z: 0, // 캔들차트보다 뒤에 표시되도록 z-index 설정
      },
    ],
  };

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden"
      style={{ backgroundColor: '#0D192B' }}
    >
      <div className="mb-4 flex items-center gap-4 p-4 text-sm text-white">
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
