import { EChartsOption, graphic } from 'echarts';
import ReactECharts from 'echarts-for-react';
import React, { FC, useEffect, useState } from 'react';

import { Trade } from '@/api/types/algorithm';

export interface DailyData {
  index: number;
  date: string;
  portfolioValue: number;
  cash: number;
  equity: number;
  dailyReturn: number;
  cumulativeReturn: number;
  trade: null | Trade;
}

// 차트에 필요한 Props 타입 정의
interface AssetComparisonChartProps {
  initialAsset: number; // 초기 자산 (고정값)
  changingAssets?: DailyData[] | null; // 시간에 따른 변동 자산 값 배열
  labels?: string[]; // 차트 x축 라벨 (기간 표시, 선택 사항)
  isRunning?: boolean; // 10초 애니메이션 구동 여부 확인
}

// 자산 비교 차트 컴포넌트
const AssetComparisonChart: FC<AssetComparisonChartProps> = ({
  initialAsset,
  changingAssets,
  labels,
  isRunning,
}) => {
  // 차트 옵션 상태
  const [options, setOptions] = useState<EChartsOption>({});

  // 변화율 계산 함수
  const calculateChangeRate = (currentValue: number, initialValue: number): number => {
    return ((currentValue - initialValue) / initialValue) * 100;
  };

  // 차트 옵션 설정
  useEffect(() => {
    if (!changingAssets || changingAssets.length === 0) return;

    // 날짜 라벨 설정 - 데이터가 있을 때만 생성
    const dateLabels = labels || changingAssets.map((data) => data.date);

    // 자산 변화율 배열 생성
    const getChangeRates = () => {
      return changingAssets.map((data) => calculateChangeRate(data.portfolioValue, initialAsset));
    };

    const portfolioValues = changingAssets.map((data) => data.portfolioValue);
    const changeRates = getChangeRates();

    // 최소값과 최대값을 구하여 y축 범위 설정에 사용
    const minPortfolioValue = Math.min(...portfolioValues);
    const maxPortfolioValue = Math.max(...portfolioValues);

    // 작은 변화도 잘 보이도록 y축 범위 조정
    // 최대/최소값의 차이가 초기자산의 일정 비율(예: 10%) 이하면 범위를 강제로 확대
    const valueRange = maxPortfolioValue - minPortfolioValue;
    const minThreshold = initialAsset * 0.1; // 초기 자산의 10%

    let yMin, yMax;

    if (valueRange < minThreshold) {
      // 변화가 작을 경우 범위를 더 넓게 확대
      const midPoint = (maxPortfolioValue + minPortfolioValue) / 2;
      yMin = midPoint - minThreshold / 1.5;
      yMax = midPoint + minThreshold / 1.5;
    } else {
      // 변화가 충분히 클 경우 약간의 여백만 추가
      const padding = valueRange * 0.1;
      yMin = minPortfolioValue - padding;
      yMax = maxPortfolioValue + padding;
    }

    const chartOptions: EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 0,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowBlur: 10,
        textStyle: {
          color: '#333',
        },
        formatter: (params: any) => {
          const dataIndex = params[0].dataIndex;
          const dailyData = changingAssets[dataIndex];
          const changeRate = changeRates[dataIndex];
          const rateColor = changeRate >= 0 ? '#E15554' : '#4D9DE0';
          const arrowSymbol = changeRate >= 0 ? '▲' : '▼';

          return `<div style="padding: 8px;">
                  <div style="font-weight: bold; margin-bottom: 8px;">${dateLabels[dataIndex]}</div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>포트폴리오 가치:</span>
                    <span style="font-weight: bold;">${dailyData.portfolioValue.toLocaleString()}원</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>초기 대비 변화:</span>
                    <span style="color: ${rateColor}; font-weight: bold;">
                      ${arrowSymbol} ${Math.abs(dailyData.portfolioValue - initialAsset).toLocaleString()}원 (${changeRate.toFixed(2)}%)
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>현금:</span>
                    <span>${dailyData.cash.toLocaleString()}원</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span>주식:</span>
                    <span>${dailyData.equity.toLocaleString()}원</span>
                  </div>
                </div>`;
        },
      },
      legend: {
        data: ['포트폴리오', '초기자산'],
        bottom: 0,
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
        textStyle: {
          color: '#666',
        },
      },
      grid: {
        left: '1%',
        right: '5%',
        bottom: '10%',
        top: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dateLabels,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#718096',
          },
        },
        axisLabel: {
          formatter: (value: string) => {
            // 날짜 형식을 더 간결하게 표시 (예: 2023-01-01 → 01-01)
            const dateObj = new Date(value);
            if (dateObj.toString() === 'Invalid Date') {
              return value; // 유효하지 않은 날짜면 원래 값 반환
            }
            return `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
          },
          interval: 'auto',
          color: '#212E40',
        },
        splitLine: {
          show: false,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '금액',
          position: 'left',
          min: yMin,
          max: yMax,
          nameTextStyle: {
            color: '#999',
            padding: [0, 30, 0, 0],
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            formatter: (value: number) => `${(value / 10000).toFixed(0)}만`,
            color: '#212E40',
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(33, 46, 64, 0.1)',
              type: 'dashed',
            },
          },
        },
      ],

      series: [
        {
          name: '포트폴리오',
          type: 'line',
          data: portfolioValues,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          showSymbol: false,
          lineStyle: {
            width: 3,
            color: '#3F51B5',
          },
          itemStyle: {
            color: '#3F51B5',
            borderWidth: 2,
            borderColor: '#fff',
          },
          areaStyle: {
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(0, 0, 0, 0.2)',
              },
              {
                offset: 1,
                color: 'rgba(63, 81, 181, 0.0)',
              },
            ]),
            origin: 'start',
          },
          markArea: {
            silent: true,
            itemStyle: {
              opacity: 0.1,
            },
            data: [
              [
                {
                  yAxis: initialAsset,
                  itemStyle: {
                    color: '#3A1F2D', // 상승 영역 색상
                  },
                },
                {
                  yAxis: maxPortfolioValue + (yMax - maxPortfolioValue),
                },
              ],
              [
                {
                  yAxis: minPortfolioValue - (minPortfolioValue - yMin),
                  itemStyle: {
                    color: '#0A3355', // 하락 영역 색상
                  },
                },
                {
                  yAxis: initialAsset,
                },
              ],
            ],
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              color: '#888',
              type: 'dashed',
              width: 1,
            },
            label: {
              show: true,
              position: 'insideEndTop',
              formatter: '초기자산',
              fontSize: 10,
              color: '#666',
            },
            data: [
              {
                yAxis: initialAsset,
                label: {
                  show: true,
                  position: 'end',
                },
              },
            ],
          },
          markPoint: {
            symbol: 'pin',
            symbolSize: 36,
            data: [
              // 최대/최소 변화량 표시

              // 거래 지점 표시
              ...changingAssets
                .filter((data) => data.trade !== null)
                .map((data) => ({
                  name: data.trade?.type === 'BUY' ? '매수' : '매도',
                  coord: [dateLabels.indexOf(data.date), data.portfolioValue],
                  itemStyle: {
                    color: data.trade?.type === 'BUY' ? '#F23636' : '#076BFD',
                  },
                  label: {
                    formatter: data.trade?.type === 'BUY' ? '매수' : '매도',
                    color: '#fff',
                    fontSize: 10,
                  },
                })),
            ],
          },
        },
        {
          name: '초기자산',
          type: 'line',
          data: Array(changingAssets.length).fill(initialAsset),
          symbol: 'none',
          lineStyle: {
            type: 'dashed',
            width: 1,
            color: '#888',
          },
          tooltip: {
            show: false,
          },
        },
      ],
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
          // zoomLock: dateLabels.length <= 30, // 데이터가 30개 이하일 때 줌 잠금
          moveOnMouseMove: false, // 드래그로만 이동 가능하게 설정
        },
      ],
      animation: !isRunning,
    };

    setOptions(chartOptions);
  }, [initialAsset, changingAssets, labels]);

  // 차트 데이터 없을 경우 처리
  if (!changingAssets || changingAssets.length === 0) {
    return (
      <div
        className="bg-modal-background-color"
        style={{
          height: '300px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '1px solid #f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        }}
      >
        <p style={{ color: '#999', fontSize: '16px' }}>데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      className="h-full bg-modal-background-color"
      style={{
        width: '100%',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      <ReactECharts
        option={options}
        style={{ height: '300px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};

// 사용 예시 컴포넌트
export const AssetChangeChart: FC = () => {
  // 예시 데이터
  const initialAsset = 10000000; // 1천만원 초기 자산

  return (
    <div className="h-full">
      <h1>백테스팅 결과 대시보드</h1>
      <div className="my-2">
        <h1 className="text-[14px] font-bold">주식 차트</h1>
      </div>
      <AssetComparisonChart initialAsset={initialAsset} />
    </div>
  );
};

export default AssetComparisonChart;
