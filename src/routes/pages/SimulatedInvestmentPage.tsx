import Lottie from 'lottie-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useCompanyInfoData, useStockDailyData, useStockMinuteData } from '@/api/stock.api';
import { TickData } from '@/api/types/stock';
import airPlane from '@/assets/lottie/air-plane.json';
import walkMove from '@/assets/lottie/walk-animation.json';
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
  const navigate = useNavigate();
  const { isLogin } = useAuthStore();

  // 상태 관리
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isValidating, setIsValidating] = useState(true); // 초기에는 유효성 검사 중
  const [isValidParam, setIsValidParam] = useState(true);
  const didMountRef = useRef(false);

  const stockCompanyId = Number(companyId); // 숫자로 변환

  // 초기 데이터 설정 및 소켓 연결
  const { data: stockCompanyInfo, isLoading, isError } = useCompanyInfoData(stockCompanyId);
  const { data: minuteData, isSuccess } = useStockMinuteData(stockCompanyId, 100);
  const [closePrice, setClosePrice] = useState<number>(0);
  const [comparePrice, setComparePrice] = useState<number>(0);
  // 초기 데이터 일,주,월(1=일, 2=주, 3=월)
  const { data: stockDailyData } = useStockDailyData(stockCompanyId, 1, 20);

  // 소켓 연결 관련 훅
  const { IsConnected, connectTick, disconnectTick } = useTickConnection();
  const [tickData, setTickData] = useState<TickData | null>(null);

  // companyId 유효성 검사와 초기 리다이렉트 처리 (마운트 시 1회만 실행)
  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;

    // 잘못된 파라미터인 경우 리다이렉트
    if (isNaN(stockCompanyId) || !Number.isInteger(stockCompanyId) || stockCompanyId <= 0) {
      console.error(`[SimulatedInvestmentPage] 유효하지 않은 companyId: ${companyId}`);
      setIsValidParam(false);
      navigate('/error/not-found');
      return;
    }

    // 로그인 체크
    if (!isLogin) {
      toast.error('로그인 후 이용해주세요.');
      setShouldRedirect(true);
      return;
    }

    // 검증 완료
    setIsValidating(false);
  }, [stockCompanyId, companyId, navigate, isLogin]);

  // 회사 정보 로드 후 유효성 검사
  useEffect(() => {
    if (isValidating) return; // 초기 유효성 검사 중에는 무시

    // 회사 정보 로딩 중인 경우 무시
    if (isLoading) return;

    // 회사 정보 로드 후, 오류가 발생한 경우에만 404 페이지로 즉시 리다이렉트
    if (isError) {
      console.error(
        `[SimulatedInvestmentPage] 회사 정보가 존재하지 않음: companyId=${stockCompanyId}`,
      );
      setIsValidParam(false);
      navigate('/error/not-found');
    }
  }, [stockCompanyInfo, isError, isLoading, stockCompanyId, navigate, isValidating]);

  // 정적 데이터 확인 후 소켓 연결 시작
  useEffect(() => {
    if (!isValidParam || isValidating) return; // 유효하지 않거나 검증 중이면 무시

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
  }, [
    isSuccess,
    minuteData,
    connectTick,
    disconnectTick,
    stockDailyData,
    stockCompanyInfo,
    isValidParam,
    isValidating,
  ]);

  // useCallback으로 이벤트 핸들러 메모이제이션
  const handleLoadMore = useCallback(
    async (cursor: string) => {
      // 추가 데이터 로드 로직
      return null;
    },
    [], // 의존성 배열
  );

  // 유효성 검사 중이거나 유효하지 않은 파라미터인 경우 아무것도 렌더링하지 않음
  if (isValidating || !isValidParam) {
    return null;
  }

  // 로그인 페이지로 리다이렉트
  if (shouldRedirect) {
    return <Navigate to="/login" />;
  }

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div>
        <LoadingAnimation />
      </div>
    );
  }

  // 오류 발생 시 표시
  if (isError) {
    return (
      <>
        <Navigate to="/error/not-found" replace />;
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
          {(() => {
            // 현재 한국 시간 확인
            const now = new Date();
            const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
            const hours = koreaTime.getHours();
            const minutes = koreaTime.getMinutes();
            const totalMinutes = hours * 60 + minutes;

            // 거래 시간은 09:00 ~ 15:10 (540분 ~ 910분)
            const isMarketHours = totalMinutes >= 540 && totalMinutes <= 910;

            if (isMarketHours) {
              // 거래 시간인 경우
              return (
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
                      animationData={airPlane}
                      loop={true}
                      autoplay={true}
                      style={{ height: 150, width: 150 }}
                      rendererSettings={{
                        preserveAspectRatio: 'xMidYMid slice',
                      }}
                    />
                    <div>
                      <p className="text-[18px] text-border-color">
                        현재 <span className="font-bold text-btn-blue-color">틱정보</span>를
                        연결중입니다.
                      </p>
                    </div>
                  </div>
                </div>
              );
            } else {
              // 거래 시간이 아닌 경우
              return (
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
                        현재 <span className="font-bold text-btn-blue-color">거래시간</span>이
                        아닙니다.
                      </p>
                      <p className="text-[12px] text-border-color">
                        거래는 한국시간 기준{' '}
                        <span className="font-bold text-white"> 09:00 ~ 15:10</span> 입니다.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
        </div>
      )}
      <div className="grid grid-cols-10 gap-2">
        <div className="col-span-5">
          <StockCostHistory
            tickData={tickData}
            DayData={stockDailyData?.result.data}
            closePrice={closePrice}
            comparePrice={comparePrice}
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
