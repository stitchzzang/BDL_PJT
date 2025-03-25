import { useEffect, useState } from 'react';

import { useStockMinuteData } from '@/api/stock.api';
import { TickData } from '@/api/types/stock';
import { OrderStatus } from '@/components/mock-investment/order-status/order-status';
import { SellingPrice } from '@/components/mock-investment/selling-price/selling-price';
import { TickInfo } from '@/components/mock-investment/stock-chart/stock-chart';
import { StockCostHistory } from '@/components/mock-investment/stock-cost-history/stock-cost-history';
import { StockInfo } from '@/components/mock-investment/stock-info/stock-info';
import { StockInfoDetail } from '@/components/mock-investment/stock-info-detail/stock-info-detail';
import ChartComponent from '@/components/ui/chart';
import { dummyChartData } from '@/lib/dummy-data';
import { useTickConnection } from '@/services/SocketStockTickData';
import { getTodayFormatted } from '@/utils/getTodayFormatted';

export const SimulatedInvestmentPage = () => {
  const todayData = getTodayFormatted();
  //초기 데이터 설정 및 소켓 연결
  const { data: minuteData, isLoading, isError, isSuccess } = useStockMinuteData('000660', 50);

  // 소켓 연결 관련 훅
  const { IsConnected, connectTick, disconnectTick } = useTickConnection();
  const [tickData, setTickData] = useState<TickData | null>(null);

  // 정적 데이터 확인 후 소켓 연결 시작
  useEffect(() => {
    // 데이터 확인 후 진행
    if (isSuccess && minuteData) {
      // 소켓 연결 시작
      console.log('테스트 - 제발 되라');
      connectTick('000660', setTickData);

      //컴포넌트 언마운트 시 해제
      return () => {
        disconnectTick();
      };
    }
  }, [isSuccess, minuteData, connectTick, disconnectTick]);

  if (isLoading) {
    return (
      <div>
        <h1>loding</h1>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col px-6">
      <div>
        <div>
          <StockInfo category="반도체" />
        </div>
        <div className="mb-[16px] mt-[30px] flex items-center justify-between">
          <div className="rounded-2xl bg-modal-background-color px-[24px] py-[20px]">
            <p className="font-bold">차트</p>
          </div>
          <div>
            <TickInfo tickData={tickData} />
          </div>
          <div className="flex items-center gap-3">
            <p className="text-border-color">오늘 날짜</p>
            <div className="rounded-xl bg-modal-background-color px-[20px] py-[16px]">
              <p>{todayData}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-[20px] grid grid-cols-1 gap-5 lg:grid-cols-10">
        <div className="col-span-1 lg:col-span-8">
          <ChartComponent data={dummyChartData} height={600} />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <OrderStatus />
        </div>
      </div>
      <div className="grid grid-cols-10 gap-5">
        <div className="col-span-5">
          <StockCostHistory />
        </div>
        <div className="col-span-3">
          <StockInfoDetail />
        </div>
        <div className="col-span-2">
          <SellingPrice />
        </div>
      </div>
    </div>
  );
};
