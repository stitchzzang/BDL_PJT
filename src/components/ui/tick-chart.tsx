import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { throttle } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 틱 데이터 인터페이스
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

// 틱 차트 프롭스
interface TickChartProps {
  tickData: TickData | null;
  height?: number;
  width?: number;
  basePrice?: number; // 기준가 (전일 종가 등)
}

// 상수 정의
const RISE_COLOR = '#ef5350'; // 상승 색상 (빨간색)
const FALL_COLOR = '#1976d2'; // 하락 색상 (파란색)
const DEFAULT_COLOR = '#888888'; // 기본 색상 (변화 없음)
const BUY_COLOR = '#ef5350'; // 매수 색상 (빨간색)
const SELL_COLOR = '#1976d2'; // 매도 색상 (파란색)
const MAX_DATA_POINTS = 60; // 차트에 표시할 최대 데이터 포인트 수
const THROTTLE_MS = 100; // 업데이트 스로틀링 시간 (ms)

// 틱 차트 데이터 포인트 인터페이스
interface TickChartDataPoint {
  time: string;
  price: number;
  volume: number;
  changeType: 'RISE' | 'FALL' | 'NONE';
  tradeType: 'BUY' | 'SELL' | 'OTHER'; // 매수/매도/기타 구분 추가
}

const TickChartComponent: React.FC<TickChartProps> = ({
  tickData,
  height = 300,
  width = '100%',
  basePrice,
}) => {
  // 차트에 표시될 데이터 포인트 배열
  const [dataPoints, setDataPoints] = useState<TickChartDataPoint[]>([]);
  const chartRef = useRef<ReactECharts>(null);

  // 마지막으로 처리된 틱 데이터 추적
  const lastTickRef = useRef<TickData | null>(null);

  // 틱 데이터 형식 변환 및 추가
  const addTickDataPoint = useCallback(
    (tick: TickData) => {
      // 동일한 틱 데이터 중복 처리 방지
      if (
        lastTickRef.current &&
        lastTickRef.current.stckCntgHour === tick.stckCntgHour &&
        lastTickRef.current.stckPrpr === tick.stckPrpr
      ) {
        return;
      }

      // 새로운 데이터 포인트 생성
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
      if (basePrice) {
        if (tick.stckPrpr > basePrice) {
          changeType = 'RISE';
        } else if (tick.stckPrpr < basePrice) {
          changeType = 'FALL';
        }
      } else {
        if (lastTickRef.current) {
          if (tick.stckPrpr > lastTickRef.current.stckPrpr) {
            changeType = 'RISE';
          } else if (tick.stckPrpr < lastTickRef.current.stckPrpr) {
            changeType = 'FALL';
          }
        }
      }

      // 매수/매도 유형 결정 (ccldDvsn 필드 사용)
      let tradeType: 'BUY' | 'SELL' | 'OTHER' = 'OTHER';
      if (tick.ccldDvsn === '1') {
        tradeType = 'BUY'; // 매수
      } else if (tick.ccldDvsn === '5') {
        tradeType = 'SELL'; // 매도
      }

      const newPoint: TickChartDataPoint = {
        time: formatTime(tick.stckCntgHour),
        price: tick.stckPrpr,
        volume: tick.cntgVol,
        changeType: changeType,
        tradeType: tradeType,
      };

      // 새 데이터 포인트 추가 및 최대 개수 유지
      setDataPoints((prev) => {
        const updatedPoints = [...prev, newPoint];
        if (updatedPoints.length > MAX_DATA_POINTS) {
          return updatedPoints.slice(-MAX_DATA_POINTS);
        }
        return updatedPoints;
      });

      // 참조 업데이트
      lastTickRef.current = { ...tick };
    },
    [basePrice],
  );

  // 스로틀링된 틱 데이터 처리 함수
  const throttledAddTickData = useCallback(
    throttle((tick: TickData) => {
      addTickDataPoint(tick);
    }, THROTTLE_MS),
    [addTickDataPoint],
  );

  // 틱 데이터 변경 시 처리
  useEffect(() => {
    if (tickData) {
      throttledAddTickData(tickData);
    }
  }, [tickData, throttledAddTickData]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      throttledAddTickData.cancel();
    };
  }, [throttledAddTickData]);

  // 차트 옵션 설정
  const option: EChartsOption = useMemo(() => {
    // 빈 데이터일 경우 기본 옵션
    if (dataPoints.length === 0) {
      return {
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: [],
          axisLine: { onZero: false },
          boundaryGap: false,
        },
        yAxis: {
          type: 'value',
          scale: true,
          splitLine: {
            lineStyle: {
              color: 'rgba(84, 84, 84, 0.1)',
            },
          },
          axisLine: {
            lineStyle: {
              color: 'rgba(255, 255, 255, 0.3)',
            },
          },
          axisLabel: {
            formatter: (value: number) => new Intl.NumberFormat('ko-KR').format(value),
          },
        },
        series: [
          {
            name: '가격',
            type: 'line',
            data: [],
          },
        ],
      };
    }

    // 시간 라벨 추출
    const times = dataPoints.map((point) => point.time);

    // 가격 데이터 추출
    const prices = dataPoints.map((point) => point.price);

    // 매수/매도에 따른 색상 설정 (매수:빨간색, 매도:파란색)
    const symbolColors = dataPoints.map((point) => {
      if (point.tradeType === 'BUY') return BUY_COLOR;
      if (point.tradeType === 'SELL') return SELL_COLOR;
      return DEFAULT_COLOR;
    });

    // 최신 가격과 변화 유형
    const latestPoint = dataPoints[dataPoints.length - 1];
    const latestPrice = latestPoint.price;

    // 라인 색상은 가격 변화에 따라 설정
    const latestColor =
      latestPoint.changeType === 'RISE'
        ? RISE_COLOR
        : latestPoint.changeType === 'FALL'
          ? FALL_COLOR
          : DEFAULT_COLOR;

    // Y축 범위 계산 (최소값과 최대값에 약간의 여유 추가)
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;
    const padding = range * 0.05; // 5% 패딩

    const yMin = Math.max(0, minPrice - padding);
    const yMax = maxPrice + padding;

    // 매수/매도 구분을 위한 스카터 시리즈 데이터 준비
    const scatterData = dataPoints.map((point, index) => {
      return [
        index,
        point.price,
        point.tradeType === 'BUY' ? 10 : point.tradeType === 'SELL' ? 10 : 0, // 크기 (매수/매도만 표시)
        point.tradeType === 'BUY' ? 0 : point.tradeType === 'SELL' ? 1 : 2, // 분류 (0:매수, 1:매도, 2:기타)
      ];
    });

    return {
      animation: false, // 애니메이션 비활성화로 성능 향상
      backgroundColor: '#0D192B',
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex;
          const point = dataPoints[dataIndex];

          if (!point) return '';

          const tradeTypeText =
            point.tradeType === 'BUY' ? '매수' : point.tradeType === 'SELL' ? '매도' : '기타';

          const tradeColor =
            point.tradeType === 'BUY'
              ? BUY_COLOR
              : point.tradeType === 'SELL'
                ? SELL_COLOR
                : DEFAULT_COLOR;

          return `
            <div>
              <div style="margin-bottom: 4px;">${point.time}</div>
              <div>가격: <strong>${new Intl.NumberFormat('ko-KR').format(point.price)}</strong></div>
              <div>거래량: ${new Intl.NumberFormat('ko-KR').format(point.volume)}</div>
              <div>구분: <span style="color:${tradeColor};font-weight:bold">${tradeTypeText}</span></div>
            </div>
          `;
        },
      },
      xAxis: {
        type: 'category',
        data: times,
        axisLine: { onZero: false },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.7)',
          showMaxLabel: true,
          formatter: (value: string, index: number) => {
            // 시간 표시 간소화 (초 생략 등)
            if (index % 5 === 0 || index === times.length - 1) {
              return value.substring(0, 5); // HH:MM 만 표시
            }
            return '';
          },
        },
        boundaryGap: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        scale: true,
        min: yMin,
        max: yMax,
        splitLine: {
          lineStyle: {
            color: 'rgba(84, 84, 84, 0.1)',
          },
        },
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)',
          },
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.7)',
          formatter: (value: number) => new Intl.NumberFormat('ko-KR').format(value),
        },
        position: 'right',
      },
      series: [
        {
          name: '가격',
          type: 'line',
          data: prices,
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 2,
          },
          areaStyle: {
            opacity: 0.2,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: latestColor,
                },
                {
                  offset: 1,
                  color: 'rgba(0, 0, 0, 0)',
                },
              ],
            },
          },
          markLine: {
            symbol: 'none',
            lineStyle: {
              color: latestColor,
              type: 'solid',
              width: 1,
              opacity: 0.7,
            },
            label: {
              show: true,
              position: 'end',
              formatter: () => new Intl.NumberFormat('ko-KR').format(Math.floor(latestPrice)),
              backgroundColor: latestColor,
              color: '#FFFFFF',
              padding: [4, 8],
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 'bold',
            },
            data: [
              {
                name: '현재가',
                yAxis: latestPrice,
              },
            ],
          },
        },
        // 매수/매도 표시를 위한 스캐터 시리즈 추가
        {
          name: '매수/매도',
          type: 'scatter',
          symbolSize: function (data: any) {
            return data[2]; // 크기 값 사용
          },
          itemStyle: {
            color: function (params: any) {
              const type = params.data[3];
              if (type === 0)
                return BUY_COLOR; // 매수
              else if (type === 1) return SELL_COLOR; // 매도
              return 'transparent'; // 기타는 표시 안함
            },
          },
          data: scatterData,
        },
      ],
      visualMap: {
        show: false,
        dimension: 3, // 시리즈 데이터의 4번째 값(인덱스 3)을 기준으로 시각화
        pieces: [
          { value: 0, color: BUY_COLOR }, // 매수
          { value: 1, color: SELL_COLOR }, // 매도
        ],
      },
    };
  }, [dataPoints]);

  return (
    <div className="relative" style={{ width }}>
      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl"
        style={{ backgroundColor: '#0D192B' }}
      >
        <div className="flex items-center justify-between p-3 text-sm text-white">
          <h3 className="font-bold">실시간 틱 차트</h3>
          {tickData && (
            <div className="flex items-center gap-2">
              <span>현재가:</span>
              <span
                className="font-bold"
                style={{
                  color:
                    lastTickRef.current && tickData.stckPrpr > lastTickRef.current.stckPrpr
                      ? RISE_COLOR
                      : lastTickRef.current && tickData.stckPrpr < lastTickRef.current.stckPrpr
                        ? FALL_COLOR
                        : 'white',
                }}
              >
                {new Intl.NumberFormat('ko-KR').format(tickData.stckPrpr)}
              </span>
              {/* 최근 체결 구분 표시 추가 */}
              {tickData.ccldDvsn && (
                <span
                  className="ml-2 rounded px-2 py-1 text-xs font-bold"
                  style={{
                    backgroundColor:
                      tickData.ccldDvsn === '1'
                        ? BUY_COLOR
                        : tickData.ccldDvsn === '5'
                          ? SELL_COLOR
                          : 'transparent',
                    color: 'white',
                  }}
                >
                  {tickData.ccldDvsn === '1'
                    ? '매수'
                    : tickData.ccldDvsn === '5'
                      ? '매도'
                      : tickData.ccldDvsn === '3'
                        ? '장전'
                        : ''}
                </span>
              )}
            </div>
          )}
        </div>

        <ReactECharts
          ref={chartRef}
          option={option}
          style={{ height: `${height}px` }}
          notMerge={false}
          lazyUpdate={true}
          onEvents={{
            rendered: () => console.log('틱 차트 렌더링 완료'),
          }}
        />

        {/* 범례 추가 */}
        <div className="flex items-center justify-center gap-4 p-2 text-xs text-white">
          <div className="flex items-center">
            <div className="mr-1 h-3 w-3 rounded-full" style={{ backgroundColor: BUY_COLOR }}></div>
            <span>매수</span>
          </div>
          <div className="flex items-center">
            <div
              className="mr-1 h-3 w-3 rounded-full"
              style={{ backgroundColor: SELL_COLOR }}
            ></div>
            <span>매도</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// React.memo를 사용하여 컴포넌트 메모이제이션
export const TickChart = React.memo(TickChartComponent, (prevProps, nextProps) => {
  // TickData 비교 로직
  if (!prevProps.tickData && !nextProps.tickData) return true;
  if (!prevProps.tickData || !nextProps.tickData) return false;

  // 중요 필드만 비교하여 불필요한 렌더링 방지
  return (
    prevProps.tickData.stckPrpr === nextProps.tickData.stckPrpr &&
    prevProps.tickData.stckCntgHour === nextProps.tickData.stckCntgHour &&
    prevProps.tickData.ccldDvsn === nextProps.tickData.ccldDvsn && // ccldDvsn 비교 추가
    prevProps.height === nextProps.height &&
    prevProps.width === nextProps.width
  );
});
