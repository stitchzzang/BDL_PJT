import Lottie from 'lottie-react';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { _ky } from '@/api/instance';
import {
  useDeleteTutorialSession,
  useGetTutorialFeedback,
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

const TutorialEndModal = memo(
  ({
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
  },
);

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
  const initialized = useRef(false);
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

  // 변곡점 날짜를 배열로 관리
  const [pointDates, setPointDates] = useState<string[]>([]);
  // 변곡점 ID 배열
  const [pointStockCandleIds, setPointStockCandleIds] = useState<number[]>([]);

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

  const { data: tutorialFeedbackResponse } = useGetTutorialFeedback(memberId, {
    enabled: !!memberId && currentTurn === 4,
  });

  const tutorialFeedback = tutorialFeedbackResponse?.result;

  const processUserAction = useProcessUserAction();
  const saveTutorialResult = useSaveTutorialResult();
  const deleteTutorialSession = useDeleteTutorialSession();
  const initSession = useInitSession();

  // 날짜 범위에 따른 세션 설정
  const calculateSession = (turn: number) => {
    if (turn <= 0 || pointDates.length < 3) return null;

    // 턴에 따른 세션과 진행률 매핑
    const turnToSessionMap: Record<
      number,
      {
        startDate: string;
        endDate: string;
        currentPointIndex: number;
      }
    > = {
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

    return turnToSessionMap[turn];
  };

  // 세션 업데이트 및 차트 데이터 로드
  const updateSessionAndLoadData = async (turn: number) => {
    // 턴에 맞는 세션 계산
    const newSession = calculateSession(turn);
    if (!newSession) return;

    // 세션 업데이트
    setCurrentSession(newSession);

    // 진행률 업데이트
    const turnToProgressMap: Record<number, number> = {
      1: 25,
      2: 50,
      3: 75,
      4: 100,
    };
    setProgress(turnToProgressMap[turn]);

    // 차트 데이터 로드
    await loadChartData(newSession.startDate, newSession.endDate, turn);
  };

  // 차트 데이터 로드 함수
  const loadChartData = async (startDate: string, endDate: string, turn: number) => {
    // 중복 로드 방지
    const sessionKey = `${startDate}-${endDate}-${turn}`;
    if (prevSessionRef.current === sessionKey) {
      return;
    }
    prevSessionRef.current = sessionKey;

    try {
      setIsChartLoading(true);
      setHasChartError(false);

      // 차트 데이터 가져오기
      const apiUrl = `stocks/${companyId}/tutorial?startDate=${startDate}&endDate=${endDate}`;
      console.log(`튜토리얼 차트 데이터 요청: ${apiUrl}`);

      const stockDataResponse = (await _ky
        .get(apiUrl)
        .json()) as ApiResponse<TutorialStockResponse>;

      if (!stockDataResponse?.result?.data || stockDataResponse.result.data.length === 0) {
        console.log('차트 데이터가 비어있습니다:', stockDataResponse);
        setHasChartError(true);
        return;
      }

      const result = stockDataResponse.result;
      console.log(`차트 데이터 로드 성공: ${result.data.length}개 데이터 포인트`);

      // 현재 턴의 데이터 저장
      setStockData(result);

      // 턴 차트 데이터 업데이트 (함수형 업데이트 사용)
      setTurnChartData((prev) => ({
        ...prev,
        [turn]: result,
      }));

      // 첫 턴인 경우 전체 차트 데이터도 설정
      if (turn === 1) {
        setFullChartData(result);
        setAccumulatedChartData(result);
      } else {
        // 누적 데이터 계산
        updateAccumulatedChartData(result, turn);
      }

      // 최신 가격 설정
      updateLatestPrice(result);

      // 뉴스 데이터 로드
      await loadNewsData(turn);
    } catch (error) {
      console.error('차트 데이터 로드 오류:', error);
      setHasChartError(true);
    } finally {
      setIsChartLoading(false);
    }
  };

  // 누적 차트 데이터 업데이트
  const updateAccumulatedChartData = (newData: TutorialStockResponse, turn: number) => {
    // 현재 턴과 이전 턴의 데이터 수집
    const allData: StockCandle[] = [];

    // 턴 데이터에서 수집
    for (let i = 1; i <= turn; i++) {
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
  };

  // 최신 가격 업데이트
  const updateLatestPrice = (data: TutorialStockResponse) => {
    const dayCandles = data.data.filter((candle: StockCandle) => candle.periodType === 1);
    if (dayCandles.length > 0) {
      const lastCandle = dayCandles[dayCandles.length - 1];
      setLatestPrice(lastCandle.closePrice);
    }
  };

  // 뉴스 데이터 로드
  const loadNewsData = async (turn: number) => {
    // 과거 뉴스 목록 가져오기 (2턴 이상부터)
    if (turn > 1 && pointStockCandleIds.length >= turn) {
      const startStockCandleId = pointStockCandleIds[turn - 2] || 0;
      const endStockCandleId = pointStockCandleIds[turn - 1] || 0;

      if (startStockCandleId && endStockCandleId) {
        try {
          // 과거 뉴스 목록
          const pastNewsResponse = (await _ky
            .post('tutorial/news/past', {
              json: { companyId, startStockCandleId, endStockCandleId },
            })
            .json()) as ApiResponse<{ NewsResponse: NewsResponse[] }>;

          if (pastNewsResponse?.result?.NewsResponse) {
            setPastNewsList(pastNewsResponse.result.NewsResponse);
          }

          // 뉴스 코멘트
          const commentResponse = (await _ky
            .post('tutorial/news/comment', {
              json: { companyId, startStockCandleId, endStockCandleId },
            })
            .json()) as ApiResponse<string>;

          if (commentResponse?.result) {
            setNewsComment(commentResponse.result);
          }
        } catch (error) {
          console.error('뉴스 데이터 로드 오류:', error);
        }
      }
    }

    // 현재 뉴스 가져오기
    if (turn > 0 && turn <= pointStockCandleIds.length) {
      const pointStockCandleId = pointStockCandleIds[turn - 1];
      if (pointStockCandleId) {
        try {
          const currentNewsResponse = (await _ky
            .post('tutorial/news/current', {
              json: { companyId, stockCandleId: pointStockCandleId },
            })
            .json()) as ApiResponse<NewsResponseWithThumbnail>;

          if (currentNewsResponse?.result) {
            setCurrentNews(currentNewsResponse.result);
          }
        } catch (error) {
          console.error('현재 뉴스 로드 오류:', error);
        }
      }
    }
  };

  // 튜토리얼 완료 처리 함수
  const completeTutorial = async () => {
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
    } catch (error) {
      console.error('튜토리얼 결과 저장 오류:', error);
    }
  };

  // 다음 턴으로 이동하는 함수
  const moveToNextTurn = async () => {
    if (currentTurn < 4) {
      const nextTurn = currentTurn + 1;
      setCurrentTurn(nextTurn);
      setIsCurrentTurnCompleted(false);

      // 세션 업데이트 및 데이터 로드
      await updateSessionAndLoadData(nextTurn);
    } else {
      await completeTutorial();
    }
  };

  // 거래 처리 핸들러
  const handleTrade = async (action: 'buy' | 'sell' | 'wait', price: number, quantity: number) => {
    if (!isTutorialStarted || currentTurn === 0 || pointStockCandleIds.length === 0) {
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

    try {
      const response = await processUserAction.mutateAsync({
        memberId,
        action,
        price,
        quantity,
        companyId,
        startStockCandleId: startPointId || endPointId,
        endStockCandleId: endPointId,
      });

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

      // 현재 턴 완료 처리
      setIsCurrentTurnCompleted(true);
    } catch (error) {
      console.error('거래 처리 오류:', error);
    }
  };

  // 변곡점 데이터 로드
  const loadPointsData = async () => {
    try {
      // 변곡점 직접 가져오기 (/api/ 제거)
      const pointsResponse = (await _ky
        .get(`tutorial/points/top3?companyId=${companyId}`)
        .json()) as ApiResponse<{ PointResponseList: Point[] }>;

      if (pointsResponse?.result?.PointResponseList) {
        const points = pointsResponse.result.PointResponseList;
        console.log('변곡점 로드 성공:', points);

        // 변곡점 ID 저장
        const pointIds = points.map((point) => point.stockCandleId);
        setPointStockCandleIds(pointIds);

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
          return dates;
        }
      }
    } catch (error) {
      console.error('변곡점 로드 오류:', error);
    }
    return [];
  };

  // 튜토리얼 시작 핸들러
  const handleTutorialStart = async () => {
    // 이미 튜토리얼이 시작된 상태에서 다음 턴으로 이동
    if (isTutorialStarted && isCurrentTurnCompleted) {
      await moveToNextTurn();
      return;
    }

    if (!memberId) {
      alert('사용자 정보를 가져올 수 없습니다.');
      return;
    }

    setIsChartLoading(true);
    setHasChartError(false);

    try {
      // 초기화 API 호출
      await initSession.mutateAsync({ memberId, companyId });

      // 튜토리얼 시작 상태로 설정
      setIsTutorialStarted(true);

      // 변곡점 데이터 로드 (필요한 경우)
      let pointDatesLoaded = pointDates;
      if (pointDates.length < 3) {
        pointDatesLoaded = await loadPointsData();
      }

      // 첫 번째 턴 설정
      setCurrentTurn(1);

      // 첫 번째 턴에 맞는 세션 설정
      if (pointDatesLoaded.length >= 3) {
        const firstSession = {
          startDate: defaultStartDate,
          endDate: pointDatesLoaded[0],
          currentPointIndex: 0,
        };

        setCurrentSession(firstSession);
        setProgress(25);

        // 첫 턴 차트 데이터 로드
        await loadChartData(firstSession.startDate, firstSession.endDate, 1);
      }
    } catch (error) {
      console.error('튜토리얼 초기화 오류:', error);
      setHasChartError(true);
    } finally {
      setIsChartLoading(false);
    }
  };

  // 결과 확인 페이지로 이동
  const handleNavigateToResult = useCallback(() => {
    navigate('/member/stock-tutorial-result');
    setIsModalOpen(false);
  }, [navigate]);

  // 튜토리얼 선택 페이지로 이동
  const handleNavigateToSelect = useCallback(() => {
    navigate('/tutorial/select');
    setIsModalOpen(false);
  }, [navigate]);

  // 튜토리얼 버튼 텍스트 생성
  const getTutorialButtonText = useMemo(() => {
    if (!isTutorialStarted) {
      return '튜토리얼 시작하기';
    }

    if (isCurrentTurnCompleted) {
      return currentTurn < 4 ? '다음 턴으로' : '결과 확인하기';
    }

    return '현재 턴 진행 중...';
  }, [isTutorialStarted, isCurrentTurnCompleted, currentTurn]);

  // 첫 렌더링 이후 변곡점 데이터 로드
  if (!initialized.current) {
    initialized.current = true;
    // setTimeout으로 마이크로태스크 큐에 넣어 렌더링 중 상태 업데이트 방지
    setTimeout(() => {
      if (pointDates.length < 3) {
        loadPointsData();
      }
    }, 0);
  }

  return (
    <div className="flex h-full w-full flex-col px-6">
      <div>
        <StockTutorialInfo
          companyId={companyId}
          isTutorialStarted={isTutorialStarted}
          onTutorialStart={handleTutorialStart}
          currentTurn={currentTurn}
          isCurrentTurnCompleted={isCurrentTurnCompleted}
          buttonText={getTutorialButtonText}
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
