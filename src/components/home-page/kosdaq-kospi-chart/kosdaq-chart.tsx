import * as echarts from 'echarts';
import React, { useEffect, useRef } from 'react';

import { HomeChartData } from '@/api/types/home';

interface KosdaqChartProps {
  kosdaqData: HomeChartData[] | undefined;
}

export const KosdaqChart = ({ kosdaqData }: KosdaqChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 차트 데이터가 없을 경우 리턴
    if (!kosdaqData || kosdaqData.length === 0 || !chartRef.current) return;

    // 차트 인스턴스가 없으면 초기화
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current, null, {
        renderer: 'canvas',
        useDirtyRect: false,
      });
    }

    // 데이터를 날짜 오름차순으로 정렬
    const sortedData = [...kosdaqData].sort((a, b) => {
      return a.stckBsopDate.localeCompare(b.stckBsopDate);
    });

    // 상승/하락 여부 확인 (마지막(최신) 데이터의 전일대비 등락률)
    const latestData = sortedData[sortedData.length - 1];
    const changeRate = parseFloat(latestData.bstpNmixPrdyCtrt);
    const isPositive = !isNaN(changeRate) && changeRate >= 0;

    // 날짜 포맷팅 함수
    const formatDate = (dateStr: string) => {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      return `${year}-${month}-${day}`;
    };

    // 그래프에 사용할 데이터 준비
    const dates = sortedData.map((item) => formatDate(item.stckBsopDate));
    const prices = sortedData.map((item) => parseFloat(item.bstpNmixPrpr));

    // 색상 설정 (상승: 빨간색, 하락: 파란색)
    const mainColor = isPositive ? '#E53935' : '#1E88E5';
    const rgbValues = isPositive ? '229, 57, 53' : '30, 136, 229';

    // 그래프 옵션 설정
    const option = {
      title: {
        show: false,
      },
      grid: {
        top: 5,
        left: 0,
        right: 0,
        bottom: 0,
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        show: false,
      },
      yAxis: {
        type: 'value',
        scale: true,
        show: false,
      },
      series: [
        {
          name: '코스닥',
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          itemStyle: {
            color: mainColor,
          },
          lineStyle: {
            width: 2,
            color: mainColor,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: `rgba(${rgbValues}, 0.8)`,
              },
              {
                offset: 0.5,
                color: `rgba(${rgbValues}, 0.3)`,
              },
              {
                offset: 1,
                color: `rgba(${rgbValues}, 0.1)`,
              },
            ]),
          },
          data: prices,
        },
      ],
      animation: true,
    };

    // 차트 렌더링
    if (chartInstanceRef.current) {
      chartInstanceRef.current.setOption(option, true); // true는 차트를 완전히 초기화
    }

    // 창 크기 변경 시 차트 크기 조정
    const resizeHandler = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    };
    window.addEventListener('resize', resizeHandler);

    // 초기 크기 설정을 위한 즉시 리사이즈 호출
    setTimeout(resizeHandler, 0);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거 및 차트 정리
    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [kosdaqData]);

  // 상승/하락에 따른 텍스트 색상 클래스 설정
  const getTextColorClass = (value: string) => {
    const numValue = parseFloat(value);
    if (numValue > 0) return 'text-red-600';
    if (numValue < 0) return 'text-blue-600';
    return '';
  };

  return (
    <div className="flex w-full flex-col rounded-2xl overflow-hidden">
      <div>
        {kosdaqData && kosdaqData.length > 0 && (
          <div>
            {/* 정렬된 데이터를 만들고 마지막(최신) 항목 사용 */}
            {(() => {
              const sortedData = [...kosdaqData].sort((a, b) =>
                a.stckBsopDate.localeCompare(b.stckBsopDate),
              );
              const latestData = sortedData[sortedData.length - 1];

              return (
                <>
                  <div className="inline-block rounded-lg border border-border-color border-opacity-40 p-2">
                    <div className="flex gap-2">
                      <p>{latestData.bstpNmixPrpr}</p>
                      <p className={getTextColorClass(latestData.bstpNmixPrdyVrss)}>
                        {latestData.bstpNmixPrdyVrss}
                      </p>
                      <p className={getTextColorClass(latestData.bstpNmixPrdyCtrt)}>
                        ({latestData.bstpNmixPrdyCtrt}) %
                      </p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
      <div
        ref={chartRef}
        className="m-0 h-full w-full p-0"
        style={{ overflow: 'hidden', minHeight: '200px' }}
      ></div>
    </div>
  );
};
