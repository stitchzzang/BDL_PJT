import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useDeleteTutorialSession,
  useGetCurrentNews,
  useGetNewsComment,
  useGetPastNews,
  useGetPointDate,
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

// YYMMDD 형식의 날짜 생성 함수
const formatDateToYYMMDD = (date: Date): string => {
  const yy = date.getFullYear().toString().slice(2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yy}${mm}${dd}`;
};

// YYMMDD 형식의 문자열을 Date 객체로 변환하는 함수
const parseYYMMDDToDate = (dateStr: string): Date => {
  const yy = dateStr.slice(0, 2);
  const mm = dateStr.slice(2, 4);
  const dd = dateStr.slice(4, 6);
  return new Date(`20${yy}-${mm}-${dd}`);
};

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

  // 오늘부터 1년 전까지의 날짜 범위 계산
  const today = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(today.getFullYear() - 1);

  const defaultStartDate = formatDateToYYMMDD(oneYearAgo);
  const defaultEndDate = formatDateToYYMMDD(today);

  // 현재 세션 상태 (날짜 기반으로 변경)
  const [currentSession, setCurrentSession] = useState<{
    startDate: string;
    endDate: string;
    currentPointIndex: number;
  }>({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    currentPointIndex: 0,
  });

  // 날짜 상태 추가
  const [tutorialDateRange, setTutorialDateRange] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });

  // API 훅 설정
  const { data: top3PointsResponse, isLoading: isTop3PointsLoading } = useGetTop3Points(companyId);

  // 변곡점 날짜 조회를 위한 설정
  const pointStockCandleIds =
    top3PointsResponse?.result?.PointResponseList?.map((point) => point.stockCandleId) || [];
  const point1DateQuery = useGetPointDate(pointStockCandleIds[0] || 0);
  const point2DateQuery = useGetPointDate(pointStockCandleIds[1] || 0);
  const point3DateQuery = useGetPointDate(pointStockCandleIds[2] || 0);

  // 세션별 주식 데이터 가져오기를 위한 커스텀 훅
  const {
    refetch: fetchSessionData,
    isLoading: isSessionDataLoading,
    data: sessionDataResponse,
  } = useGetTutorialStockData(companyId, currentSession.startDate, currentSession.endDate);

  // 전체 차트 데이터 가져오기 (1년 전 시작점부터 최근 일봉까지)
  const {
    refetch: fetchFullChartData,
    isLoading: isFullChartDataLoading,
    data: fullChartDataResponse,
  } = useGetTutorialStockData(companyId, defaultStartDate, defaultEndDate);

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
  const tutorialFeedback = tutorialFeedbackResponse?.result;

  // 변곡점 날짜를 배열로 관리
  const [pointDates, setPointDates] = useState<string[]>([]);

  // 변곡점 날짜 추출
  useEffect(() => {
    const dates: string[] = [];

    if (point1DateQuery.data?.result) {
      dates[0] = point1DateQuery.data.result;
    }

    if (point2DateQuery.data?.result) {
      dates[1] = point2DateQuery.data.result;
    }

    if (point3DateQuery.data?.result) {
      dates[2] = point3DateQuery.data.result;
    }

    setPointDates(dates);
  }, [point1DateQuery.data?.result, point2DateQuery.data?.result, point3DateQuery.data?.result]);

  // 전체 로딩 상태 관리
  useEffect(() => {
    setIsLoading(isTop3PointsLoading || isSessionDataLoading || isFullChartDataLoading);
  }, [isTop3PointsLoading, isSessionDataLoading, isFullChartDataLoading]);

  // 전체 차트 데이터 로드 (1년 전부터 현재까지)
  useEffect(() => {
    if (companyId && pointStockCandleIds.length > 0) {
      setIsChartLoading(true);

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

      // 시작점과 종료점 ID는 이미 훅에서 최소/최대로 처리됨
      fetchFullChartData()
        .then((response) => {
          if (response.data?.result) {
            const result = response.data.result;
            setFullChartData(result);
            setStockData(result);

            // 최신 가격 설정
            if (result.data && result.data.length > 0) {
              // 일봉 데이터만 필터링 (periodType이 1인 데이터)
              const dayCandles = result.data.filter(
                (candle: StockCandle) => candle.periodType === 1,
              );

              if (dayCandles.length > 0) {
                // 날짜순으로 정렬
                const sortedDayCandles = [...dayCandles].sort((a, b) => {
                  return new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime();
                });

                const lastCandle = sortedDayCandles[sortedDayCandles.length - 1];
                setLatestPrice(lastCandle.closePrice);
              }
            }
          }
        })
        .catch(() => {
          // 에러 발생 시 처리
        })
        .finally(() => {
          setIsChartLoading(false);
        });
    }
  }, [companyId, pointStockCandleIds, fetchFullChartData]);

  // API 응답으로부터 직접 stock data 업데이트
  useEffect(() => {
    if (sessionDataResponse?.result) {
      // 세션별 데이터가 있을 경우에만 상태 업데이트
      // 주의: 전체 차트 데이터를 덮어쓰지 않도록 함
      if (
        currentSession.startDate !== pointDates[0] ||
        currentSession.endDate !== pointDates[pointDates.length - 1]
      ) {
        setStockData(sessionDataResponse.result);
      }

      if (sessionDataResponse.result.data.length > 0) {
        // 일봉 데이터만 필터링 (periodType이 1인 데이터)
        const dayCandles = sessionDataResponse.result.data.filter(
          (candle: StockCandle) => candle.periodType === 1,
        );

        if (dayCandles.length > 0) {
          const lastCandle = dayCandles[dayCandles.length - 1];
          setLatestPrice(lastCandle.closePrice);
        }
      }
    }
  }, [sessionDataResponse, currentSession.startDate, currentSession.endDate, pointDates]);

  // 세션 변경 시 데이터 로드
  useEffect(() => {
    if (!memberId) return;

    if (!isTutorialStarted || currentSession.startDate === '' || currentSession.endDate === '') {
      return;
    }

    // 전체 차트 데이터가 이미 로드되어 있다면 차트 로딩 상태를 건너뜀
    if (!fullChartData) {
      setIsChartLoading(true);
    }

    // 과거 뉴스 목록 가져오기 (변곡점 뉴스)
    getPastNews.mutate(
      {
        companyId,
        startStockCandleId: pointStockCandleIds[currentSession.currentPointIndex] || 0,
        endStockCandleId: pointStockCandleIds[currentSession.currentPointIndex + 1] || 0,
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
        startStockCandleId: pointStockCandleIds[currentSession.currentPointIndex] || 0,
        endStockCandleId: pointStockCandleIds[currentSession.currentPointIndex + 1] || 0,
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
    if (currentSession.currentPointIndex < pointStockCandleIds.length - 1 && top3Points) {
      const pointStockCandleId = pointStockCandleIds[currentSession.currentPointIndex + 1];

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
          if (response.data?.result) {
            setStockData(response.data.result);
          }
        })
        .catch(() => {
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
    currentSession.endDate,
    currentSession.startDate,
    fetchSessionData,
    getCurrentNews,
    getNewsComment,
    getPastNews,
    isTutorialStarted,
    memberId,
    pointStockCandleIds,
    fullChartData,
    top3Points,
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
    } catch {
      // 에러 무시
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
    if (isTutorialStarted && top3Points && top3Points.length > 0 && pointDates.length > 0) {
      // 첫 번째 변곡점으로 세션 설정 (시작 ~ 첫 번째 변곡점)
      const firstPointDate = pointDates[0];
      setCurrentSession({
        startDate: defaultStartDate, // 시작 날짜
        endDate: firstPointDate || defaultEndDate, // 첫 번째 변곡점 날짜
        currentPointIndex: 0, // 현재 변곡점 인덱스
      });
    }
  }, [isTutorialStarted, top3Points, pointDates, defaultStartDate, defaultEndDate, companyId]);

  // 진행 상태에 따른 변곡점 이동 및 튜토리얼 완료 시 피드백 refetch
  useEffect(() => {
    if (!isTutorialStarted || !top3Points || !memberId || pointDates.length === 0) {
      return;
    }

    if (progress === 33) {
      // 두 번째 변곡점으로 이동 (첫 번째 변곡점 ~ 두 번째 변곡점)
      if (pointDates.length > 1) {
        const firstPointDate = pointDates[0] || defaultStartDate;
        const secondPointDate = pointDates[1] || defaultEndDate;

        setCurrentSession({
          startDate: firstPointDate, // 첫 번째 변곡점 날짜
          endDate: secondPointDate, // 두 번째 변곡점 날짜
          currentPointIndex: 1, // 두 번째 변곡점 인덱스
        });
      }
    } else if (progress === 66) {
      // 세 번째 변곡점으로 이동 (두 번째 변곡점 ~ 세 번째 변곡점)
      if (pointDates.length > 2) {
        const secondPointDate = pointDates[1] || defaultStartDate;
        const thirdPointDate = pointDates[2] || defaultEndDate;

        setCurrentSession({
          startDate: secondPointDate, // 두 번째 변곡점 날짜
          endDate: thirdPointDate, // 세 번째 변곡점 날짜
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
  }, [
    progress,
    isTutorialStarted,
    top3Points,
    memberId,
    refetchFeedback,
    completeTutorial,
    pointDates,
    defaultStartDate,
    defaultEndDate,
  ]);

  // 튜토리얼 시작 핸들러
  const handleTutorialStart = () => {
    if (!memberId) {
      alert('사용자 정보를 가져올 수 없습니다.');
      return;
    }

    // 전체 차트 데이터가 없으면 재로드 시도
    if (!fullChartData) {
      setIsChartLoading(true); // 로딩 상태 설정

      // 날짜 기반 API 호출
      fetchFullChartData()
        .then((response) => {
          if (response.data?.result) {
            const result = response.data.result;
            setFullChartData(result);
            setStockData(result);

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
        .catch(() => {
          // 에러 처리
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
        onError: () => {
          alert('튜토리얼을 시작할 수 없습니다. 다시 시도해주세요.');
        },
      },
    );
  };

  // 사용자 거래 처리 핸들러
  const handleTrade = useCallback(
    (action: 'buy' | 'sell', price: number, quantity: number) => {
      if (!isTutorialStarted || !top3Points || !memberId) {
        return;
      }

      // 현재 변곡점의 stockCandleId 가져오기
      const startPointId =
        currentSession.currentPointIndex > 0 &&
        top3Points.length > currentSession.currentPointIndex - 1
          ? top3Points[currentSession.currentPointIndex - 1].stockCandleId
          : 0;

      const endPointId =
        top3Points.length > currentSession.currentPointIndex
          ? top3Points[currentSession.currentPointIndex].stockCandleId
          : 0;

      if (endPointId === 0) return;

      // 사용자 행동에 따른 자산 계산 API 호출
      // 변곡점의 stockCandleId 사용 (API는 여전히 stockCandleId 기반)
      processUserAction.mutate(
        {
          memberId: memberId,
          action,
          price,
          quantity,
          companyId,
          startStockCandleId: startPointId || endPointId,
          endStockCandleId: endPointId,
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
                stockCandleId: endPointId,
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
      currentSession.currentPointIndex,
      memberId,
      companyId,
      processUserAction,
      top3Points,
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

  // 차트 데이터에서 실제 날짜 범위 업데이트
  useEffect(() => {
    const source = stockData || fullChartData;

    if (source?.data && source.data.length > 0) {
      // 일봉 데이터만 필터링
      const dayCandles = source.data.filter((candle: StockCandle) => candle.periodType === 1);

      if (dayCandles.length > 0) {
        // 날짜순으로 정렬
        const sortedDayCandles = [...dayCandles].sort((a, b) => {
          return new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime();
        });

        const firstCandle = sortedDayCandles[0];
        const lastCandle = sortedDayCandles[sortedDayCandles.length - 1];

        // 날짜 형식 추출 (YYMMDD 형식으로 변환)
        const formatTradingDateToYYMMDD = (dateStr: string) => {
          const date = new Date(dateStr);
          return formatDateToYYMMDD(date);
        };

        const startDate = formatTradingDateToYYMMDD(firstCandle.tradingDate);
        const endDate = formatTradingDateToYYMMDD(lastCandle.tradingDate);

        setTutorialDateRange({
          startDate,
          endDate,
        });
      }
    }
  }, [stockData, fullChartData]);

  // 최신 가격 가져오기
  useEffect(() => {
    // stockData에서 마지막 캔들의 종가를 가져와 최신 가격으로 설정
    if (stockData?.data && stockData.data.length > 0) {
      // 일봉 데이터만 필터링 (periodType이 1인 데이터)
      const filteredData = stockData.data.filter((item) => item.periodType === 1);

      if (filteredData.length > 0) {
        const lastCandle = filteredData[filteredData.length - 1];
        setLatestPrice(lastCandle.closePrice);
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
              <p>{tutorialDateRange.startDate}</p>
              <span className="font-bold text-border-color"> - </span>
              <p>{tutorialDateRange.endDate}</p>
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
