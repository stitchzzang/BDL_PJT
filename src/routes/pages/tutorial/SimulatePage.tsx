import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useDeleteSession,
  useGetCurrentNews,
  useGetEndPointId,
  useGetNewsComment,
  useGetPastNews,
  useGetStartPointId,
  useGetTop3Points,
  useGetTutorialCandles,
  useGetTutorialFeedback,
  usePostAction,
  useSaveTutorialResult,
} from '@/api/tutorial.api';
import {
  AssetResponse,
  NewsResponse,
  TradeRecord,
  TutorialCandleResponse,
} from '@/api/types/tutorial';
import { DayHistory } from '@/components/stock-tutorial/day-history';
import { StockProgress } from '@/components/stock-tutorial/stock-progress';
import { StockTutorialComment } from '@/components/stock-tutorial/stock-tutorial-comment';
import { StockTutorialConclusion } from '@/components/stock-tutorial/stock-tutorial-conclusion';
import { StockTutorialInfo } from '@/components/stock-tutorial/stock-tutorial-info';
import { StockTutorialMoneyInfo } from '@/components/stock-tutorial/stock-tutorial-money-info';
import { StockTutorialNews } from '@/components/stock-tutorial/stock-tutorial-news';
import { TutorialOrderStatus } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ChartComponent from '@/components/ui/chart';
import { CandleResponse, MinuteCandleData, PeriodCandleData } from '@/mocks/dummy-data';

interface TutorialEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  changeRate: number;
  onConfirmResultClick: () => void;
  onEndTutorialClick: () => void;
}

const TutorialEndModal = ({
  isOpen,
  onClose,
  changeRate,
  onConfirmResultClick,
  onEndTutorialClick,
}: TutorialEndModalProps) => {
  const isPositive = changeRate >= 0;
  const rateColor = isPositive ? 'text-[#E5404A]' : 'text-blue-500';
  const formattedRate = `${isPositive ? '+' : ''}${changeRate.toFixed(1)}%`;

  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-[450px] rounded-lg border-none bg-[#121729] p-6 text-white">
        <div className="mb-4 rounded-md bg-[#101017] p-4 text-center">
          <span className={`text-3xl font-bold ${rateColor}`}>{formattedRate}</span>
        </div>
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-xl font-semibold">
            주식 튜토리얼이 종료되었습니다.
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm text-gray-400">
            주식 튜토리얼 결과는 마이페이지에서 전체 확인이 가능합니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex justify-between sm:justify-between">
          <AlertDialogCancel
            onClick={onConfirmResultClick}
            className="mr-2 flex-1 border-none bg-[#333342] text-white hover:bg-[#444452]"
          >
            결과 확인하기
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onEndTutorialClick}
            className="ml-2 flex-1 border-none bg-[#4A90E2] text-white hover:bg-[#5AA0F2]"
          >
            튜토리얼 종료하기
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const SimulatePage = () => {
  const navigate = useNavigate();
  const h3Style = 'text-[20px] font-bold';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finalChangeRate, setFinalChangeRate] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTutorialStarted, setIsTutorialStarted] = useState(false);
  const companyId = 1; // 현재는 고정값으로 설정. 필요시 URL 파라미터 등으로 변경 가능

  // TODO: 실제 memberId를 가져오는 로직 필요. 현재는 임시값 사용.
  const memberId = 1; // authData.userData?.id || 1; <- userData에 id가 없으므로 임시로 1 사용

  // 자산 정보 상태
  const [assetInfo, setAssetInfo] = useState<AssetResponse>({
    tradingDate: '',
    availableOrderAsset: 10000000, // 초기 자산 1000만원
    currentTotalAsset: 10000000,
    totalReturnRate: 0,
  });

  // 차트 데이터 상태 초기화 시 명확한 타입 지정
  const initialChartData: {
    minuteData: CandleResponse<MinuteCandleData>;
    periodData: CandleResponse<PeriodCandleData>;
  } = {
    minuteData: {
      companyId: '',
      limit: 0,
      cursor: '',
      data: [],
    },
    periodData: {
      companyId: '',
      limit: 0,
      cursor: '',
      data: [],
    },
  };
  const [chartData, setChartData] = useState(initialChartData);

  // 거래 내역 상태
  const [trades, setTrades] = useState<TradeRecord[]>([]);

  // 현재 가격 상태
  const [latestPrice, setLatestPrice] = useState(50000);

  // 현재 뉴스 상태
  const [currentNews, setCurrentNews] = useState<any>(null);

  // 과거 뉴스 목록 상태
  const [pastNewsList, setPastNewsList] = useState<NewsResponse[]>([]);

  // 뉴스 코멘트 상태
  const [newsComment, setNewsComment] = useState('');

  // 현재 세션 상태
  const [currentSession, setCurrentSession] = useState<{
    startStockCandleId: number;
    endStockCandleId: number;
    currentPointIndex: number;
  }>({
    startStockCandleId: 0,
    endStockCandleId: 0,
    currentPointIndex: 0,
  });

  // API 훅 설정
  const { data: top3Points } = useGetTop3Points(companyId);
  const { data: startPointId } = useGetStartPointId();
  const { data: endPointId } = useGetEndPointId();
  const getTutorialCandles = useGetTutorialCandles();
  const getCurrentNews = useGetCurrentNews();
  const getPastNews = useGetPastNews();
  const getNewsComment = useGetNewsComment();
  const postAction = usePostAction();
  // useGetTutorialFeedback 수정: memberId만 전달, enabled 옵션은 useQuery 내부에서 처리 가정
  const { data: tutorialFeedbackData, refetch: refetchFeedback } = useGetTutorialFeedback(memberId);
  const saveTutorialResult = useSaveTutorialResult();
  const deleteSession = useDeleteSession();

  // 튜토리얼 완료 처리 함수 (useCallback으로 감싸기)
  const completeTutorial = useCallback(async () => {
    if (!memberId) return; // memberId 확인

    try {
      await saveTutorialResult.mutateAsync({
        companyId,
        startMoney: 10000000,
        endMoney: assetInfo.currentTotalAsset,
        changeRate: assetInfo.totalReturnRate,
        startDate: new Date().toISOString(), // TODO: 실제 시작 날짜 필요
        endDate: new Date().toISOString(), // TODO: 실제 종료 날짜 필요
        memberId: memberId,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('튜토리얼 결과 저장 실패:', error);
    }
  }, [memberId, companyId, assetInfo, saveTutorialResult]); // 의존성 배열 추가

  // 튜토리얼 세션 종료 시 세션 삭제
  useEffect(() => {
    return () => {
      if (isTutorialStarted && memberId) {
        deleteSession.mutate(memberId);
      }
    };
  }, [isTutorialStarted, deleteSession, memberId]);

  // 튜토리얼 시작 시 초기 데이터 설정
  useEffect(() => {
    if (
      isTutorialStarted &&
      startPointId &&
      top3Points?.PointResponseList &&
      top3Points.PointResponseList.length > 0
    ) {
      const firstPoint = top3Points.PointResponseList[0];
      setCurrentSession({
        startStockCandleId: startPointId,
        endStockCandleId: firstPoint.stockCandleId,
        currentPointIndex: 0,
      });
    }
  }, [isTutorialStarted, startPointId, top3Points]);

  // API 응답을 Chart 컴포넌트 형식으로 변환하는 함수
  const convertToPeriodData = (
    result: TutorialCandleResponse,
  ): CandleResponse<PeriodCandleData> => {
    // API에서 받은 데이터를 Chart 컴포넌트가 사용하는 형식으로 변환
    const periodCandleData: PeriodCandleData[] = result.data.map((candle) => ({
      stockCandleId: String(candle.stockCandleId),
      companyId: String(candle.companyId),
      openPrice: candle.openPrice,
      openPricePercent: candle.openPricePercent,
      highPrice: candle.highPrice,
      highPricePercent: candle.highPricePercent,
      lowPrice: candle.lowPrice,
      lowPricePercent: candle.lowPricePercent,
      closePrice: candle.closePrice,
      closePricePercent: candle.closePricePercent,
      accumulatedVolume: candle.accumulatedVolume,
      accumulatedTradeAmount: candle.accumulatedTradeAmount,
      tradingDate: candle.tradingDate,
      periodType: String(candle.periodType) as '1' | '2' | '3',
      fiveAverage: candle.fiveAverage,
      twentyAverage: candle.twentyAverage,
    }));

    return {
      companyId: String(result.companyId),
      limit: result.limit,
      cursor: result.cursor,
      data: periodCandleData,
    };
  };

  // 세션 변경 시 데이터 로드
  useEffect(() => {
    if (!memberId) return;

    if (
      !isTutorialStarted ||
      currentSession.startStockCandleId === 0 ||
      currentSession.endStockCandleId === 0
    ) {
      return;
    }

    const { startStockCandleId, endStockCandleId } = currentSession;

    // 튜토리얼 일봉 데이터 가져오기
    getTutorialCandles.mutate(
      { companyId, startStockCandleId, endStockCandleId },
      {
        onSuccess: (result: TutorialCandleResponse) => {
          // 결과 데이터를 Chart 컴포넌트 형식으로 변환
          const newPeriodData = convertToPeriodData(result);

          setChartData((prev) => ({ ...prev, periodData: newPeriodData }));

          // 최신 가격 설정
          if (result.data.length > 0) {
            const lastCandle = result.data[result.data.length - 1];
            setLatestPrice(lastCandle.closePrice);
          }
        },
      },
    );

    // 과거 뉴스 목록 가져오기
    getPastNews.mutate(
      { companyId, startStockCandleId, endStockCandleId },
      {
        onSuccess: (result) => {
          setPastNewsList(result);
        },
      },
    );

    // 뉴스 코멘트 가져오기
    getNewsComment.mutate(
      { companyId, startStockCandleId, endStockCandleId },
      {
        onSuccess: (result) => {
          setNewsComment(result);
        },
      },
    );

    // 현재 세션의 변곡점 ID로 현재 뉴스 가져오기
    if (currentSession.currentPointIndex < 3) {
      const pointStockCandleId =
        top3Points?.PointResponseList[currentSession.currentPointIndex]?.stockCandleId;

      if (pointStockCandleId) {
        getCurrentNews.mutate(
          { companyId, stockCandleId: pointStockCandleId },
          {
            onSuccess: (result) => {
              setCurrentNews(result);
            },
          },
        );
      }
    }
  }, [
    currentSession,
    isTutorialStarted,
    companyId,
    getTutorialCandles,
    getPastNews,
    getNewsComment,
    getCurrentNews,
    top3Points,
    memberId,
  ]);

  // 진행 상태에 따른 변곡점 이동 및 튜토리얼 완료 시 피드백 refetch
  useEffect(() => {
    if (!isTutorialStarted || !top3Points?.PointResponseList || !memberId) {
      return;
    }

    if (progress === 33) {
      // 두 번째 변곡점으로 이동
      if (top3Points.PointResponseList.length > 1) {
        const pointsData = top3Points.PointResponseList;
        const secondPoint = pointsData[1];
        const firstPoint = pointsData[0];

        setCurrentSession({
          startStockCandleId: firstPoint.stockCandleId,
          endStockCandleId: secondPoint.stockCandleId,
          currentPointIndex: 1,
        });
      }
    } else if (progress === 66) {
      // 세 번째 변곡점으로 이동
      if (top3Points.PointResponseList.length > 2) {
        const pointsData = top3Points.PointResponseList;
        const thirdPoint = pointsData[2];
        const secondPoint = pointsData[1];

        setCurrentSession({
          startStockCandleId: secondPoint.stockCandleId,
          endStockCandleId: thirdPoint.stockCandleId,
          currentPointIndex: 2,
        });
      }
    } else if (progress === 100) {
      if (refetchFeedback) {
        refetchFeedback();
      }
      completeTutorial();
    }
  }, [progress, isTutorialStarted, top3Points, memberId, refetchFeedback, completeTutorial]);

  // 튜토리얼 시작 핸들러
  const handleTutorialStart = () => {
    if (!memberId) {
      alert('사용자 정보를 가져올 수 없습니다.');
      return;
    }

    // StockTutorialInfo 컴포넌트 내부에서 API 호출이 이루어짐
    setIsTutorialStarted(true);
    setProgress(10);
  };

  // 사용자 거래 처리 핸들러
  const handleTrade = (action: 'buy' | 'sell', price: number, quantity: number) => {
    if (!isTutorialStarted || currentSession.startStockCandleId === 0 || !memberId) {
      return;
    }

    postAction.mutate(
      {
        memberId: memberId, // 실제 memberId 사용
        data: {
          action,
          price,
          quantity,
          companyId,
          startStockCandleId: currentSession.startStockCandleId,
          endStockCandleId: currentSession.endStockCandleId,
        },
      },
      {
        onSuccess: (assetResults) => {
          // 거래 기록 추가
          if (price > 0 && quantity > 0) {
            // 관망이 아닌 경우에만 거래 기록 추가
            const newTrade: TradeRecord = {
              action,
              price,
              quantity,
              timestamp: new Date(),
              stockCandleId: currentSession.endStockCandleId,
            };
            setTrades((prev) => [...prev, newTrade]);
          }

          // 마지막 자산 정보 업데이트
          if (assetResults.length > 0) {
            const lastAsset = assetResults[assetResults.length - 1];
            setAssetInfo(lastAsset);

            // 총 수익률 업데이트
            setFinalChangeRate(lastAsset.totalReturnRate);
          }

          // 현재 세션에 따라 진행률 업데이트
          if (currentSession.currentPointIndex === 0) {
            setProgress(33);
          } else if (currentSession.currentPointIndex === 1) {
            setProgress(66);
          } else if (currentSession.currentPointIndex === 2) {
            setProgress(100);
          }
        },
      },
    );
  };

  // 결과 확인 페이지로 이동
  const handleNavigateToResult = () => {
    navigate('/member/stock-tutorial-result');
    setIsModalOpen(false);
  };

  // 튜토리얼 선택 페이지로 이동
  const handleNavigateToSelect = () => {
    navigate('/tutorial/select');
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div>
        <StockTutorialInfo
          companyId={companyId}
          isTutorialStarted={isTutorialStarted}
          onTutorialStart={handleTutorialStart}
        />
        <div className="my-[25px]">
          <StockProgress onProgressChange={setProgress} />
        </div>
        <div className="mb-[25px] flex justify-between">
          <StockTutorialMoneyInfo
            initialAsset={10000000}
            availableOrderAsset={assetInfo.availableOrderAsset}
            currentTotalAsset={assetInfo.currentTotalAsset}
            totalReturnRate={assetInfo.totalReturnRate}
          />
          <div className="flex items-center gap-2">
            <p className="text-border-color">진행 기간 : </p>
            <div className="flex gap-3 rounded-xl bg-modal-background-color px-[20px] py-[15px]">
              <p>2024-03-21</p> {/* TODO: 실제 시작/종료 날짜 반영 */}
              <span className="font-bold text-border-color"> - </span>
              <p>2024-11-21</p> {/* TODO: 실제 시작/종료 날짜 반영 */}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-10 gap-3">
        <div className="col-span-8">
          <ChartComponent
            minuteData={chartData.minuteData}
            periodData={chartData.periodData}
            height={600}
          />
        </div>
        <div className="col-span-2">
          <TutorialOrderStatus
            onTrade={handleTrade}
            isSessionActive={isTutorialStarted && progress < 100}
            companyId={companyId}
            latestPrice={latestPrice}
          />
        </div>
      </div>
      <div>
        <div className="my-[30px]">
          <h3 className={`${h3Style} mb-[15px]`}>일간 히스토리</h3>
          <DayHistory news={pastNewsList} />
        </div>
      </div>
      <div>
        <StockTutorialComment comment={newsComment} />
      </div>
      <div className="mt-[25px] grid grid-cols-6 gap-3 ">
        <div className="col-span-5">
          <StockTutorialNews currentNews={currentNews} companyId={companyId} />
        </div>
        <div className="col-span-1">
          <StockTutorialConclusion
            trades={trades}
            feedback={tutorialFeedbackData || ''} // useGetTutorialFeedback에서 받아온 데이터 사용
            isCompleted={progress === 100}
          />
        </div>
      </div>
      <TutorialEndModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        changeRate={finalChangeRate}
        onConfirmResultClick={handleNavigateToResult}
        onEndTutorialClick={handleNavigateToSelect}
      />
    </div>
  );
};
