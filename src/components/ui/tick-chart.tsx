import { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { throttle } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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

// 부드러운 전환을 위한 스타일
const transitionStyle = `
  .price-transition {
    transition: color 0.5s ease;
  }

  .badge-transition {
    transition: background-color 0.5s ease;
  }

  .bar-transition {
    transition: width 0.5s ease-out;
  }
`;

const TickChartComponent: React.FC<TickChartProps> = ({
  tickData,
  height = 200,
  width = '100%',
  basePrice,
}) => {
  // 차트 인스턴스 참조
  const chartRef = useRef<ReactECharts>(null);

  // 마지막으로 처리된 틱 데이터 추적
  const lastTickRef = useRef<TickData | null>(null);

  // 차트 옵션 상태
  const [chartOption, setChartOption] = useState<EChartsOption>({});

  // 데이터 포인트를 상태로 관리
  const [dataPoints, setDataPoints] = useState<TickChartDataPoint[]>([]);

  // 차트 초기화 상태
  const [isInitialized, setIsInitialized] = useState(false);

  // 현재가 표시를 위한 상태
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChangeType, setPriceChangeType] = useState<'RISE' | 'FALL' | 'NONE'>('NONE');
  const [tradeType, setTradeType] = useState<string>('');

  // 차트 인스턴스 저장
  const onChartReady = useCallback(() => {
    setIsInitialized(true);
  }, []);

  // 틱 데이터 처리 및 차트 업데이트
  const processTickData = useCallback(
    (tick: TickData) => {
      if (!tick) return;

      // 동일한 틱 데이터 중복 처리 방지
      if (
        lastTickRef.current &&
        lastTickRef.current.stckCntgHour === tick.stckCntgHour &&
        lastTickRef.current.stckPrpr === tick.stckPrpr
      ) {
        return;
      }

      // 시간 포맷팅
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

      // 매수/매도 유형 결정
      let tradeType: 'BUY' | 'SELL' | 'OTHER' = 'OTHER';
      if (tick.ccldDvsn === '1') {
        tradeType = 'BUY'; // 매수
      } else if (tick.ccldDvsn === '5') {
        tradeType = 'SELL'; // 매도
      }

      // 새 데이터 포인트
      const newPoint: TickChartDataPoint = {
        time: formatTime(tick.stckCntgHour),
        price: tick.stckPrpr,
        volume: tick.cntgVol,
        changeType: changeType,
        tradeType: tradeType,
      };

      // 데이터 배열 업데이트 (불변성 유지)
      setDataPoints((prevPoints) => {
        const updatedPoints = [...prevPoints, newPoint];
        return updatedPoints.length > MAX_DATA_POINTS
          ? updatedPoints.slice(-MAX_DATA_POINTS)
          : updatedPoints;
      });

      // 현재가 및 변화 유형 업데이트
      setCurrentPrice(tick.stckPrpr);
      setPriceChangeType(changeType);
      setTradeType(tick.ccldDvsn);

      // 마지막 틱 업데이트
      lastTickRef.current = { ...tick };
    },
    [basePrice],
  );

  // 스로틀링된 틱 데이터 처리 함수
  const throttledProcessTickData = useCallback(
    throttle((tick: TickData) => {
      processTickData(tick);
    }, THROTTLE_MS),
    [processTickData],
  );

  // 틱 데이터 변경 시 처리
  useEffect(() => {
    if (tickData) {
      throttledProcessTickData(tickData);
    }
  }, [tickData, throttledProcessTickData]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      throttledProcessTickData.cancel();
    };
  }, [throttledProcessTickData]);

  // 데이터 포인트가 변경될 때마다 차트 옵션 업데이트
  useEffect(() => {
    if (dataPoints.length === 0) return;

    // 시간 라벨 추출
    const times = dataPoints.map((point) => point.time);

    // 가격 데이터 추출
    const prices = dataPoints.map((point) => point.price);

    // 최신 가격과 변화 유형
    const latestPoint = dataPoints[dataPoints.length - 1];
    const latestPrice = latestPoint.price;
    const latestChangeType = latestPoint.changeType;

    // 라인 색상은 가격 변화에 따라 설정
    const latestColor =
      latestChangeType === 'RISE'
        ? RISE_COLOR
        : latestChangeType === 'FALL'
          ? FALL_COLOR
          : DEFAULT_COLOR;

    // 거래 유형에 따른 색상 계산
    const tradeTypeColor =
      tradeType === '1'
        ? BUY_COLOR // 매수 색상
        : tradeType === '5'
          ? SELL_COLOR // 매도 색상
          : DEFAULT_COLOR; // 기본 색상

    // Y축 범위 계산 (최소값과 최대값에 약간의 여유 추가)
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1; // 0으로 나누기 방지
    const padding = range * 0.05; // 5% 패딩

    const yMin = Math.max(0, minPrice - padding);
    const yMax = maxPrice + padding;

    // 매수/매도 표시 데이터
    const scatterData = dataPoints
      .map((point, index) => {
        if (point.tradeType === 'BUY' || point.tradeType === 'SELL') {
          return [
            times[index], // x축 값으로 시간 사용
            point.price, // y축 값으로 가격 사용
            point.tradeType === 'BUY' ? BUY_COLOR : SELL_COLOR, // 색상 정보
          ];
        }
        return null;
      })
      .filter(Boolean);

    const newOption: EChartsOption = {
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
            if (index % 5 === 0 || index === times.length - 1) {
              // 형식이 'HH:MM:SS'일 경우
              const parts = value.split(':');
              if (parts.length >= 3) {
                return `${parts[1]}:${parts[2]}`; // MM분 SS초 형식으로 표시
              } else if (parts.length >= 2) {
                return `${parts[1]}`; // 초가 없을 경우 MM분만 표시
              }
              return value; // 원래 형식을 유지
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
            color: latestColor,
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
              color: tradeTypeColor,
              type: 'solid',
              width: 1,
              opacity: 0.7,
            },
            label: {
              show: true,
              position: 'end',
              formatter: () => new Intl.NumberFormat('ko-KR').format(Math.floor(latestPrice)),
              backgroundColor: tradeTypeColor,
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
      ],
      animation: true,
      animationDuration: 300,
      animationEasing: 'cubicOut',
    };

    setChartOption(newOption);
  }, [dataPoints]);

  return (
    <div className="relative" style={{ width }}>
      {/* 트랜지션 스타일 추가 */}
      <style>{transitionStyle}</style>

      <div
        className="flex h-full w-full flex-col overflow-hidden rounded-2xl"
        style={{ backgroundColor: '#0D192B' }}
      >
        <div className="flex items-center justify-between p-3 text-sm text-white">
          <h3 className="font-bold">실시간 틱 차트</h3>
          {currentPrice !== null && (
            <div className="flex items-center gap-2">
              <span>현재가:</span>
              <span
                className="price-transition font-bold"
                style={{
                  color: tradeType === '1' ? RISE_COLOR : tradeType === '5' ? FALL_COLOR : 'white',
                }}
              >
                {new Intl.NumberFormat('ko-KR').format(currentPrice)}
              </span>
              {/* 최근 체결 구분 표시 */}
              {tradeType && (
                <span
                  className="badge-transition ml-2 rounded px-2 py-1 text-xs font-bold"
                  style={{
                    backgroundColor:
                      tradeType === '1'
                        ? BUY_COLOR
                        : tradeType === '5'
                          ? SELL_COLOR
                          : 'transparent',
                    color: 'white',
                  }}
                >
                  {tradeType === '1'
                    ? '매수'
                    : tradeType === '5'
                      ? '매도'
                      : tradeType === '3'
                        ? '장전'
                        : ''}
                </span>
              )}
            </div>
          )}
        </div>

        <ReactECharts
          ref={chartRef}
          option={chartOption}
          style={{ height: `${height}px` }}
          opts={{ renderer: 'canvas' }}
          onChartReady={onChartReady}
          notMerge={false}
          lazyUpdate={false}
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
    prevProps.tickData.ccldDvsn === nextProps.tickData.ccldDvsn &&
    prevProps.height === nextProps.height &&
    prevProps.width === nextProps.width
  );
});
