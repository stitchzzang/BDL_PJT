import * as echarts from 'echarts';
import React, { useEffect, useRef } from 'react';

import { HomeChartData } from '@/api/types/home';

interface KospiChartProps {
  KospiData: HomeChartData[] | undefined;
}

export const KospiChart = ({ KospiData }: KospiChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 차트 데이터가 없을 경우 리턴
    if (!KospiData || KospiData.length === 0) return;

    // 데이터를 날짜 오름차순으로 정렬
    const sortedData = [...KospiData].sort((a, b) => {
      return a.stckBsopDate.localeCompare(b.stckBsopDate);
    });

    // ECharts 초기화 - 렌더 옵션 추가
    const chartInstance = echarts.init(chartRef.current, null, {
      renderer: 'canvas',
      useDirtyRect: false,
    });

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

    // 그래프 옵션 설정
    const option = {
      title: {
        show: false, // 타이틀 완전히 숨기기
      },

      grid: {
        top: 5,
        left: 0,
        right: 0,
        bottom: 0,
        containLabel: false, // 레이블을 포함하지 않도록 변경
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        show: false, // x축 완전히 숨기기
      },
      yAxis: {
        type: 'value',
        scale: true,
        show: false, // y축 완전히 숨기기
      },
      series: [
        {
          name: '코스피',
          type: 'line',
          smooth: true,
          symbol: 'none', // 데이터 포인트 완전히 제거
          sampling: 'average',
          itemStyle: {
            color: '#1E88E5',
          },
          lineStyle: {
            width: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgba(30, 136, 229, 0.8)',
              },
              {
                offset: 0.5,
                color: 'rgba(30, 136, 229, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(30, 136, 229, 0.1)',
              },
            ]),
          },
          data: prices,
        },
      ],
      animation: true,
    };

    // 차트 렌더링
    chartInstance.setOption(option);

    // 창 크기 변경 시 차트 크기 조정
    const resizeHandler = () => {
      chartInstance.resize();
    };
    window.addEventListener('resize', resizeHandler);

    // 초기 크기 설정을 위한 즉시 리사이즈 호출
    setTimeout(() => {
      chartInstance.resize();
    }, 0);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', resizeHandler);
      chartInstance.dispose();
    };
  }, [KospiData]);

  return (
    <div className="flex w-full flex-col">
      <div
        ref={chartRef}
        className="m-0 h-full w-full p-0"
        style={{ overflow: 'hidden', minHeight: '200px' }}
      ></div>
    </div>
  );
};
