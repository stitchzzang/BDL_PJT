import { EChartsOption } from 'echarts';
interface CallbackDataParams {
  dataIndex: number;
  value?: unknown;
  axisValue?: string;
  name?: string;
}
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// StockCandle 타입 정의
export interface StockCandle {
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
  periodType: number;
  fiveAverage: number;
  twentyAverage: number;
}

// 튜토리얼 일봉 응답 타입
export interface TutorialStockResponse {
  companyId: string;
  limit: number;
  cursor: string;
  data: StockCandle[];
}

// 차트 데이터 포인트 타입
interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changeType: 'RISE' | 'FALL' | 'NONE';
  fiveAverage: number;
  twentyAverage: number;
  rawDate: Date | null;
  periodType: 'DAY';
}

// 타입 정의
interface ChartComponentProps {
  readonly height?: number;
  readonly periodData?: TutorialStockResponse;
  readonly ratio?: number;
}

// 상수 정의
const RISE_COLOR = '#ef5350';
const FALL_COLOR = '#1976d2';
const DEFAULT_DATA_ZOOM_START = 30;
const DEFAULT_DATA_ZOOM_END = 100;
const EMPTY_DATA_COUNT = 10;
const DAY_PERIOD_TYPE = 1; // 일봉 데이터의 periodType 값

// 날짜 포맷팅 유틸리티 함수
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// API 데이터를 차트 데이터로 변환하는 유틸리티 함수
const convertPeriodCandleToChartData = (data: StockCandle): ChartDataPoint => {
  const tradingDate = data.tradingDate ? new Date(data.tradingDate) : null;

  return {
    date: tradingDate ? formatDate(tradingDate) : '',
    open: data.openPrice,
    high: data.highPrice,
    low: data.lowPrice,
    close: data.closePrice,
    volume: data.accumulatedVolume,
    changeType: data.closePrice >= data.openPrice ? 'RISE' : 'FALL',
    fiveAverage: data.fiveAverage,
    twentyAverage: data.twentyAverage,
    rawDate: tradingDate,
    periodType: 'DAY',
  };
};

const ChartComponent: React.FC<ChartComponentProps> = React.memo(({ periodData }) => {
  const chartRef = useRef<ReactECharts>(null);
  const [dataZoomRange] = useState({
    start: DEFAULT_DATA_ZOOM_START,
    end: DEFAULT_DATA_ZOOM_END,
  });

  // 데이터 변환 및 필터링
  const rawChartData = useMemo(() => {
    let data: ChartDataPoint[] = [];

    if (periodData?.data && Array.isArray(periodData.data) && periodData.data.length > 0) {
      // 일봉 데이터만 필터링 (periodType이 1인 데이터)
      const filteredData = periodData.data.filter(
        (item) => item && item.periodType === DAY_PERIOD_TYPE,
      );

      if (filteredData.length > 0) {
        // 데이터 날짜 기준으로 정렬
        const sortedData = [...filteredData].sort((a, b) => {
          const dateA = new Date(a.tradingDate).getTime();
          const dateB = new Date(b.tradingDate).getTime();
          return dateA - dateB;
        });

        // 필터링 및 정렬된 데이터만 변환
        data = sortedData.map(convertPeriodCandleToChartData);
      }
    }

    return data;
  }, [periodData]);

  const chartData = useMemo(() => {
    if (!rawChartData || !Array.isArray(rawChartData) || rawChartData.length === 0) {
      return Array(EMPTY_DATA_COUNT)
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
          periodType: 'DAY',
        }));
    }

    const data = [...rawChartData];

    // 빈 데이터 추가
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
        periodType: 'DAY',
      }));

    return [...emptyData, ...data];
  }, [rawChartData]);

  const xAxisLabels = useMemo(() => {
    const seenMonths = new Set<string>(); // 월 추적을 위한 Set (년도 포함)
    return chartData.map((item) => {
      if (!item?.rawDate || !(item.rawDate instanceof Date) || isNaN(item.rawDate.getTime())) {
        return ''; // 유효하지 않은 날짜는 빈 문자열 반환
      }

      const date = item.rawDate;
      const month = date.getMonth();
      const day = date.getDate();
      const yearMonthKey = `${date.getFullYear()}-${month}`; // 년도와 월을 키로 사용

      if (!seenMonths.has(yearMonthKey)) {
        seenMonths.add(yearMonthKey);
        // 월의 첫 등장: 'MM월' 형식과 스타일 적용
        return {
          value: `${month + 1}월`,
          textStyle: {
            fontWeight: 'bold',
            fontSize: 14,
          },
        };
      } else {
        // 이미 등장한 월: 'DD일' 형식 반환
        return `${day}일`;
      }
    });
  }, [chartData]);

  const candleData = useMemo(() => {
    return chartData.map((item) => [
      item?.open || 0,
      item?.close || 0,
      item?.low || 0,
      item?.high || 0,
    ]);
  }, [chartData]);

  const volumeData = useMemo(() => {
    return chartData.map((item) => item?.volume || 0);
  }, [chartData]);

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

  const calculateEMA = useCallback((data: (number | null)[], period: number): (number | null)[] => {
    const k = 2 / (period + 1);
    const emaData: (number | null)[] = [];
    let ema: number | null = null;

    // 첫 번째 유효한 값 찾기
    let firstValidIndex = 0;
    while (firstValidIndex < data.length && data[firstValidIndex] === null) {
      firstValidIndex++;
    }

    if (firstValidIndex < data.length && data[firstValidIndex] !== null) {
      ema = data[firstValidIndex] as number;
      emaData[firstValidIndex] = ema;

      // EMA 계산
      for (let i = firstValidIndex + 1; i < data.length; i++) {
        const currentValue = data[i];
        if (currentValue === null) {
          emaData[i] = ema;
          continue;
        }
        ema = currentValue * k + ema * (1 - k);
        emaData[i] = ema;
      }
    }

    return emaData;
  }, []);

  const ema5Data = useMemo(() => {
    const closeValues = chartData.map((item) => (item?.close !== undefined ? item.close : null));
    return calculateEMA(closeValues, 5);
  }, [chartData, calculateEMA]);

  const ema20Data = useMemo(() => {
    const closeValues = chartData.map((item) => (item?.close !== undefined ? item.close : null));
    return calculateEMA(closeValues, 20);
  }, [chartData, calculateEMA]);

  const getItemStyle = useCallback(
    (params: CallbackDataParams) => {
      const item = chartData[params.dataIndex];
      return item?.open <= item?.close ? RISE_COLOR : FALL_COLOR;
    },
    [chartData],
  );

  const getChangeColor = (percent: number) => {
    if (percent > 0) {
      return RISE_COLOR; // 상승 색상
    } else if (percent < 0) {
      return FALL_COLOR; // 하락 색상
    }
    return '#999999'; // 변동 없음(0%)일 때 회색 색상
  };

  const tooltipFormatter = useCallback(
    (params: CallbackDataParams | CallbackDataParams[]): string => {
      if (!params) return 'No data';

      // 배열인지 확인하고 항상 배열로 처리
      const paramsArray = Array.isArray(params) ? params : [params];
      if (paramsArray.length === 0) return 'No data';

      const { dataIndex } = paramsArray[0];
      const item = chartData[dataIndex] as ChartDataPoint;

      if (!item) return 'No data';

      // 빈 데이터 구간은 제외
      if (dataIndex < EMPTY_DATA_COUNT || !item.date) {
        return 'No data';
      }

      // 차트데이터와 원본 데이터 매핑
      const realIndex = dataIndex - EMPTY_DATA_COUNT;
      let originalData;

      if (periodData?.data && realIndex >= 0 && periodData.data.length > 0) {
        // periodType이 1인 데이터만 필터링
        const filteredData = periodData.data.filter((d) => d.periodType === 1);

        // 데이터 날짜 기준으로 정렬
        const sortedData = [...filteredData].sort((a, b) => {
          const dateA = new Date(a.tradingDate).getTime();
          const dateB = new Date(b.tradingDate).getTime();
          return dateA - dateB;
        });

        // 인덱스로 먼저 시도
        if (realIndex < sortedData.length) {
          originalData = sortedData[realIndex];
        }

        // 날짜 비교를 통해 정확한 데이터 찾기
        if (item.rawDate && item.rawDate instanceof Date) {
          const itemDateStr = formatDate(item.rawDate);
          const matchedData = sortedData.find((d) => {
            const dDate = new Date(d.tradingDate);
            const dDateStr = formatDate(dDate);
            return dDateStr === itemDateStr;
          });

          // 날짜로 찾은 데이터가 있으면 업데이트
          if (matchedData) {
            originalData = matchedData;
          }
        }

        // 마지막 일봉 데이터 특별 처리
        if (item.date && item.rawDate instanceof Date) {
          const lastCandle = sortedData[sortedData.length - 1];
          if (lastCandle) {
            const lastDate = new Date(lastCandle.tradingDate);
            const itemDate = item.rawDate;

            // 날짜 형식 문자열로 비교
            const lastDateStr = formatDate(lastDate);
            const itemDateStr = formatDate(itemDate);

            if (itemDateStr === lastDateStr) {
              originalData = lastCandle;
            }
          }
        }
      }

      const { open, close, low, high, volume, rawDate } = item;

      // 날짜 포맷팅
      let formattedDate = '';
      if (rawDate) {
        const year = rawDate.getFullYear();
        const month = String(rawDate.getMonth() + 1).padStart(2, '0');
        const day = String(rawDate.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      }

      let openPercent = 0;
      let closePercent = 0;
      let lowPercent = 0;
      let highPercent = 0;
      let ma5 = 0;
      let ma20 = 0;

      // 원본 데이터에서 변동률 가져오기
      if (originalData) {
        openPercent = originalData.openPricePercent || 0;
        closePercent = originalData.closePricePercent || 0;
        lowPercent = originalData.lowPricePercent || 0;
        highPercent = originalData.highPricePercent || 0;
        ma5 = originalData.fiveAverage || 0;
        ma20 = originalData.twentyAverage || 0;

        // 모든 변동률이 0인 경우 이전 캔들과 비교하여 직접 계산
        if (openPercent === 0 && closePercent === 0 && lowPercent === 0 && highPercent === 0) {
          if (periodData?.data && periodData.data.length > 0) {
            const dayCandles = periodData.data.filter((d) => d.periodType === 1);
            const sortedCandles = [...dayCandles].sort((a, b) => {
              return new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime();
            });

            // 현재 일봉의 인덱스 찾기
            const currentIndex = sortedCandles.findIndex(
              (c) => c.stockCandleId === originalData.stockCandleId,
            );

            // 이전 일봉이 있으면 이전 종가와 비교하여 변동률 계산
            if (currentIndex > 0) {
              const prevCandle = sortedCandles[currentIndex - 1];
              const prevClose = prevCandle.closePrice;

              if (prevClose > 0) {
                openPercent = ((originalData.openPrice - prevClose) / prevClose) * 100;
                closePercent = ((originalData.closePrice - prevClose) / prevClose) * 100;
                lowPercent = ((originalData.lowPrice - prevClose) / prevClose) * 100;
                highPercent = ((originalData.highPrice - prevClose) / prevClose) * 100;
              }
            }
          }
        }
      } else {
        ma5 = item.fiveAverage;
        ma20 = item.twentyAverage;

        // 변동률이 없는 경우 이전 캔들과 비교하여 직접 계산
        if (dataIndex > EMPTY_DATA_COUNT && dataIndex < chartData.length) {
          const prevDataIdx = dataIndex - 1;
          const prevItem = chartData[prevDataIdx];

          if (prevItem && prevItem.close > 0) {
            openPercent = ((open - prevItem.close) / prevItem.close) * 100;
            closePercent = ((close - prevItem.close) / prevItem.close) * 100;
            lowPercent = ((low - prevItem.close) / prevItem.close) * 100;
            highPercent = ((high - prevItem.close) / prevItem.close) * 100;
          }
        }
      }

      // 색상 설정
      const openColor = getChangeColor(openPercent);
      const closeColor = getChangeColor(closePercent);
      const lowColor = getChangeColor(lowPercent);
      const highColor = getChangeColor(highPercent);

      return `
        <div style="font-size: 12px; max-width: 250px; padding-left: 10px; padding-right: 10px; padding-top: 10px; padding-bottom: 10px;">
          <div style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 3px;">
            <div style="font-weight: bold; font-size: 14px;">📈 주식 정보</div>
            <div style="color: #aaa;">${formattedDate}</div>
          </div>

          <div style="margin-bottom: 5px;">
            <div style="display: grid; grid-template-columns: 40px 1fr 60px; margin-bottom: 2px; align-items: center;">
              <span style="color: #ccc;">시가</span>
              <span style="font-weight: 500; text-align: right;">${formatKoreanNumber(open)}원</span>
              <span style="color: ${openColor}; text-align: right; font-size: 12px;">${openPercent > 0 ? '+' : ''}${openPercent.toFixed(2)}%</span>
            </div>
            <div style="display: grid; grid-template-columns: 40px 1fr 60px; margin-bottom: 2px; align-items: center;">
              <span style="color: #ccc;">종가</span>
              <span style="font-weight: 500; text-align: right;">${formatKoreanNumber(close)}원</span>
              <span style="color: ${closeColor}; text-align: right; font-size: 12px;">${closePercent > 0 ? '+' : ''}${closePercent.toFixed(2)}%</span>
            </div>
            <div style="display: grid; grid-template-columns: 40px 1fr 60px; margin-bottom: 2px; align-items: center;">
              <span style="color: #ccc;">저가</span>
              <span style="font-weight: 500; text-align: right;">${formatKoreanNumber(low)}원</span>
              <span style="color: ${lowColor}; text-align: right; font-size: 12px;">${lowPercent > 0 ? '+' : ''}${lowPercent.toFixed(2)}%</span>
            </div>
            <div style="display: grid; grid-template-columns: 40px 1fr 60px; align-items: center;">
              <span style="color: #ccc;">고가</span>
              <span style="font-weight: 500; text-align: right;">${formatKoreanNumber(high)}원</span>
              <span style="color: ${highColor}; text-align: right; font-size: 12px;">${highPercent > 0 ? '+' : ''}${highPercent.toFixed(2)}%</span>
            </div>
          </div>

          <div style="margin-bottom: 5px; padding-top: 3px; border-top: 1px solid rgba(255,255,255,0.2);">
            <div style="display: grid; grid-template-columns: 60px 1fr; margin-bottom: 2px; align-items: center;">
              <span style="color: #ccc;">5이평선</span>
              <span style="font-weight: 500; text-align: right;">${formatKoreanNumber(ma5)}원</span>
            </div>
            <div style="display: grid; grid-template-columns: 60px 1fr; align-items: center;">
              <span style="color: #ccc;">20이평선</span>
              <span style="font-weight: 500; text-align: right;">${formatKoreanNumber(ma20)}원</span>
            </div>
          </div>

          <div style="padding-top: 3px; border-top: 1px solid rgba(255,255,255,0.2);">
            <div style="display: grid; grid-template-columns: 60px 1fr; align-items: center;">
              <span style="color: #ccc;">거래량</span>
              <span style="font-weight: 500; text-align: right;">${formatVolumeNumber(volume)}</span>
            </div>
          </div>
        </div>
      `;
    },
    [chartData, formatKoreanNumber, formatVolumeNumber, periodData],
  );

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
        confine: true,
        position: function (point, params, dom, rect, size) {
          const chartWidth = size.viewSize[0];
          const tooltipWidth = size.contentSize[0];
          const posX = point[0];

          if (posX + tooltipWidth > chartWidth - 20) {
            return [posX - tooltipWidth - 10, point[1] + 8];
          }

          return [posX + 10, point[1] + 8];
        },
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
        extraCssText: 'max-width: 280px; white-space: normal; word-wrap: break-word;',
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
          top: '60%',
          height: '30%',
          containLabel: false,
        },
      ],
      xAxis: [
        {
          type: 'category',
          data: xAxisLabels && xAxisLabels.length > 0 ? xAxisLabels : [''],
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
          data: xAxisLabels && xAxisLabels.length > 0 ? xAxisLabels : [''],
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
          textStyle: {
            fontFamily:
              'Spoqa Han Sans Neo, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, sans-serif',
          },
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: 'slider',
          bottom: 0,
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
          name: 'Candle',
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
          name: 'Volume',
          type: 'bar',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: volumeData,
          itemStyle: {
            color: getItemStyle,
          },
        },
        {
          name: 'MA5',
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
          name: 'MA20',
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
    ],
  );

  // 차트 데이터 유효성 체크 - periodData가 있다면 차트를 표시
  const hasValidData = useMemo(() => {
    if (periodData && periodData.data && Array.isArray(periodData.data)) {
      const filteredData = periodData.data.filter((item) => item.periodType === DAY_PERIOD_TYPE);
      return filteredData.length > 0;
    }
    return false;
  }, [periodData]);

  useEffect(() => {
    if (hasValidData && chartRef.current) {
      // 차트 인스턴스에 접근하여 필요한 경우 추가 설정
    }
  }, [hasValidData]);

  return (
    <div className="relative h-full">
      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl shadow-md"
        style={{ backgroundColor: '#0D192B' }}
      >
        <div className="flex items-center p-4 text-sm text-white"></div>

        {!hasValidData ? (
          <div className="flex h-[400px] items-center justify-center text-white">
            <div className="text-center">
              <p className="mb-2 text-xl">차트 데이터가 없습니다.</p>
              <p className="text-sm">
                일봉 데이터를 불러오는 중이거나, 데이터가 존재하지 않습니다.
              </p>
              <p className="text-sm">잠시 후 다시 시도해 주세요.</p>
            </div>
          </div>
        ) : (
          <div className="h-full w-full">
            <ReactECharts
              ref={chartRef}
              option={option}
              style={{ height: '100%', minHeight: '400px', width: '100%' }}
            />
          </div>
        )}
      </div>
    </div>
  );
});

export default ChartComponent;
