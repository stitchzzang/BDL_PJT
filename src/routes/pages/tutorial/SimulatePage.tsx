import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useDeleteTutorialSession,
  useGetCurrentNews,
  useGetEndPointId,
  useGetNewsComment,
  useGetPastNews,
  useGetStartPointId,
  useGetTop3Points,
  useGetTutorialFeedback,
  useGetTutorialStockData,
  useInitSession,
  useProcessUserAction,
  useSaveTutorialResult,
} from '@/api/tutorial.api';
import {
  AssetResponse,
  NewsResponse,
  NewsResponseWithThumbnail,
  StockCandle,
  TutorialStockResponse,
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
import { CandleResponse, PeriodCandleData } from '@/mocks/dummy-data';

// 거래 기록을 위한 타입 정의
interface TradeRecord {
  action: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: Date;
  stockCandleId: number;
}

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
  const { companyId: companyIdParam } = useParams<{ companyId: string }>();
  const h3Style = 'text-[20px] font-bold';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finalChangeRate, setFinalChangeRate] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTutorialStarted, setIsTutorialStarted] = useState(false);
  const companyId = Number(companyIdParam) || 1; // URL 파라미터에서 companyId를 가져옵니다. 기본값 1

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
  const [chartData, setChartData] = useState({
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
  });

  // 거래 내역 상태
  const [trades, setTrades] = useState<TradeRecord[]>([]);

  // 현재 가격 상태
  const [latestPrice, setLatestPrice] = useState(50000);

  // 현재 뉴스 상태
  const [currentNews, setCurrentNews] = useState<NewsResponseWithThumbnail | null>(null);

  // API 로딩 상태
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);

  // 빈 차트 데이터를 반환하는 함수
  const getEmptyChartData = useCallback(
    () => ({
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
    }),
    [],
  );

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
  const { data: top3PointsResponse } = useGetTop3Points(companyId);
  const { data: startPointIdResponse } = useGetStartPointId();
  const { data: endPointIdResponse } = useGetEndPointId();
  const { refetch: fetchTutorialStockData } = useGetTutorialStockData(
    companyId,
    currentSession.startStockCandleId || 0,
    currentSession.endStockCandleId || 0,
  );

  const getCurrentNews = useGetCurrentNews();
  const getPastNews = useGetPastNews();
  const getNewsComment = useGetNewsComment();
  const processUserAction = useProcessUserAction();
  const { data: tutorialFeedbackResponse, refetch: refetchFeedback } =
    useGetTutorialFeedback(memberId);
  const saveTutorialResult = useSaveTutorialResult();
  const deleteTutorialSession = useDeleteTutorialSession();
  const initSession = useInitSession();

  // 데이터 추출
  const top3Points = top3PointsResponse?.result?.PointResponseList;
  const startPointId = startPointIdResponse?.result;
  const tutorialFeedback = tutorialFeedbackResponse?.result;

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
      setFinalChangeRate(assetInfo.totalReturnRate);
    } catch (error) {
      console.error('튜토리얼 결과 저장 실패:', error);
    }
  }, [
    memberId,
    companyId,
    assetInfo.currentTotalAsset,
    assetInfo.totalReturnRate,
    saveTutorialResult,
  ]); // 의존성 배열 최적화

  // 튜토리얼 세션 종료 시 세션 삭제
  useEffect(() => {
    return () => {
      if (isTutorialStarted && memberId) {
        deleteTutorialSession.mutate(memberId);
      }
    };
  }, [isTutorialStarted, deleteTutorialSession, memberId]);

  // 튜토리얼 시작 시 초기 데이터 설정
  useEffect(() => {
    if (isTutorialStarted && startPointId && top3Points && top3Points.length > 0) {
      // 첫 번째 변곡점으로 세션 설정 (시작 ~ 첫 번째 변곡점)
      const firstPoint = top3Points[0];
      setCurrentSession({
        startStockCandleId: startPointId, // 시작 분봉 ID
        endStockCandleId: firstPoint.stockCandleId, // 첫 번째 변곡점 분봉 ID
        currentPointIndex: 0, // 현재 변곡점 인덱스
      });
    }
  }, [isTutorialStarted, startPointId, top3Points]);

  // API 응답을 Chart 컴포넌트 형식으로 변환하는 함수
  const convertToPeriodData = (result: TutorialStockResponse): CandleResponse<PeriodCandleData> => {
    // API에서 받은 데이터를 Chart 컴포넌트가 사용하는 형식으로 변환
    const periodCandleData: PeriodCandleData[] = result.data.map((candle: StockCandle) => ({
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
      cursor: result.cursor || '',
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

    setIsLoading(true);

    // 튜토리얼 일봉 데이터 가져오기
    const loadTutorialStockData = async () => {
      try {
        const response = await fetchTutorialStockData();

        // 응답에서 data 추출
        const { data } = response;

        if (data?.result) {
          // 결과 데이터를 Chart 컴포넌트 형식으로 변환
          const newPeriodData = convertToPeriodData(data.result);
          // @ts-expect-error: 타입 불일치 (cursor가 string | null 타입)
          setChartData((prev) => ({ ...prev, periodData: newPeriodData }));

          // 최신 가격 설정 (마지막 일봉 캔들의 종가)
          if (data.result.data.length > 0) {
            // 일봉 데이터만 필터링 (periodType이 '1'인 데이터)
            const dayCandles = data.result.data.filter((candle) => candle.periodType === 1);

            if (dayCandles.length > 0) {
              const lastCandle = dayCandles[dayCandles.length - 1];
              setLatestPrice(lastCandle.closePrice);
              console.log('최신 일봉 가격 업데이트:', lastCandle.closePrice);
            } else {
              // 일봉 데이터가 없으면 전체 데이터 중 마지막 캔들 사용
              const lastCandle = data.result.data[data.result.data.length - 1];
              setLatestPrice(lastCandle.closePrice);
              console.log('최신 가격 업데이트 (비일봉):', lastCandle.closePrice);
            }
          } else {
            console.warn('튜토리얼 일봉 데이터가 없습니다.');
          }
        } else {
          console.warn('튜토리얼 일봉 데이터 결과가 없습니다.');
        }
      } catch (error) {
        console.error('튜토리얼 일봉 데이터 로드 실패:', error);

        if (error instanceof Error && error.message.includes('HTML')) {
          console.error('HTML 응답을 받았습니다. 서버가 예상대로 동작하지 않습니다.');

          // 10초 후 재시도
          setTimeout(() => {
            loadTutorialStockData();
          }, 10000);
        }

        // 에러 발생 시 빈 차트 데이터 설정
        setChartData(getEmptyChartData());
      } finally {
        setIsLoading(false);
      }
    };

    // 데이터 로드 함수 호출
    loadTutorialStockData();

    // 과거 뉴스 목록 가져오기 (변곡점 뉴스)
    getPastNews.mutate(
      {
        companyId,
        startStockCandleId: currentSession.startStockCandleId,
        endStockCandleId: currentSession.endStockCandleId,
      },
      {
        onSuccess: (result) => {
          if (result.result && result.result.NewsResponse) {
            setPastNewsList(result.result.NewsResponse);
          }
        },
      },
    );

    // 뉴스 코멘트 가져오기 (변곡점 코멘트)
    getNewsComment.mutate(
      {
        companyId,
        startStockCandleId: currentSession.startStockCandleId,
        endStockCandleId: currentSession.endStockCandleId,
      },
      {
        onSuccess: (result) => {
          if (result.result) {
            setNewsComment(result.result);
          }
        },
      },
    );

    // 현재 세션의 변곡점 ID로 현재 뉴스 가져오기
    if (currentSession.currentPointIndex < 3 && top3Points) {
      const pointStockCandleId = top3Points[currentSession.currentPointIndex]?.stockCandleId;

      if (pointStockCandleId) {
        // 교육용 현재 뉴스 조회
        getCurrentNews.mutate(
          { companyId, stockCandleId: pointStockCandleId },
          {
            onSuccess: (result) => {
              if (result.result) {
                setCurrentNews(result.result);
              }
            },
          },
        );
      }
    }
  }, [
    companyId,
    currentSession.currentPointIndex,
    currentSession.endStockCandleId,
    currentSession.startStockCandleId,
    fetchTutorialStockData,
    getCurrentNews,
    getNewsComment,
    getPastNews,
    isTutorialStarted,
    memberId,
    top3Points,
    getEmptyChartData,
  ]);

  // 진행 상태에 따른 변곡점 이동 및 튜토리얼 완료 시 피드백 refetch
  useEffect(() => {
    if (!isTutorialStarted || !top3Points || !memberId) {
      return;
    }

    if (progress === 33) {
      // 두 번째 변곡점으로 이동 (첫 번째 변곡점 ~ 두 번째 변곡점)
      if (top3Points.length > 1) {
        const pointsData = top3Points;
        const secondPoint = pointsData[1];
        const firstPoint = pointsData[0];

        setCurrentSession({
          startStockCandleId: firstPoint.stockCandleId, // 첫 번째 변곡점 분봉 ID
          endStockCandleId: secondPoint.stockCandleId, // 두 번째 변곡점 분봉 ID
          currentPointIndex: 1, // 두 번째 변곡점 인덱스
        });
      }
    } else if (progress === 66) {
      // 세 번째 변곡점으로 이동 (두 번째 변곡점 ~ 세 번째 변곡점)
      if (top3Points.length > 2) {
        const pointsData = top3Points;
        const thirdPoint = pointsData[2];
        const secondPoint = pointsData[1];

        setCurrentSession({
          startStockCandleId: secondPoint.stockCandleId, // 두 번째 변곡점 분봉 ID
          endStockCandleId: thirdPoint.stockCandleId, // 세 번째 변곡점 분봉 ID
          currentPointIndex: 2, // 세 번째 변곡점 인덱스
        });
      }
    } else if (progress === 100) {
      // 튜토리얼 완료 - 피드백 가져오기 및 결과 저장
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

    // 세션 초기화 API 호출
    initSession.mutate(
      { memberId, companyId },
      {
        onSuccess: () => {
          setIsTutorialStarted(true);
          setProgress(10);
        },
        onError: (error) => {
          console.error('튜토리얼 세션 초기화 실패:', error);
          alert('튜토리얼을 시작할 수 없습니다. 다시 시도해주세요.');
        },
      },
    );
  };

  // 사용자 거래 처리 핸들러
  const handleTrade = useCallback(
    (action: 'buy' | 'sell', price: number, quantity: number) => {
      if (!isTutorialStarted || currentSession.startStockCandleId === 0 || !memberId) {
        return;
      }

      // 사용자 행동에 따른 자산 계산 API 호출
      // action: 'buy' - 구매, 'sell' - 판매
      // price, quantity가 모두 0인 경우는 '관망'으로 처리
      processUserAction.mutate(
        {
          memberId: memberId,
          action,
          price,
          quantity,
          companyId,
          startStockCandleId: currentSession.startStockCandleId,
          endStockCandleId: currentSession.endStockCandleId,
        },
        {
          onSuccess: (response) => {
            const assetResults = response.result?.AssetResponse;

            // 거래 기록 추가 (관망이 아닌 경우에만)
            if (price > 0 && quantity > 0) {
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
            if (assetResults && assetResults.length > 0) {
              const lastAsset = assetResults[assetResults.length - 1];
              setAssetInfo(lastAsset);

              // 총 수익률 업데이트
              setFinalChangeRate(lastAsset.totalReturnRate);
            }

            // 현재 세션에 따라 진행률 업데이트
            if (currentSession.currentPointIndex === 0) {
              setProgress(33); // 첫 번째 변곡점 거래 완료 - 33%
            } else if (currentSession.currentPointIndex === 1) {
              setProgress(66); // 두 번째 변곡점 거래 완료 - 66%
            } else if (currentSession.currentPointIndex === 2) {
              setProgress(100); // 세 번째 변곡점 거래 완료 - 100% (튜토리얼 종료)
            }
          },
        },
      );
    },
    [
      isTutorialStarted,
      currentSession.startStockCandleId,
      currentSession.endStockCandleId,
      currentSession.currentPointIndex,
      memberId,
      companyId,
      processUserAction,
    ],
  );

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

  // 차트 데이터를 useMemo로 래핑
  const memoizedChartData = useMemo(
    () => ({
      minuteData: chartData.minuteData,
      periodData: chartData.periodData,
    }),
    [chartData.minuteData, chartData.periodData],
  );

  // 최신 가격 가져오기
  useEffect(() => {
    // periodData에서 마지막 캔들의 종가를 가져와 최신 가격으로 설정
    if (chartData.periodData?.data && chartData.periodData.data.length > 0) {
      // as any로 타입 캐스팅하여 타입 오류 해결
      const periodData = chartData.periodData.data as any[];
      // 필터링해서 '1' 타입(일봉)의 데이터 중 마지막 데이터 가져오기
      const filteredData = periodData.filter((item) => item.periodType === '1');

      if (filteredData.length > 0) {
        const lastCandle = filteredData[filteredData.length - 1];
        setLatestPrice(lastCandle.closePrice);
        console.log('차트 데이터에서 최신 가격 업데이트:', lastCandle.closePrice);
      }
    }
  }, [chartData.periodData]);

  return (
    <div className="flex h-full w-full flex-col">
      <div>
        <StockTutorialInfo
          companyId={companyId}
          isTutorialStarted={isTutorialStarted}
          onTutorialStart={handleTutorialStart}
        />
        <div className="my-[25px]">
          <StockProgress progress={progress} onProgressChange={setProgress} />
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
            minuteData={memoizedChartData.minuteData}
            periodData={memoizedChartData.periodData}
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
            feedback={tutorialFeedback || ''}
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
