import Lottie from 'lottie-react';
import { useCallback, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useCompanyInfoData, useStockDailyData, useStockMinuteData } from '@/api/stock.api';
import { TickData } from '@/api/types/stock';
import walkMove from '@/assets/lottie/walk-animation.json';
import { ErrorScreen } from '@/components/common/error-screen';
import { LoadingAnimation } from '@/components/common/loading-animation';
import { OrderStatus } from '@/components/mock-investment/order-status/order-status';
import { SellingPrice } from '@/components/mock-investment/selling-price/selling-price';
import { StockCostHistory } from '@/components/mock-investment/stock-cost-history/stock-cost-history';
import { StockInfo } from '@/components/mock-investment/stock-info/stock-info';
import { StockInfoDetail } from '@/components/mock-investment/stock-info-detail/stock-info-detail';
import { ChartContainer } from '@/components/ui/chart-container';
import { SparklesCore } from '@/components/ui/sparkles';
import { TickChart } from '@/components/ui/tick-chart';
import { useTickConnection } from '@/services/SocketStockTickDataService';
import { useAuthStore } from '@/store/useAuthStore';

export const SimulatedInvestmentPage = () => {
  const { companyId } = useParams(); // companyId 주소 파라미터에서 가져오기
  const stockCompanyId = Number(companyId); // 숫자로 변환
  const { isLogin } = useAuthStore();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!isLogin) {
      toast.error('로그인 후 이용해주세요.');
      setShouldRedirect(true);
    }
  }, [isLogin]);
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
  if (shouldRedirect) {
    return <Navigate to="/login" />;
  }

  if (isLoading) {
    return (
      <div>
        <LoadingAnimation />
      </div>
    );
  }
  if (isError || comparePrice === 0) {
    return (
      <>
        {comparePrice === 0 ? (
          <div className="flex flex-col items-center justify-center">
            <ErrorScreen />
            <p className="font-light text-border-color">
              (현재{' '}
              <span className="font-bold text-btn-blue-color">{stockCompanyInfo?.companyName}</span>{' '}
              종목에 오류가 발생했습니다.)
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <ErrorScreen />
            <p className="font-light text-border-color">(현재 잘못된 종목 페이지입니다.)</p>
          </div>
        )}
      </>
    );
  }
  return (
    <div className="flex h-full w-full flex-col px-6">
      <div className="mb-6">
        <StockInfo
          stockCompanyInfo={stockCompanyInfo}
          tickData={tickData}
          closePrice={closePrice}
          comparePrice={comparePrice}
          companyId={stockCompanyId}
        />
      </div>
      <div className="grid grid-cols-1 gap-1 lg:grid-cols-12">
        <div className="col-span-1 lg:col-span-9">
          {tickData ? (
            <>
              {minuteData ? (
                <ChartContainer
                  initialData={minuteData}
                  companyId={stockCompanyId}
                  tickData={tickData}
                />
              ) : (
                <LoadingAnimation />
              )}
            </>
          ) : (
            <>
              {minuteData ? (
                <ChartContainer initialData={minuteData} companyId={stockCompanyId} />
              ) : (
                <LoadingAnimation />
              )}
            </>
          )}
        </div>
        <div className="col-span-1 lg:col-span-3">
          <OrderStatus
            closePrice={closePrice}
            realTime={tickData?.stckPrpr}
            companyId={stockCompanyId}
          />
        </div>
      </div>
      {tickData ? (
        <div className="my-1">
          <TickChart
            tickData={tickData}
            height={120}
            basePrice={tickData.stckOprc} // 기준가 (첫번째 데이터의 시가)
          />
        </div>
      ) : (
        <div className="my-1">
          <div className="relative h-full overflow-hidden rounded-2xl border border-border-color border-opacity-20 p-[20px]">
            <div className="absolute inset-0 h-full w-full">
              <SparklesCore
                id="sparkles"
                background="transparent"
                minSize={0.6}
                maxSize={1.4}
                particleColor="#ffffff"
                particleDensity={70}
                className="h-full w-full"
              />
            </div>
            <div className="flex items-center justify-center gap-4">
              <Lottie
                animationData={walkMove}
                loop={true}
                autoplay={true}
                style={{ height: 150, width: 150 }}
                rendererSettings={{
                  preserveAspectRatio: 'xMidYMid slice',
                }}
              />
              <div>
                <p className="text-[18px] text-border-color">
                  현재 <span className="font-bold text-btn-blue-color">거래시간</span>이 아닙니다.
                </p>
                <p className="text-[12px] text-border-color">
                  거래는 한국시간 기준 <span className="font-bold text-white"> 09:00 ~ 15:10</span>{' '}
                  입니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-10 gap-2">
        <div className="col-span-5">
          <StockCostHistory
            tickData={tickData}
            DayData={stockDailyData?.result.data}
            closePrice={closePrice}
          />
        </div>
        <div className="col-span-2">
          <StockInfoDetail companyId={stockCompanyId} />
        </div>
        <div className="col-span-3">
          <SellingPrice stockCompanyInfo={stockCompanyInfo} />
        </div>
      </div>
    </div>
  );
};
