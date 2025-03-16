'use client';

import React, { useState, useCallback } from 'react';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import {
  ema,
  discontinuousTimeScaleProviderBuilder,
  Chart,
  ChartCanvas,
  CurrentCoordinate,
  BarSeries,
  CandlestickSeries,
  LineSeries,
  MovingAverageTooltip,
  OHLCTooltip,
  lastVisibleItemBasedZoomAnchor,
  XAxis,
  YAxis,
  CrossHairCursor,
  EdgeIndicator,
  MouseCoordinateX,
  MouseCoordinateY,
  ZoomButtons,
} from 'react-financial-charts';
import { DataPoint, formatDate } from '@/lib/dummy-data';

interface ChartComponentProps {
  readonly height?: number;
  readonly width?: number;
  readonly ratio?: number;
  readonly data: DataPoint[];
}

type PeriodType = 'MINUTE' | 'DAY' | 'WEEK' | 'MONTH';

const ChartComponent: React.FC<ChartComponentProps> = ({
  width = 900,
  height = 700,
  ratio = 3,
  data,
}) => {
  const [period, setPeriod] = useState<PeriodType>('DAY');

  const getData = useCallback(() => {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setHours(9, 0, 0, 0); // 오전 9시로 설정

    switch (period) {
      case 'MINUTE':
        // 1분봉: 실제 1분 단위 데이터 생성 (9:00 ~ 15:30)
        return data
          .map((item, index) => {
            const date = new Date(startDate);
            date.setMinutes(date.getMinutes() + index);
            return {
              ...item,
              date: formatDate(date, 'MINUTE'),
              periodType: 'MINUTE' as const,
            };
          })
          .slice(0, 390); // 6시간 30분

      case 'WEEK':
        // 주봉: 월~금 5일 단위로 데이터 그룹화
        return data.reduce<DataPoint[]>((acc, curr, i) => {
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
                date: formatDate(weekDate, 'WEEK'),
              });
            }
          }
          return acc;
        }, []);

      case 'MONTH':
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

        const monthlyResult = Object.entries(monthlyGroups)
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
              date: formatDate(monthDate, 'MONTH'),
            };
          });

        console.log(
          '월별 데이터:',
          monthlyResult.map((d) => new Date(d.date).toISOString()),
        );
        return monthlyResult;

      case 'DAY':
      default:
        // 일봉: 하루 단위 데이터 그대로 사용
        return data.map((item) => ({
          ...item,
          date: formatDate(new Date(item.date), 'DAY'),
          periodType: 'DAY' as const,
        }));
    }
  }, [period, data]);

  const formatKoreanNumber = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(value));
  };

  const formatVolumeNumber = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    } else {
      return formatKoreanNumber(value);
    }
  };

  const chartData = getData();
  const currentData = chartData[chartData.length - 1];
  const changePercent = ((currentData.change || 0) / (currentData.prevClose || 1)) * 100;

  // 상승/하락 색상 정의
  const RISE_COLOR = '#ef5350'; // 빨강
  const FALL_COLOR = '#1976d2'; // 파랑

  const ScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
    (d: DataPoint) => new Date(d.date),
  );
  const margin = { left: 80, right: 80, top: 30, bottom: 150 };

  const ema5 = ema()
    .id(1)
    .options({ windowSize: 5 })
    .merge((d: DataPoint, c: number) => {
      d.ema5 = c;
    })
    .accessor((d: DataPoint) => d.ema5);

  const ema20 = ema()
    .id(2)
    .options({ windowSize: 20 })
    .merge((d: DataPoint, c: number) => {
      d.ema20 = c;
    })
    .accessor((d: DataPoint) => d.ema20);

  const calculatedData = ema20(ema5(chartData));
  const { data: scaleData, xScale, xAccessor, displayXAccessor } = ScaleProvider(calculatedData);

  const max = xAccessor(scaleData[scaleData.length - 1]);
  const min = xAccessor(scaleData[Math.max(0, scaleData.length - 100)]);
  const xExtents = [min, max + 5];

  const gridHeight = height - margin.top - margin.bottom;
  const barChartHeight = gridHeight / 5;
  const barChartOrigin = (_: number, h: number) => [0, h - barChartHeight];
  const chartHeight = gridHeight - barChartHeight;

  // 거래량 그래프 높이 조정
  const volumeChartHeight = gridHeight / 4;
  const volumeOrigin = (_: number, h: number) => [0, h - volumeChartHeight];
  const mainChartHeight = gridHeight - volumeChartHeight;

  const dateTimeFormat = useCallback(() => {
    switch (period) {
      case 'MINUTE':
        return '%H:%M';
      case 'MONTH':
        return '%Y년 %m월';
      case 'DAY':
      case 'WEEK':
      default:
        return '%m월 %d일';
    }
  }, [period]);

  const timeDisplayFormat = timeFormat(dateTimeFormat());

  // X축 레이블 커스텀 포맷
  const xAxisTickFormat = useCallback(
    (date: Date) => {
      const d = new Date(date);
      const month = d.getMonth() + 1;

      switch (period) {
        case 'MONTH':
          return `${month}월`;
        case 'WEEK':
          return `${month}월`;
        case 'DAY':
          return `${month}월`;
        case 'MINUTE':
          const hours = d.getHours();
          return `${hours}시`;
        default:
          return `${month}월`;
      }
    },
    [period],
  );

  const barChartExtents = (data: DataPoint) => {
    return data.volume;
  };

  const candleChartExtents = (data: DataPoint) => {
    return [data.high, data.low];
  };

  const yEdgeIndicator = (data: DataPoint) => {
    return data.close;
  };

  const volumeColor = (data: DataPoint) => {
    return data.changeType === 'RISE' ? `${RISE_COLOR}` : `${FALL_COLOR}`;
  };

  const volumeSeries = (data: DataPoint) => {
    return data.volume;
  };

  const openCloseColor = (data: DataPoint) => {
    return data.changeType === 'RISE' ? RISE_COLOR : FALL_COLOR;
  };

  return (
    <div className="flex flex-col w-full h-full bg-modal-background-color">
      <div className="flex items-center gap-4 mb-4 text-sm text-white p-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{currentData.stockName || '삼성전자'}</span>
            <span className="text-gray-400 text-xs">{currentData.stockCode || '005930'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{formatKoreanNumber(currentData.close)}원</span>
            <span className={currentData.changeType === 'RISE' ? 'text-red-500' : 'text-blue-500'}>
              {currentData.change && currentData.change > 0 ? '+' : ''}
              {formatKoreanNumber(currentData.change || 0)}원 ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="flex gap-2 ml-auto items-center">
          <button
            className={`px-4 py-2 rounded ${period === 'MINUTE' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setPeriod('MINUTE')}
          >
            1분
          </button>
          <button
            className={`px-4 py-2 rounded ${period === 'DAY' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setPeriod('DAY')}
          >
            일
          </button>
          <button
            className={`px-4 py-2 rounded ${period === 'WEEK' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setPeriod('WEEK')}
          >
            주
          </button>
          <button
            className={`px-4 py-2 rounded ${period === 'MONTH' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setPeriod('MONTH')}
          >
            월
          </button>
        </div>
      </div>
      <div
        className="relative w-full overflow-hidden bg-modal-background-color"
        style={{ height: `${height}px` }}
      >
        <ChartCanvas
          height={height}
          ratio={ratio}
          width={width}
          margin={{ left: 80, right: 80, top: 30, bottom: 150 }}
          data={scaleData}
          displayXAccessor={displayXAccessor}
          seriesName="Data"
          xScale={xScale}
          xAccessor={xAccessor}
          xExtents={xExtents}
          zoomAnchor={lastVisibleItemBasedZoomAnchor}
          disableInteraction={false}
          disablePan={false}
          disableZoom={false}
        >
          <Chart
            id={2}
            height={volumeChartHeight}
            origin={volumeOrigin}
            yExtents={barChartExtents}
            padding={{ top: 20, bottom: 80 }}
          >
            <text x={5} y={15} fontSize={11} fill="#CCCCCC" style={{ fontWeight: 'bold' }}>
              거래량
            </text>
            <rect x={0} y={20} width="100%" height={5} fill="transparent" />
            <YAxis
              showGridLines={false}
              tickFormat={(v: number) => formatVolumeNumber(v)}
              tickLabelFill="#CCCCCC"
            />
            <BarSeries
              fillStyle={volumeColor}
              yAccessor={volumeSeries}
              widthRatio={0.6}
              clip={false}
            />
            <MouseCoordinateY
              at="right"
              orient="right"
              displayFormat={(v: number) => formatVolumeNumber(v)}
              rectWidth={margin.right}
              fill="#131722"
              opacity={0.8}
              textFill="#FFFFFF"
            />
            <XAxis
              showGridLines={false}
              tickFormat={xAxisTickFormat}
              tickLabelFill="#FFFFFF"
              strokeStyle="#555555"
              tickStrokeStyle="#555555"
              ticks={15}
              tickPadding={10}
              axisAt="bottom"
              orient="bottom"
              strokeWidth={1}
              fontFamily="Helvetica"
              fontSize={14}
              showTicks={true}
              showTickLabel={true}
              outerTickSize={0}
            />
          </Chart>
          <Chart id={3} height={mainChartHeight} yExtents={candleChartExtents}>
            <XAxis
              showGridLines
              gridLinesStrokeStyle="rgba(100, 100, 100, 0.4)"
              gridLinesStrokeWidth={1}
              showTickLabel={false}
              axisAt="bottom"
              orient="bottom"
              strokeWidth={1}
            />
            <YAxis
              showGridLines
              gridLinesStrokeStyle="rgba(100, 100, 100, 0.4)"
              gridLinesStrokeWidth={1}
              tickFormat={(v: number) => formatKoreanNumber(v)}
              tickLabelFill="#CCCCCC"
            />
            <CandlestickSeries
              wickStroke={(d) => (d.close >= d.open ? RISE_COLOR : FALL_COLOR)}
              fill={(d) => (d.close >= d.open ? RISE_COLOR : FALL_COLOR)}
              stroke={(d) => (d.close >= d.open ? RISE_COLOR : FALL_COLOR)}
            />
            <LineSeries yAccessor={ema5.accessor()} strokeStyle={FALL_COLOR} strokeWidth={1} />
            <CurrentCoordinate yAccessor={ema5.accessor()} fillStyle={FALL_COLOR} />
            <LineSeries yAccessor={ema20.accessor()} strokeStyle={RISE_COLOR} strokeWidth={1} />
            <CurrentCoordinate yAccessor={ema20.accessor()} fillStyle={RISE_COLOR} />
            <MouseCoordinateX
              at="bottom"
              orient="bottom"
              displayFormat={timeDisplayFormat}
              rectWidth={margin.right}
              fill="#131722"
              opacity={0.8}
              textFill="#FFFFFF"
            />
            <MouseCoordinateY
              at="right"
              orient="right"
              displayFormat={(v: number) => `${formatKoreanNumber(v)}원`}
              rectWidth={margin.right}
              fill="#131722"
              opacity={0.8}
              textFill="#FFFFFF"
            />
            <MouseCoordinateX
              at="top"
              orient="top"
              displayFormat={() => ''}
              rectWidth={0}
              fill="transparent"
            />
            <MouseCoordinateY
              at="left"
              orient="left"
              displayFormat={() => ''}
              rectWidth={0}
              fill="transparent"
            />
            <EdgeIndicator
              itemType="last"
              rectWidth={80}
              fill={openCloseColor}
              lineStroke={openCloseColor}
              displayFormat={(v: number) => `${formatKoreanNumber(v)}원`}
              yAccessor={yEdgeIndicator}
            />
            <MovingAverageTooltip
              origin={[8, 24]}
              options={[
                {
                  yAccessor: ema5.accessor(),
                  type: '5이평선',
                  stroke: FALL_COLOR,
                  windowSize: ema5.options().windowSize,
                },
                {
                  yAccessor: ema20.accessor(),
                  type: '20이평선',
                  stroke: RISE_COLOR,
                  windowSize: ema20.options().windowSize,
                },
              ]}
              displayFormat={(v: number) => `${formatKoreanNumber(v)}원`}
              textFill="#FFFFFF"
              labelFill="#CCCCCC"
            />
            <OHLCTooltip
              origin={[8, 16]}
              textFill={(d) => (d.close > d.open ? RISE_COLOR : FALL_COLOR)}
              labelFill="#888888"
              displayTexts={{
                o: '시가: ',
                h: '고가: ',
                l: '저가: ',
                c: '종가: ',
                na: '해당없음',
              }}
              ohlcFormat={(n: number | { valueOf(): number }) => {
                const value = typeof n === 'number' ? n : n.valueOf();
                return `${formatKoreanNumber(value)}원`;
              }}
            />
            <ZoomButtons />
          </Chart>
          <CrossHairCursor snapX={true} strokeDasharray="Dot" strokeWidth={1} />
        </ChartCanvas>
      </div>
    </div>
  );
};

export default ChartComponent;
