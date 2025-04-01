import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { throttle } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 틱 데이터 인터페이스
interface TickData {
  stockCode: string;
  stckCntgHour: string;
  stckPrpr: number;
  stckOprc: number;
  stckHgpr: number;
  stckLwpr: number;
  cntgVol: number;
  acmlVol: number;
  acmlTrPbm: number;
  ccldDvsn: string;
}

// 틱 차트 프롭스
interface TickChartProps {
  tickData: TickData | undefined;
  height?: number;
  width?: number;
  basePrice?: number; // 기준가
}

// 상수 정의
const RISE_COLOR = '#ef5350'; // 상승 색상 (빨간색)
const FALL_COLOR = '#1976d2'; // 하락 색상 (파란색)
const DEFAULT_COLOR = '#888888'; // 기본 색상 (변화 없음)
const THROTTLE_MS = 100; // 업데이트 스로틀링 시간 (ms)

// 틱 차트 데이터 포인트 인터페이스
interface TickChartDataPoint {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  changeType: 'RISE' | 'FALL' | 'NONE';
}

const TickChartComponent: React.FC<TickChartProps> = ({
  tickData,
  height = 600,
  width = '100%',
  basePrice,
}) => {
  // 단일 데이터 포인트만 관리
  const [currentPoint, setCurrentPoint] = useState<TickChartDataPoint | null>(null);

  const chartRef = useRef<ReactECharts>(null);
  const lastTickRef = useRef<TickData | null>(null);
  const chartUpdateCountRef = useRef(0);

  // 데이터 포인트 업데이트
  const updateDataPoint = useCallback(
    (tick: TickData) => {
      // 동일한 틱 데이터 중복 처리 방지
      if (
        lastTickRef.current &&
        lastTickRef.current.stckCntgHour === tick.stckCntgHour &&
        lastTickRef.current.stckPrpr === tick.stckPrpr
      ) {
        return;
      }

      // 현재 시간 포맷팅
      const formatTime = (time: string): string => {
        if (time.length >= 6) {
          const hour = time.slice(0, 2);
          const min = time.slice(2, 4);
          const sec = time.slice(4, 6);
          return `${hour}:${min}:${sec}`;
        }
        return time;
      };

      // 변화 유형 결정
      let changeType: 'RISE' | 'FALL' | 'NONE' = 'NONE';

      // 현재가와 시가 비교하여 상승/하락 결정
      if (tick.stckPrpr > tick.stckOprc) {
        changeType = 'RISE';
      } else if (tick.stckPrpr < tick.stckOprc) {
        changeType = 'FALL';
      }

      // 새 데이터 포인트 생성 - 전달된 원본 데이터 그대로 사용
      const newPoint: TickChartDataPoint = {
        time: formatTime(tick.stckCntgHour),
        open: tick.stckOprc, // 시가
        close: tick.stckPrpr, // 현재가(종가)
        high: tick.stckHgpr, // 최고가
        low: tick.stckLwpr, // 최저가
        volume: tick.cntgVol,
        changeType: changeType,
      };

      setCurrentPoint(newPoint);

      // 참조 업데이트
      lastTickRef.current = { ...tick };
      chartUpdateCountRef.current += 1;
    },
    [basePrice],
  );

  // 스로틀링된 틱 데이터 처리 함수
  const throttledUpdateData = useCallback(
    throttle((tick: TickData) => {
      updateDataPoint(tick);
    }, THROTTLE_MS),
    [updateDataPoint],
  );

  // 틱 데이터 변경 시 처리
  useEffect(() => {
    if (tickData) {
      throttledUpdateData(tickData);
    }
  }, [tickData, throttledUpdateData]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      throttledUpdateData.cancel();
    };
  }, [throttledUpdateData]);

  // 차트 옵션 설정
  const option: EChartsOption = useMemo(() => {
    // 데이터가 없으면 기본 옵션 반환
    if (!currentPoint) {
      return {
        backgroundColor: '#0D192B',
        grid: {
          left: '5%',
          right: '5%',
          top: '10%',
          bottom: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: ['현재'],
          axisLabel: {
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            show: false,
          },
          splitLine: {
            show: false,
          },
        },
        series: [
          {
            type: 'candlestick',
            data: [[0, 0, 0, 0]],
          },
        ],
      };
    }

    // 현재 데이터 포인트의 캔들 데이터
    // ECharts 캔들스틱 데이터 형식: [시가, 종가, 저가, 고가]
    const candleData = [
      [
        currentPoint.open, // 시가
        currentPoint.close, // 종가(현재가)
        currentPoint.low, // 저가
        currentPoint.high, // 고가
      ],
    ];

    // X축 라벨
    const xAxisLabels = [currentPoint.time];

    // 가격 색상 설정
    // 현재가가 시가보다 높으면 상승(빨간색), 낮으면 하락(파란색)
    const priceColor =
      currentPoint.close > currentPoint.open
        ? RISE_COLOR
        : currentPoint.close < currentPoint.open
          ? FALL_COLOR
          : DEFAULT_COLOR;

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
          label: {
            backgroundColor: '#1976d2',
          },
        },
        formatter: () => {
          if (!currentPoint) return '';

          const priceChange = (
            ((currentPoint.close - currentPoint.open) / currentPoint.open) *
            100
          ).toFixed(2);

          const priceChangeText =
            currentPoint.close > currentPoint.open ? `+${priceChange}%` : `${priceChange}%`;

          const color =
            currentPoint.close > currentPoint.open
              ? RISE_COLOR
              : currentPoint.close < currentPoint.open
                ? FALL_COLOR
                : DEFAULT_COLOR;

          return `
            <div style="padding: 8px;">
              <div style="margin-bottom: 4px;">${currentPoint.time}</div>
              <div>시가: ${new Intl.NumberFormat('ko-KR').format(currentPoint.open)}</div>
              <div>종가: ${new Intl.NumberFormat('ko-KR').format(currentPoint.close)}
                <span style="color: ${color}; margin-left: 4px;">${priceChangeText}</span>
              </div>
              <div>고가: ${new Intl.NumberFormat('ko-KR').format(currentPoint.high)}</div>
              <div>저가: ${new Intl.NumberFormat('ko-KR').format(currentPoint.low)}</div>
              <div>거래량: ${new Intl.NumberFormat('ko-KR').format(currentPoint.volume)}</div>
            </div>
          `;
        },
      },
      grid: {
        left: '5%',
        right: '5%',
        top: '10%',
        bottom: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: xAxisLabels,
        axisLine: {
          onZero: false,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)',
          },
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false, // X축 라벨 숨김
        },
        axisTick: {
          show: false, // X축 눈금 숨김
        },
      },
      yAxis: {
        scale: true,
        splitLine: {
          show: false, // Y축 구분선 숨김
        },
        axisLine: {
          show: false, // Y축 라인 숨김
        },
        axisLabel: {
          show: false, // Y축 라벨 숨김
        },
        axisTick: {
          show: false, // Y축 눈금 숨김
        },
      },
      series: [
        {
          name: '가격',
          type: 'candlestick',
          data: candleData,
          itemStyle: {
            color: RISE_COLOR, // 상승시 몸통 색상
            color0: FALL_COLOR, // 하락시 몸통 색상
            borderColor: RISE_COLOR, // 상승시 테두리 색상
            borderColor0: FALL_COLOR, // 하락시 테두리 색상
          },
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
              formatter: () =>
                new Intl.NumberFormat('ko-KR').format(Math.floor(currentPoint.close)),
              backgroundColor: priceColor,
              color: '#FFFFFF',
              padding: [4, 8],
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 'bold',
            },
            data: [
              {
                name: '현재가',
                yAxis: currentPoint.close,
              },
            ],
          },
        },
      ],
    };
  }, [currentPoint]);

  return (
    <div className="relative h-full" style={{ width }}>
      <div
        className="flex h-full w-full flex-col justify-center overflow-hidden rounded-2xl p-3"
        style={{ backgroundColor: '#0D192B' }}
      >
        <div className="items-centergap-4 flex flex-col p-3 text-sm">
          <h3 className="mb-3 text-[16px] font-bold">실시간 틱 캔들</h3>
          <div
            className={`flex w-full items-center justify-between gap-2 rounded-xl border border-border-color border-opacity-40 p-4`}
          >
            <div className="flex flex-col">
              <span className="text-[15px] text-border-color">{tickData?.stckPrpr} 원(체결가)</span>
              <span className="text-[15px] text-border-color">{tickData?.stckOprc} 원(시가)</span>
            </div>
            <div
              className={`duration-400 flex gap-3 rounded-md bg-opacity-80 p-3 transition-all ${tickData?.ccldDvsn === '1' ? 'border-btn-red-color bg-btn-red-color bg-opacity-10 text-btn-red-color' : 'border-btn-blue-color bg-btn-blue-color  bg-opacity-10 text-btn-blue-color'}`}
            ></div>
          </div>
        </div>

        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: `${height}px` }}
          notMerge={false}
          lazyUpdate={true}
          onEvents={{
            rendered: () => {
              console.log('틱 캔들 차트 렌더링 완료');
            },
          }}
        />
      </div>
    </div>
  );
};

// React.memo를 사용하여 컴포넌트 메모이제이션
export const TickCandleChart = React.memo(TickChartComponent, (prevProps, nextProps) => {
  // TickData 비교 로직
  if (!prevProps.tickData && !nextProps.tickData) return true;
  if (!prevProps.tickData || !nextProps.tickData) return false;

  // 중요 필드만 비교하여 불필요한 렌더링 방지
  return (
    prevProps.tickData.stckPrpr === nextProps.tickData.stckPrpr &&
    prevProps.tickData.stckCntgHour === nextProps.tickData.stckCntgHour &&
    prevProps.height === nextProps.height &&
    prevProps.width === nextProps.width
  );
});
