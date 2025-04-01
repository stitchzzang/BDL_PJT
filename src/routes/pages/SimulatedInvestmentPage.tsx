import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useCompanyInfoData, useStockDailyData, useStockMinuteData } from '@/api/stock.api';
import { TickData } from '@/api/types/stock';
import { ErrorScreen } from '@/components/common/error-screen';
import { LoadingAnimation } from '@/components/common/loading-animation';
import { OrderStatus } from '@/components/mock-investment/order-status/order-status';
import { SellingPrice } from '@/components/mock-investment/selling-price/selling-price';
import { TickInfo } from '@/components/mock-investment/stock-chart/stock-chart';
import { StockCostHistory } from '@/components/mock-investment/stock-cost-history/stock-cost-history';
import { StockInfo } from '@/components/mock-investment/stock-info/stock-info';
import { StockInfoDetail } from '@/components/mock-investment/stock-info-detail/stock-info-detail';
import { ChartContainer } from '@/components/ui/chart-container';
import { MinuteChart } from '@/components/ui/chart-simulate';
import { TickChart } from '@/components/ui/tick-chart';
import { useTickConnection } from '@/services/SocketStockTickDataService';
import { getTodayFormatted } from '@/utils/getTodayFormatted';

export const SimulatedInvestmentPage = () => {
  const { companyId } = useParams(); // companyId 주소 파라미터에서 가져오기
  const stockCompanyId = Number(companyId); // 숫자로 변환
  const todayData = getTodayFormatted();
  //초기 데이터 설정 및 소켓 연결
  const { data: stockCompanyInfo, isLoading, isError } = useCompanyInfoData(stockCompanyId);
  const { data: minuteData, isSuccess } = useStockMinuteData(stockCompanyId, 100);
  const [closePrice, setClosePrice] = useState<number>(0);
  const [comparePrice, setComparePrice] = useState<number>(0);
  // 초기 데이터  일,주,월(1=일, 2=주, 3=월)
  const { data: stockDailyData } = useStockDailyData(stockCompanyId, 1, 20);

  // 소켓 연결 관련 훅
  const { IsConnected, connectTick, disconnectTick } = useTickConnection();
  const [tickData, setTickData] = useState<TickData | null>(null);

  // useCallback으로 이벤트 핸들러 메모이제이션
  const handleLoadMore = useCallback(
    async (cursor: string) => {
      // 추가 데이터 로드 로직
      return null;
    },
    [], // 의존성 배열
  );

  // 정적 데이터 확인 후 소켓 연결 시작
  useEffect(() => {
    //장 마감을 위한 1분 데이터 종가 가져오기
    if (minuteData && stockDailyData) {
      setClosePrice(minuteData.data[100].closePrice);
      setComparePrice(stockDailyData.result.data[19].closePrice);
    }
    // 데이터 확인 후 진행
    if (isSuccess && minuteData && stockDailyData && stockCompanyInfo) {
      // 소켓 연결 시작
      connectTick(stockCompanyInfo?.companyCode, setTickData);

      //컴포넌트 언마운트 시 해제
      return () => {
        disconnectTick();
      };
    }
  }, [isSuccess, minuteData, connectTick, disconnectTick, stockDailyData]);

  // minuteChart 컴포넌트를 useMemo로 메모이제이션
  const memoizedChart = useMemo(() => {
    if (!minuteData) return null;
    return <MinuteChart initialData={minuteData} onLoadMoreData={handleLoadMore} />;
  }, [minuteData, handleLoadMore]);

  if (isLoading) {
    return (
      <div>
        <LoadingAnimation />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center">
        <ErrorScreen />
        <p className="font-light text-border-color">(현재 잘못된 종목 페이지입니다.)</p>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col px-6">
      <div>
        <div>
          <StockInfo
            stockCompanyInfo={stockCompanyInfo}
            tickData={tickData}
            closePrice={closePrice}
          />
        </div>
        <div className="mb-[16px] mt-[30px] flex justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-modal-background-color px-[24px] py-[20px]">
              <p className="font-bold">차트</p>
            </div>
            <div>
              <TickInfo tickData={tickData} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-border-color">오늘 날짜</p>
            <div className="rounded-xl bg-modal-background-color px-[20px] py-[16px]">
              <p>{todayData}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-[20px] grid grid-cols-1 gap-3 lg:grid-cols-10">
        <div className="col-span-1 lg:col-span-8">
          {tickData ? (
            <div className="">
              {minuteData ? (
                <ChartContainer
                  initialData={minuteData}
                  companyId={stockCompanyId}
                  tickData={tickData}
                />
              ) : (
                <LoadingAnimation />
              )}
            </div>
          ) : (
            <div className="">
              {minuteData ? (
                <ChartContainer initialData={minuteData} companyId={stockCompanyId} />
              ) : (
                <LoadingAnimation />
              )}
            </div>
          )}
        </div>
        <div className="col-span-1 lg:col-span-2">
          <OrderStatus closePrice={closePrice} realTime={tickData?.stckPrpr} />
        </div>
      </div>
      {tickData ? (
        <div className="my-2">
          <TickChart
            tickData={tickData}
            height={200}
            basePrice={minuteData?.data[0]?.openPrice} // 기준가 (첫번째 데이터의 시가)
          />
        </div>
      ) : (
        <div></div>
      )}
      <div className="grid grid-cols-10 gap-5">
        <div className="col-span-6">
          <StockCostHistory tickData={tickData} DayData={stockDailyData?.result.data} />
        </div>
        <div className="col-span-2">
          <StockInfoDetail />
        </div>
        <div className="col-span-2">
          <SellingPrice stockCompanyInfo={stockCompanyInfo} />
        </div>
      </div>
    </div>
  );
};
