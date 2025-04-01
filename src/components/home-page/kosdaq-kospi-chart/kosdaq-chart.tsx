import * as echarts from 'echarts';
import React, { useEffect, useRef } from 'react';

import { HomeChartData } from '@/api/types/home';

interface KosdaqChartProps {
  kosdaqData: HomeChartData[] | undefined;
}

export const KosdaqChart = ({ kosdaqData }: KosdaqChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 차트 데이터가 없을 경우 리턴
    if (!kosdaqData || kosdaqData.length === 0) return;

    // 데이터를 날짜 오름차순으로 정렬
    const sortedData = [...kosdaqData].sort((a, b) => {
      return a.stckBsopDate.localeCompare(b.stckBsopDate);
    });

    // ECharts 초기화
    const chartInstance = echarts.init(chartRef.current);

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
        text: '',
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params: any) {
          const dataIndex = params[0].dataIndex;
          const item = sortedData[dataIndex];
          return `
            <div>
              <div><strong>${formatDate(item.stckBsopDate)}</strong></div>
              <div>시가: ${item.bstpNmixOprc}</div>
              <div>고가: ${item.bstpNmixHgpr}</div>
              <div>저가: ${item.bstpNmixLwpr}</div>
              <div>종가: ${item.bstpNmixPrpr}</div>
              <div>거래량: ${parseInt(item.acmlVol).toLocaleString()}</div>
              <div>전일대비: ${item.bstpNmixPrdyVrss} (${item.bstpNmixPrdyCtrt}%)</div>
            </div>
          `;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates,
        axisLine: {
          lineStyle: {
            color: '#cccccc0',
          },
        },
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLine: {
          lineStyle: {
            color: '#1818180',
          },
        },
        splitLine: {
          lineStyle: {
            color: '#2424240',
          },
        },
      },
      series: [
        {
          name: '코스닥',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 0,
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

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', resizeHandler);
      chartInstance.dispose();
    };
  }, [kosdaqData]);

  return (
    <div className="flex w-full flex-col items-center">
      <div ref={chartRef} className="h-64 w-full md:h-96"></div>
    </div>
  );
};
