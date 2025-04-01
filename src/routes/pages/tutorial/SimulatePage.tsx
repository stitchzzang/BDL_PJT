import { useCallback, useEffect, useState } from 'react';
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
import ChartComponent from '@/components/ui/chart-tutorial';

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

  // 튜토리얼 주식 데이터 상태
  const [stockData, setStockData] = useState<TutorialStockResponse | null>(null);

  // 거래 내역 상태
  const [trades, setTrades] = useState<TradeRecord[]>([]);

  // 현재 가격 상태
  const [latestPrice, setLatestPrice] = useState(50000);

  // 현재 뉴스 상태
  const [currentNews, setCurrentNews] = useState<NewsResponseWithThumbnail | null>(null);

  // API 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  // 차트 로딩 상태 별도 관리
  const [isChartLoading, setIsChartLoading] = useState(false);

  // 과거 뉴스 목록 상태
  const [pastNewsList, setPastNewsList] = useState<NewsResponse[]>([]);

  // 뉴스 코멘트 상태
  const [newsComment, setNewsComment] = useState('');

  // 전체 차트 데이터 상태 (1년 전 시점부터 현재까지)
  const [fullChartData, setFullChartData] = useState<TutorialStockResponse | null>(null);

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

  // 날짜 상태 추가
  const [tutorialDateRange, setTutorialDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  // API 훅 설정
  const { data: top3PointsResponse, isLoading: isTop3PointsLoading } = useGetTop3Points(companyId);
  const { data: startPointIdResponse } = useGetStartPointId(companyId);
  const { data: endPointIdResponse } = useGetEndPointId(companyId); // 최근 일봉 ID 가져오기

  // 세션별 주식 데이터 가져오기를 위한 커스텀 훅
  const {
    refetch: fetchSessionData,
    isLoading: isSessionDataLoading,
    data: sessionDataResponse,
  } = useGetTutorialStockData(
    companyId,
    currentSession.startStockCandleId && currentSession.endStockCandleId
      ? Math.min(currentSession.startStockCandleId, currentSession.endStockCandleId)
      : currentSession.startStockCandleId || 0,
    currentSession.startStockCandleId && currentSession.endStockCandleId
      ? Math.max(currentSession.startStockCandleId, currentSession.endStockCandleId)
      : currentSession.endStockCandleId || 0,
  );

  // 전체 차트 데이터 가져오기 (1년 전 시작점부터 최근 일봉까지)
  const {
    refetch: fetchFullChartData,
    isLoading: isFullChartDataLoading,
    data: fullChartDataResponse,
  } = useGetTutorialStockData(
    companyId,
    startPointIdResponse?.result && endPointIdResponse?.result
      ? Math.min(startPointIdResponse.result, endPointIdResponse.result)
      : startPointIdResponse?.result || 0,
    startPointIdResponse?.result && endPointIdResponse?.result
      ? Math.max(startPointIdResponse.result, endPointIdResponse.result)
      : endPointIdResponse?.result || 0,
  );

  const getCurrentNews = useGetCurrentNews();
  const getPastNews = useGetPastNews();
  const getNewsComment = useGetNewsComment();
  const processUserAction = useProcessUserAction();
  const { data: tutorialFeedbackResponse, refetch: refetchFeedback } = useGetTutorialFeedback(
    memberId,
    {
      enabled: !!memberId && progress === 100,
    },
  );
  const saveTutorialResult = useSaveTutorialResult();
  const deleteTutorialSession = useDeleteTutorialSession();
  const initSession = useInitSession();

  // 데이터 추출
  const top3Points = top3PointsResponse?.result?.PointResponseList;
  const startPointId = startPointIdResponse?.result;
  const endPointId = endPointIdResponse?.result;
  const tutorialFeedback = tutorialFeedbackResponse?.result;

  // 전체 로딩 상태 관리
  useEffect(() => {
    setIsLoading(isTop3PointsLoading || isSessionDataLoading || isFullChartDataLoading);
  }, [isTop3PointsLoading, isSessionDataLoading, isFullChartDataLoading]);

  // 전체 차트 데이터 로드 (1년 전 시작점부터 최근 일봉까지)
  useEffect(() => {
    if (companyId && startPointIdResponse?.result && endPointIdResponse?.result) {
      const startPointId = startPointIdResponse.result;
      const endPointId = endPointIdResponse.result;

      setIsChartLoading(true);
      console.log('전체 차트 데이터 로드 시작:', {
        companyId,
        startPointId,
        endPointId,
        startIdSmaller: startPointId < endPointId ? '참' : '거짓',
      });

      // 1년 전 날짜와 현재 날짜 계산
      const currentDate = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

      // YYYY-MM-DD 형식
      const formattedStartDate = oneYearAgo.toISOString().split('T')[0];
      const formattedEndDate = currentDate.toISOString().split('T')[0];

      // 날짜 상태 업데이트
      setTutorialDateRange({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      console.log('기간 설정:', {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      // 시작점과 종료점 ID 확인
      if (startPointId <= 0 || endPointId <= 0) {
        console.error('유효하지 않은 시작점 또는 종료점 ID:', { startPointId, endPointId });
        setIsChartLoading(false);
        return;
      }

      // API 요청을 위한 실제 시작점과 종료점 설정
      const actualStartId = Math.min(startPointId, endPointId);
      const actualEndId = Math.max(startPointId, endPointId);

      console.log('API 요청을 위한 ID 설정:', { actualStartId, actualEndId });

      fetchFullChartData()
        .then((response) => {
          if (response.data?.result) {
            const result = response.data.result;
            console.log('전체 차트 데이터 응답 받음:', {
              dataLength: result.data?.length || 0,
              firstDate:
                result.data && result.data.length > 0 ? result.data[0].tradingDate : '없음',
              lastDate:
                result.data && result.data.length > 0
                  ? result.data[result.data.length - 1].tradingDate
                  : '없음',
            });

            // 일봉 데이터만 필터링 (periodType이 1인 데이터)
            const dayCandles = result.data.filter((candle) => candle.periodType === 1);
            console.log('일봉 데이터 필터링 결과:', {
              총데이터: result.data.length,
              일봉데이터: dayCandles.length,
            });

            if (dayCandles.length > 0) {
              setFullChartData(result);
              // 초기 차트 데이터로 전체 차트 데이터 설정
              setStockData(result);

              // 날짜순으로 정렬
              const sortedDayCandles = [...dayCandles].sort((a, b) => {
                return new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime();
              });

              // 처음과 마지막 날짜 확인
              console.log('정렬된 일봉 데이터:', {
                첫날짜: sortedDayCandles[0].tradingDate,
                마지막날짜: sortedDayCandles[sortedDayCandles.length - 1].tradingDate,
                개수: sortedDayCandles.length,
              });

              const lastCandle = sortedDayCandles[sortedDayCandles.length - 1];
              setLatestPrice(lastCandle.closePrice);
            } else {
              console.warn('일봉 데이터가 없습니다!');
            }
          } else {
            console.error('전체 차트 데이터 응답이 비어있습니다.');
          }
        })
        .catch((error) => {
          console.error('전체 차트 데이터 로드 실패:', error);
        })
        .finally(() => {
          setIsChartLoading(false);
        });
    }
  }, [companyId, startPointIdResponse, endPointIdResponse, fetchFullChartData]);

  // API 응답으로부터 직접 stock data 업데이트
  useEffect(() => {
    if (sessionDataResponse?.result) {
      // 세션별 데이터가 있을 경우에만 상태 업데이트
      // 주의: 전체 차트 데이터를 덮어쓰지 않도록 함
      if (
        currentSession.startStockCandleId !== startPointId ||
        currentSession.endStockCandleId !== endPointId
      ) {
        setStockData(sessionDataResponse.result);
        console.log('세션별 주식 데이터 갱신됨:', sessionDataResponse.result);
      }

      if (sessionDataResponse.result.data.length > 0) {
        // 일봉 데이터만 필터링 (periodType이 1인 데이터)
        const dayCandles = sessionDataResponse.result.data.filter(
          (candle: StockCandle) => candle.periodType === 1,
        );

        if (dayCandles.length > 0) {
          const lastCandle = dayCandles[dayCandles.length - 1];
          setLatestPrice(lastCandle.closePrice);
          console.log('API 응답에서 최신 일봉 가격 업데이트:', lastCandle.closePrice);
        }
      }
    }
  }, [
    sessionDataResponse,
    currentSession.startStockCandleId,
    currentSession.endStockCandleId,
    startPointId,
    endPointId,
  ]);

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

    // 전체 차트 데이터가 이미 로드되어 있다면 차트 로딩 상태를 건너뜀
    if (!fullChartData) {
      setIsChartLoading(true);
    }

    console.log('세션 변경 감지, 데이터 로드 시작');

    // 시작점과 종료점 ID 비교하여 올바른 순서로 설정
    let actualStartId = currentSession.startStockCandleId;
    let actualEndId = currentSession.endStockCandleId;

    if (currentSession.startStockCandleId > currentSession.endStockCandleId) {
      actualStartId = Math.min(currentSession.startStockCandleId, currentSession.endStockCandleId);
      actualEndId = Math.max(currentSession.startStockCandleId, currentSession.endStockCandleId);

      console.log('세션 - 시작점이 종료점보다 큽니다. ID를 교체합니다.', {
        originalStart: currentSession.startStockCandleId,
        originalEnd: currentSession.endStockCandleId,
        swappedStart: actualStartId,
        swappedEnd: actualEndId,
      });
    }

    // 과거 뉴스 목록 가져오기 (변곡점 뉴스)
    getPastNews.mutate(
      {
        companyId,
        startStockCandleId: actualStartId,
        endStockCandleId: actualEndId,
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
        startStockCandleId: actualStartId,
        endStockCandleId: actualEndId,
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

    // 전체 차트 데이터가 없는 경우에만 세션별 데이터 로드
    if (!fullChartData) {
      // 세션별 데이터 로드 - ID는 이미 훅에서 최소/최대로 처리됨
      fetchSessionData()
        .then((response) => {
          console.log('fetchSessionData 응답:', response);

          if (response.data?.result) {
            setStockData(response.data.result);
          }
        })
        .catch((error) => {
          console.error('튜토리얼 일봉 데이터 로드 실패:', error);
          setStockData(null);
        })
        .finally(() => {
          setIsChartLoading(false);
        });
    } else {
      // 전체 차트 데이터가 있다면 로딩 상태 종료
      setIsChartLoading(false);
    }
  }, [
    companyId,
    currentSession.currentPointIndex,
    currentSession.endStockCandleId,
    currentSession.startStockCandleId,
    fetchSessionData,
    getCurrentNews,
    getNewsComment,
    getPastNews,
    isTutorialStarted,
    memberId,
    top3Points,
    fullChartData,
  ]);

  // 튜토리얼 완료 처리 함수 (useCallback으로 감싸기)
  const completeTutorial = useCallback(async () => {
    if (!memberId) return; // memberId 확인

    try {
      // 현재 날짜와 1년 전 날짜 계산
      const currentDate = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

      await saveTutorialResult.mutateAsync({
        companyId,
        startMoney: 10000000,
        endMoney: assetInfo.currentTotalAsset,
        changeRate: assetInfo.totalReturnRate,
        startDate: oneYearAgo.toISOString(), // 1년 전 날짜
        endDate: currentDate.toISOString(), // 현재 날짜
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
  }, [isTutorialStarted, startPointId, top3Points, companyId]);

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

    // 전체 차트 데이터가 없으면 재로드 시도
    if (!fullChartData && startPointId && endPointId) {
      setIsChartLoading(true); // 로딩 상태 설정
      console.log('튜토리얼 시작 전 전체 차트 데이터 로드 시작');

      // ID는 이미 훅에서 최소/최대로 처리됨
      fetchFullChartData()
        .then((response) => {
          if (response.data?.result) {
            const result = response.data.result;
            setFullChartData(result);
            setStockData(result);
            console.log('튜토리얼 시작 전 전체 차트 데이터 로드 완료');

            // 최신 가격 설정
            if (result.data && result.data.length > 0) {
              const dayCandles = result.data.filter(
                (candle: StockCandle) => candle.periodType === 1,
              );
              if (dayCandles.length > 0) {
                const lastCandle = dayCandles[dayCandles.length - 1];
                setLatestPrice(lastCandle.closePrice);
              }
            }
          }
        })
        .catch((error) => {
          console.error('튜토리얼 시작 전 전체 차트 데이터 로드 실패:', error);
        })
        .finally(() => {
          setIsChartLoading(false);
        });
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

  // 최신 가격 가져오기
  useEffect(() => {
    // stockData에서 마지막 캔들의 종가를 가져와 최신 가격으로 설정
    if (stockData?.data && stockData.data.length > 0) {
      // 일봉 데이터만 필터링 (periodType이 1인 데이터)
      const filteredData = stockData.data.filter((item) => item.periodType === 1);
      console.log('stockData 변경 감지, 필터링된 일봉 데이터:', filteredData.length);

      if (filteredData.length > 0) {
        const lastCandle = filteredData[filteredData.length - 1];
        setLatestPrice(lastCandle.closePrice);
        console.log('차트 데이터에서 최신 가격 업데이트:', lastCandle.closePrice);
      }
    }
  }, [stockData]);

  return (
    <div className="flex h-full w-full flex-col">
      <div>
        <StockTutorialInfo
          companyId={companyId}
          isTutorialStarted={isTutorialStarted}
          onTutorialStart={handleTutorialStart}
          dateRange={tutorialDateRange}
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
              <p>{tutorialDateRange.startDate || '2024-03-21'}</p>
              <span className="font-bold text-border-color"> - </span>
              <p>{tutorialDateRange.endDate || '2024-11-21'}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-10 gap-3">
        <div className="col-span-8">
          {isChartLoading ? (
            <div className="flex h-[600px] flex-col items-center justify-center rounded-2xl bg-[#0D192B] text-white">
              <div className="text-center">
                <p className="mb-3 text-xl">차트 데이터를 불러오는 중입니다...</p>
                <p className="text-sm text-gray-400">
                  1년치 일봉 데이터를 로드하고 있습니다. 잠시만 기다려주세요.
                </p>
              </div>
            </div>
          ) : (
            <ChartComponent periodData={stockData || fullChartData || undefined} height={600} />
          )}
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
