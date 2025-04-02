import Lottie from 'lottie-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { _ky } from '@/api/instance';
import {
  useDeleteTutorialSession,
  useGetCurrentNews,
  useGetNewsComment,
  useGetPastNews,
  useGetPointDates,
  useGetTop3Points,
  useGetTutorialFeedback,
  useGetTutorialStockData,
  useInitSession,
  useProcessUserAction,
  useSaveTutorialResult,
} from '@/api/tutorial.api';
import {
  ApiResponse,
  AssetResponse,
  NewsResponse,
  NewsResponseWithThumbnail,
  Point,
  StockCandle,
  TutorialStockResponse,
} from '@/api/types/tutorial';
import ChartAnimation from '@/assets/lottie/chart-animation.json';
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
import { formatDateToYYMMDD, formatYYMMDDToYYYYMMDD } from '@/utils/dateFormatter.ts';

// 거래 기록을 위한 타입 정의 (외부 컴포넌트와 호환되는 타입)
type TradeAction = 'buy' | 'sell' | 'wait';

interface TradeRecord {
  action: TradeAction;
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

export interface StockInfoProps {
  companyId: number;
  isTutorialStarted?: boolean;
  onTutorialStart?: () => void;
  currentTurn?: number;
}

export const SimulatePage = () => {
  const navigate = useNavigate();
  const { companyId: companyIdParam } = useParams<{ companyId: string }>();
  const h3Style = 'text-[20px] font-bold';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [finalChangeRate, setFinalChangeRate] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTutorialStarted, setIsTutorialStarted] = useState(false);
  const companyId = Number(companyIdParam) || 1;

  // 첫 렌더링 여부를 추적하는 ref
  const isFirstRender = useRef(true);
  // 세션 캐싱을 위한 ref
  const prevSessionRef = useRef('');
  // 현재 진행 중인 턴 번호 (1~4)
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  // 현재 턴이 완료되었는지 여부를 추적하는 상태 추가
  const [isCurrentTurnCompleted, setIsCurrentTurnCompleted] = useState(false);
  // 차트 데이터 로딩 상태 추가
  const [isChartLoading, setIsChartLoading] = useState(false);
  // 차트 데이터 로딩 오류 여부 추가
  const [hasChartError, setHasChartError] = useState(false);

  // 인증 관련 코드 주석 처리 (개발 테스트용)
  // const memberId = authData.userData?.id || 1;
  const memberId = 1; // 테스트용 고정 ID

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

  // 과거 뉴스 목록 상태
  const [pastNewsList, setPastNewsList] = useState<NewsResponse[]>([]);

  // 뉴스 코멘트 상태
  const [newsComment, setNewsComment] = useState('');

  // 전체 차트 데이터 상태 (1년 전 시점부터 현재까지)
  const [fullChartData, setFullChartData] = useState<TutorialStockResponse | null>(null);

  // 턴별 차트 데이터를 저장할 상태 추가
  const [turnChartData, setTurnChartData] = useState<Record<number, TutorialStockResponse | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  // 누적 차트 데이터 상태 추가
  const [accumulatedChartData, setAccumulatedChartData] = useState<TutorialStockResponse | null>(
    null,
  );

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

  // 변곡점 날짜를 배열로 관리
  const [pointDates, setPointDates] = useState<string[]>([]);

  // API 훅 설정 - 컴포넌트 최상단에 배치
  const { data: top3PointsResponse } = useGetTop3Points(companyId);

  // 변곡점 날짜 조회를 위한 설정
  const pointStockCandleIds = useMemo(
    () =>
      top3PointsResponse?.result?.PointResponseList?.map((point: Point) => point.stockCandleId) ||
      [],
    [top3PointsResponse],
  );

  // 데이터 추출
  const top3Points = top3PointsResponse?.result?.PointResponseList;

  // 변곡점 날짜 한 번에 조회 (useGetPointDates 사용)
  const { pointDates: pointDatesFromAPI } = useGetPointDates(
    top3PointsResponse?.result?.PointResponseList || [],
  );

  // 세션별 주식 데이터 가져오기를 위한 커스텀 훅
  const { refetch: fetchSessionData } = useGetTutorialStockData(
    companyId,
    currentSession.startDate,
    currentSession.endDate,
  );

  const { data: tutorialFeedbackResponse } = useGetTutorialFeedback(memberId, {
    enabled: !!memberId && currentTurn === 4,
  });

  const tutorialFeedback = tutorialFeedbackResponse?.result;

  const getCurrentNews = useGetCurrentNews();
  const getPastNews = useGetPastNews();
  const getNewsComment = useGetNewsComment();
  const processUserAction = useProcessUserAction();
  const saveTutorialResult = useSaveTutorialResult();
  const deleteTutorialSession = useDeleteTutorialSession();
  const initSession = useInitSession();

  // API 초기화 및 변곡점 로드 - 무한 루프 방지를 위해 최초 1회만 실행
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      // 변곡점 데이터가 있으면 날짜 설정
      if (pointDatesFromAPI.length > 0) {
        setPointDates(pointDatesFromAPI);
      }
    }
  }, [pointDatesFromAPI]);

  // 튜토리얼 시작 시 초기 데이터 설정 및 턴 관리
  // 중요: 이 effect는 isTutorialStarted나 currentTurn이 변경될 때만 실행됨
  useEffect(() => {
    if (isTutorialStarted && currentTurn === 0 && pointDates.length >= 3) {
      // 변곡점 데이터가 로드되었고 튜토리얼이 시작되었으나 현재 턴이 0인 경우, 첫 번째 턴으로 설정
      setCurrentTurn(1);
      setIsCurrentTurnCompleted(false);
      setProgress(25); // 첫 번째 턴 진행률 설정
    }
  }, [isTutorialStarted, currentTurn, pointDates.length]);

  // 현재 턴에 따른 세션 설정 - 무한 루프 방지를 위해 currentTurn이 변경될 때만 실행
  useEffect(() => {
    if (!isTutorialStarted || pointDates.length < 3 || currentTurn <= 0) {
      return;
    }

    // 턴에 따른 세션과 진행률 매핑
    type SessionConfig = {
      startDate: string;
      endDate: string;
      currentPointIndex: number;
    };

    const turnToSessionMap: Record<number, SessionConfig> = {
      1: {
        startDate: defaultStartDate,
        endDate: pointDates[0],
        currentPointIndex: 0,
      },
      2: {
        startDate: pointDates[0],
        endDate: pointDates[1],
        currentPointIndex: 1,
      },
      3: {
        startDate: pointDates[1],
        endDate: pointDates[2],
        currentPointIndex: 2,
      },
      4: {
        startDate: pointDates[2],
        endDate: defaultEndDate,
        currentPointIndex: 3,
      },
    };

    const turnToProgressMap: Record<number, number> = {
      1: 25,
      2: 50,
      3: 75,
      4: 100,
    };

    const newSession = turnToSessionMap[currentTurn];
    if (newSession && JSON.stringify(newSession) !== JSON.stringify(currentSession)) {
      setCurrentSession(newSession);
      setProgress(turnToProgressMap[currentTurn] || 0);
    }
  }, [
    currentTurn,
    defaultEndDate,
    defaultStartDate,
    isTutorialStarted,
    pointDates,
    currentSession,
  ]);

  // 튜토리얼 세션 종료 시 세션 삭제 - 이벤트 핸들러
  useEffect(() => {
    return () => {
      if (isTutorialStarted && memberId) {
        deleteTutorialSession.mutate(memberId);
      }
    };
  }, [deleteTutorialSession, isTutorialStarted, memberId]);

  // 누적 차트 데이터 업데이트
  const updateAccumulatedChartData = useCallback(
    (newData: TutorialStockResponse) => {
      // 모든 턴의 데이터 수집
      const allData: StockCandle[] = [];

      // 이전 턴들의 데이터 누적
      for (let i = 1; i <= currentTurn; i++) {
        const turnData = turnChartData[i];
        if (turnData?.data && turnData.data.length > 0) {
          allData.push(...turnData.data);
        }
      }

      // 현재 턴 데이터 추가
      if (newData.data && newData.data.length > 0) {
        allData.push(...newData.data);
      }

      // 중복 제거 및 정렬
      const uniqueDataMap = new Map<number, StockCandle>();
      allData.forEach((candle: StockCandle) => {
        if (!uniqueDataMap.has(candle.stockCandleId)) {
          uniqueDataMap.set(candle.stockCandleId, candle);
        }
      });

      // Map을 배열로 변환하고 날짜순 정렬
      const sortedData = Array.from(uniqueDataMap.values()).sort(
        (a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime(),
      );

      // 누적 차트 데이터 설정
      setAccumulatedChartData({
        ...newData,
        data: sortedData,
      });
    },
    [currentTurn, turnChartData],
  );

  // 최신 가격 업데이트
  const updateLatestPrice = useCallback((data: TutorialStockResponse) => {
    const dayCandles = data.data.filter((candle: StockCandle) => candle.periodType === 1);
    if (dayCandles.length > 0) {
      const lastCandle = dayCandles[dayCandles.length - 1];
      setLatestPrice(lastCandle.closePrice);
    }
  }, []);

  // 뉴스 데이터 로드
  const loadNewsData = useCallback(async () => {
    // 과거 뉴스 목록 가져오기 (2턴 이상부터)
    if (currentTurn > 1 && pointStockCandleIds.length >= currentTurn) {
      const startStockCandleId = pointStockCandleIds[currentTurn - 2] || 0;
      const endStockCandleId = pointStockCandleIds[currentTurn - 1] || 0;

      if (startStockCandleId && endStockCandleId) {
        getPastNews.mutate(
          { companyId, startStockCandleId, endStockCandleId },
          {
            onSuccess: (result) => {
              if (result.result && result.result.NewsResponse) {
                setPastNewsList(result.result.NewsResponse);
              }
            },
          },
        );

        // 뉴스 코멘트 가져오기
        getNewsComment.mutate(
          { companyId, startStockCandleId, endStockCandleId },
          {
            onSuccess: (result) => {
              if (result.result) {
                setNewsComment(result.result);
              }
            },
          },
        );
      }
    }

    // 현재 뉴스 가져오기
    if (currentTurn > 0 && currentTurn <= pointStockCandleIds.length) {
      const pointStockCandleId = pointStockCandleIds[currentTurn - 1];
      if (pointStockCandleId) {
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
  }, [companyId, currentTurn, getCurrentNews, getNewsComment, getPastNews, pointStockCandleIds]);

  // 차트 데이터 로드 별도 함수 구현 - 무한 루프 방지
  const loadChartData = useCallback(async () => {
    if (
      !isTutorialStarted ||
      currentTurn === 0 ||
      !currentSession.startDate ||
      !currentSession.endDate
    ) {
      return;
    }

    // 중복 로드 방지
    const sessionKey = `${currentSession.startDate}-${currentSession.endDate}-${currentTurn}`;
    if (prevSessionRef.current === sessionKey) {
      return;
    }
    prevSessionRef.current = sessionKey;

    try {
      setIsChartLoading(true);
      setHasChartError(false);

      // 1. 차트 데이터 가져오기 - API 경로 수정 (/api/ 제거)
      const apiUrl = `stocks/${companyId}/tutorial?startDate=${currentSession.startDate}&endDate=${currentSession.endDate}`;

      console.log(`튜토리얼 차트 데이터 요청: ${apiUrl}`);

      const stockDataResponse = (await _ky
        .get(apiUrl)
        .json()) as ApiResponse<TutorialStockResponse>;

      if (!stockDataResponse?.result?.data || stockDataResponse.result.data.length === 0) {
        console.log('차트 데이터가 비어있습니다:', stockDataResponse);
        setHasChartError(true);
        setIsChartLoading(false);
        return;
      }

      const result = stockDataResponse.result;

      console.log(`차트 데이터 로드 성공: ${result.data.length}개 데이터 포인트`);

      // 현재 턴의 데이터 저장
      setStockData(result);
      setTurnChartData((prev) => ({
        ...prev,
        [currentTurn]: result,
      }));

      // 첫 턴인 경우 전체 차트 데이터도 설정
      if (currentTurn === 1) {
        setFullChartData(result);
        setAccumulatedChartData(result);
      } else {
        // 누적 데이터 계산
        updateAccumulatedChartData(result);
      }

      // 최신 가격 설정
      updateLatestPrice(result);

      // 2. 뉴스 데이터 가져오기
      await loadNewsData();
    } catch (error) {
      console.error('차트 데이터 로드 오류:', error);
      setHasChartError(true);
    } finally {
      setIsChartLoading(false);
    }
  }, [
    companyId,
    currentSession,
    currentTurn,
    isTutorialStarted,
    updateAccumulatedChartData,
    updateLatestPrice,
    loadNewsData,
  ]);

  // 세션 변경 감지 및 데이터 로드 트리거
  useEffect(() => {
    if (isTutorialStarted && currentTurn > 0) {
      loadChartData();
    }
  }, [currentSession, loadChartData, isTutorialStarted, currentTurn]);

  // 차트 데이터에서 실제 날짜 범위 업데이트
  useEffect(() => {
    const updateDateRange = () => {
      const source = stockData || fullChartData;

      // 차트 데이터가 없거나 데이터가 비어있으면 처리하지 않음
      if (!source?.data || source.data.length === 0) {
        return;
      }

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

        // 실제로 값이 변경된 경우에만 상태 업데이트
        if (tutorialDateRange.startDate !== startDate || tutorialDateRange.endDate !== endDate) {
          setTutorialDateRange({
            startDate,
            endDate,
          });
        }
      }
    };

    updateDateRange();
  }, [stockData, fullChartData, tutorialDateRange]);

  // 튜토리얼 완료 처리 함수 - 메모이제이션
  const completeTutorial = useCallback(async () => {
    if (!memberId) return;

    try {
      const currentDate = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

      await saveTutorialResult.mutateAsync({
        companyId,
        startMoney: 10000000,
        endMoney: assetInfo.currentTotalAsset,
        changeRate: assetInfo.totalReturnRate,
        startDate: oneYearAgo.toISOString(),
        endDate: currentDate.toISOString(),
        memberId: memberId,
      });
      setIsModalOpen(true);
      setFinalChangeRate(assetInfo.totalReturnRate);
    } catch {
      // 에러 처리
    }
  }, [
    memberId,
    companyId,
    assetInfo.currentTotalAsset,
    assetInfo.totalReturnRate,
    saveTutorialResult,
  ]);

  // 다음 턴으로 이동하는 함수
  const moveToNextTurn = useCallback(() => {
    if (currentTurn < 4) {
      setCurrentTurn((prevTurn) => prevTurn + 1);
      setIsCurrentTurnCompleted(false);
    } else {
      completeTutorial();
    }
  }, [currentTurn, completeTutorial]);

  // 거래 처리 핸들러 - 상태 업데이트를 useCallback으로 메모이제이션
  const handleTrade = useCallback(
    (action: 'buy' | 'sell' | 'wait', price: number, quantity: number) => {
      if (!isTutorialStarted || !top3Points || !memberId || currentTurn === 0) {
        return;
      }

      // 현재 변곡점의 stockCandleId 가져오기
      const startPointId =
        currentTurn > 1 && pointStockCandleIds.length >= currentTurn - 1
          ? pointStockCandleIds[currentTurn - 2]
          : 0;

      const endPointId =
        pointStockCandleIds.length >= currentTurn - 1 ? pointStockCandleIds[currentTurn - 1] : 0;

      if (endPointId === 0) {
        return;
      }

      processUserAction.mutate(
        {
          memberId,
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

            // 거래 기록 추가
            if ((price > 0 && quantity > 0) || action === 'wait') {
              setTrades((prev) => [
                ...prev,
                {
                  action,
                  price,
                  quantity,
                  timestamp: new Date(),
                  stockCandleId: endPointId,
                },
              ]);
            }

            // 자산 정보 업데이트
            if (assetResults && assetResults.length > 0) {
              const lastAsset = assetResults[assetResults.length - 1];
              setAssetInfo(lastAsset);
              setFinalChangeRate(lastAsset.totalReturnRate);
            }

            // 현재 턴의 데이터를 저장
            if (stockData) {
              setTurnChartData((prev) => ({
                ...prev,
                [currentTurn]: stockData,
              }));
            }

            // 현재 턴 완료 처리
            setIsCurrentTurnCompleted(true);
          },
        },
      );
    },
    [
      isTutorialStarted,
      top3Points,
      memberId,
      currentTurn,
      pointStockCandleIds,
      companyId,
      processUserAction,
      stockData,
    ],
  );

  // 튜토리얼 시작 핸들러 - 메모이제이션
  const handleTutorialStart = useCallback(() => {
    // 이미 튜토리얼이 시작된 상태에서 다음 턴으로 이동
    if (isTutorialStarted && isCurrentTurnCompleted) {
      moveToNextTurn();
      return;
    }

    if (!memberId) {
      alert('사용자 정보를 가져올 수 없습니다.');
      return;
    }

    setIsChartLoading(true);
    setHasChartError(false);

    // 초기화 API 호출
    initSession.mutate(
      { memberId, companyId },
      {
        onSuccess: async () => {
          // 튜토리얼 시작 상태로 설정
          setIsTutorialStarted(true);
          setCurrentTurn(1); // 명시적으로 첫 번째 턴 설정

          // 변곡점 데이터 로드가 필요한 경우
          if (pointDates.length < 3) {
            try {
              // 변곡점 직접 가져오기 (/api/ 제거)
              const pointsResponse = (await _ky
                .get(`tutorial/points/top3?companyId=${companyId}`)
                .json()) as ApiResponse<{ PointResponseList: Point[] }>;

              if (pointsResponse?.result?.PointResponseList) {
                const points = pointsResponse.result.PointResponseList;
                console.log('변곡점 로드 성공:', points);

                // 각 변곡점에 대한 날짜 가져오기
                const dates = [];
                for (const point of points) {
                  if (point.stockCandleId) {
                    const dateResponse = (await _ky
                      .get(`tutorial/points/date?stockCandleId=${point.stockCandleId}`)
                      .json()) as ApiResponse<string>;
                    if (dateResponse?.result) {
                      dates.push(dateResponse.result);
                    }
                  }
                }

                if (dates.length > 0) {
                  console.log('변곡점 날짜 로드 성공:', dates);
                  setPointDates(dates);
                }
              }
            } catch (error) {
              console.error('변곡점 로드 오류:', error);
            }
          }

          setProgress(25);
          setIsChartLoading(false);
        },
        onError: (error) => {
          console.error('튜토리얼 초기화 오류:', error);
          setHasChartError(true);
          setIsChartLoading(false);
        },
        onSettled: () => {
          setIsChartLoading(false);
        },
      },
    );
  }, [
    companyId,
    initSession,
    memberId,
    isTutorialStarted,
    isCurrentTurnCompleted,
    moveToNextTurn,
    pointDates.length,
  ]);

  // 결과 확인 페이지로 이동 - 메모이제이션
  const handleNavigateToResult = useCallback(() => {
    navigate('/member/stock-tutorial-result');
    setIsModalOpen(false);
  }, [navigate]);

  // 튜토리얼 선택 페이지로 이동 - 메모이제이션
  const handleNavigateToSelect = useCallback(() => {
    navigate('/tutorial/select');
    setIsModalOpen(false);
  }, [navigate]);

  // 튜토리얼 버튼 텍스트 생성
  const getTutorialButtonText = useCallback(() => {
    if (!isTutorialStarted) {
      return '튜토리얼 시작하기';
    }

    if (isCurrentTurnCompleted) {
      return currentTurn < 4 ? '다음 턴으로' : '결과 확인하기';
    }

    return '현재 턴 진행 중...';
  }, [isTutorialStarted, isCurrentTurnCompleted, currentTurn]);

  return (
    <div className="flex h-full w-full flex-col px-6">
      <div>
        <StockTutorialInfo
          companyId={companyId}
          isTutorialStarted={isTutorialStarted}
          onTutorialStart={handleTutorialStart}
          currentTurn={currentTurn}
          isCurrentTurnCompleted={isCurrentTurnCompleted}
          buttonText={getTutorialButtonText()}
        />
        <div className="my-[25px]">
          <StockProgress progress={progress} />
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
              <p>{formatYYMMDDToYYYYMMDD(tutorialDateRange.startDate)}</p>
              <span className="font-bold text-border-color"> - </span>
              <p>{formatYYMMDDToYYYYMMDD(tutorialDateRange.endDate)}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-10 gap-3">
        <div className="col-span-8">
          {!isTutorialStarted ? (
            <div className="flex h-[600px] flex-col items-center justify-center rounded-2xl bg-[#0D192B] text-white">
              <div className="max-w-[400px]">
                <Lottie animationData={ChartAnimation} loop={true} />
              </div>
              <p className="mt-4 text-center text-xl font-medium">
                튜토리얼을 시작하여 주식 투자를 연습해보세요!
              </p>
              <p className="mt-2 text-center text-sm text-gray-400">
                4단계로 구성된 주식 튜토리얼에서 실전과 같은 투자 경험을 해볼 수 있습니다.
              </p>
            </div>
          ) : isChartLoading ? (
            <div className="flex h-[600px] flex-col items-center justify-center rounded-2xl bg-[#0D192B] text-white">
              <div className="text-center">
                <p className="mb-3 text-xl">차트 데이터를 불러오는 중입니다...</p>
                <p className="text-sm text-gray-400">
                  일봉 데이터를 로드하고 있습니다. 잠시만 기다려주세요.
                </p>
              </div>
            </div>
          ) : hasChartError ? (
            <div className="flex h-[600px] flex-col items-center justify-center rounded-2xl bg-[#0D192B] text-white">
              <div className="text-center">
                <p className="mb-3 text-xl">차트 데이터를 불러오는데 문제가 발생했습니다.</p>
                <p className="text-sm text-gray-400">잠시 후 다시 시도해 주세요.</p>
              </div>
            </div>
          ) : !stockData?.data?.length ? (
            <div className="flex h-[600px] flex-col items-center justify-center rounded-2xl bg-[#0D192B] text-white">
              <div className="text-center">
                <p className="mb-3 text-xl">차트 데이터가 없습니다.</p>
                <p className="text-sm text-gray-400">
                  일봉 데이터를 불러오는 중이거나, 데이터가 존재하지 않습니다.
                </p>
                <p className="mt-2 text-sm text-gray-400">잠시 후 다시 시도해 주세요.</p>
              </div>
            </div>
          ) : (
            <ChartComponent periodData={stockData || undefined} height={600} />
          )}
        </div>
        <div className="col-span-2">
          <TutorialOrderStatus
            onTrade={handleTrade}
            isSessionActive={
              isTutorialStarted && currentTurn > 0 && currentTurn <= 4 && !isCurrentTurnCompleted
            }
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
