import Lottie from 'lottie-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { _ky } from '@/api/instance/index';
import {
  useDeleteTutorialSession,
  useGetCurrentNews,
  useGetNewsComment,
  useGetPastNews,
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
  turnNumber: number; // 턴 번호 추가 (1~4)
}

interface TutorialEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  changeRate: number;
  feedback: string;
  onConfirmResultClick: () => void;
  onEndTutorialClick: () => void;
}

const TutorialEndModal = memo(
  ({
    isOpen,
    onClose,
    changeRate,
    feedback,
    onConfirmResultClick,
    onEndTutorialClick,
  }: TutorialEndModalProps) => {
    const isPositive = changeRate >= 0;
    const rateColor = isPositive ? 'text-[#E5404A]' : 'text-blue-500';
    const formattedRate = `${isPositive ? '+' : ''}${changeRate.toFixed(1)}%`;

    if (!isOpen) return null;

    return (
      <AlertDialog open={isOpen} onOpenChange={onClose}>
        <AlertDialogContent className="w-[450px] rounded-lg border-none bg-[#121729] p-7 text-white">
          <AlertDialogHeader className="mb-2 text-center">
            <AlertDialogTitle className="text-xl font-semibold">
              주식 튜토리얼이 종료되었습니다.
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm text-gray-400">
              주식 튜토리얼 결과는 마이페이지에서 전체 확인이 가능합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="mb-1 rounded-md bg-[#101017] p-4 text-center">
            <span className={`text-3xl font-bold ${rateColor}`}>{formattedRate}</span>
          </div>

          {feedback && (
            <div className="my-2 rounded-md bg-[#1A1D2D] p-4">
              <h3 className="mb-2 text-[16px] font-semibold">튜토리얼 피드백</h3>
              <p className="text-[14px] text-gray-300">{feedback}</p>
            </div>
          )}

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
  // 뉴스 데이터 로딩 상태 추가
  const [isNewsLoading, setIsNewsLoading] = useState(false);

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

  // 과거 뉴스 목록 상태 (턴별로 관리)
  const [turnNewsList, setTurnNewsList] = useState<Record<number, NewsResponse[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
  });

  // 현재 표시할 과거 뉴스 목록
  const [pastNewsList, setPastNewsList] = useState<NewsResponse[]>([]);

  // 뉴스 코멘트 상태 (턴별로 관리)
  const [turnComments, setTurnComments] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: '',
    4: '',
  });

  // 현재 표시할 코멘트
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

  // 보유 주식 수량 추적 상태 추가
  const [ownedStockCount, setOwnedStockCount] = useState(0);

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
  const getCurrentNews = useGetCurrentNews();
  const getPastNews = useGetPastNews();
  const getNewsComment = useGetNewsComment();

  // 디버깅용 코멘트 상태 변경 추적
  useEffect(() => {
    console.log('SimulatePage - 현재 뉴스 코멘트:', newsComment);
    console.log('SimulatePage - 턴별 코멘트 상태:', turnComments);
  }, [newsComment, turnComments]);

  // 현재 턴이 변경될 때마다 해당 턴의 코멘트로 업데이트
  useEffect(() => {
    if (currentTurn > 0 && currentTurn <= 4) {
      const turnComment = turnComments[currentTurn];
      console.log(`턴 ${currentTurn}의 코멘트로 업데이트:`, turnComment);
      setNewsComment(turnComment || '');
    }
  }, [currentTurn, turnComments]);

  // 현재 턴이 변경될 때마다 해당 턴의 뉴스 목록으로 업데이트
  useEffect(() => {
    if (currentTurn > 0 && currentTurn <= 4) {
      // 해당 턴의 과거 뉴스 데이터 설정
      const turnNews = turnNewsList[currentTurn];
      console.log(`턴 ${currentTurn}의 뉴스 목록으로 업데이트:`, {
        count: turnNews?.length || 0,
        news: turnNews,
      });
      setPastNewsList(turnNews || []);

      // 이미 API가 호출되었지만 데이터가 없는 경우 다시 로드
      if ((!turnNews || turnNews.length === 0) && isTutorialStarted) {
        console.log(`턴 ${currentTurn}의 데이터가 없어 다시 로드합니다.`);

        // 변곡점 데이터가 있는지 확인하고 필요시 로드
        if (pointStockCandleIds.length === 0) {
          loadPointsData().then(() => {
            loadNewsData(currentTurn);
          });
        } else {
          loadNewsData(currentTurn);
        }
      }
    }
  }, [currentTurn, turnNewsList, isTutorialStarted]);

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

      const response = await _ky.get(apiUrl).json();
      console.log('차트 데이터 원본 응답:', response);

      const stockDataResponse = response as ApiResponse<TutorialStockResponse>;

      if (!stockDataResponse?.result?.data || stockDataResponse.result.data.length === 0) {
        console.log('차트 데이터가 비어있습니다:', stockDataResponse);
        setHasChartError(true);
        return;
      }

      const result = stockDataResponse.result;
      console.log(`차트 데이터 로드 성공: ${result.data.length}개 데이터 포인트`, result);

      // 현재 턴의 데이터 저장
      setStockData(result);

      // 튜토리얼 날짜 범위 업데이트
      if (result.data && result.data.length > 0) {
        const dayCandles = result.data.filter((candle: StockCandle) => candle.periodType === 1);
        if (dayCandles.length > 0) {
          const sortedCandles = [...dayCandles].sort(
            (a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime(),
          );

          const firstDate = formatDateToYYMMDD(new Date(sortedCandles[0].tradingDate));
          const lastDate = formatDateToYYMMDD(
            new Date(sortedCandles[sortedCandles.length - 1].tradingDate),
          );

          setTutorialDateRange({
            startDate: firstDate,
            endDate: lastDate,
          });
        }
      }

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
      console.log('최신 가격 업데이트:', {
        oldPrice: latestPrice,
        newPrice: lastCandle.closePrice,
        turn: currentTurn,
        date: lastCandle.tradingDate,
        candle: lastCandle,
      });
      setLatestPrice(lastCandle.closePrice);
    } else {
      console.warn('일별 캔들 데이터가 없어 가격을 업데이트할 수 없습니다.');
    }
  };

  // 뉴스 데이터 로드
  const loadNewsData = async (turn: number) => {
    console.log(`턴 ${turn}의 뉴스 데이터 로드 시작`);
    setIsNewsLoading(true);

    // 각 턴별 시작/종료 ID 계산
    let startStockCandleId = 0;
    let endStockCandleId = 0;

    // 턴별 stockCandleId 설정
    if (turn === 1) {
      // 첫 번째 턴: 시작점부터 첫 번째 변곡점까지
      startStockCandleId = 1; // 최소값 1로 설정 (0은 유효하지 않을 수 있음)
      // 첫 번째 턴에서는 더 넓은 범위의 ID를 사용하여 데이터를 보장함
      endStockCandleId = pointStockCandleIds[0] || 500; // 첫 번째 변곡점 ID, 없으면 충분히 큰 값 사용
    } else if (turn > 1 && turn <= 4) {
      // 2~4턴: 이전 변곡점부터 현재 변곡점까지
      startStockCandleId = pointStockCandleIds[turn - 2] || 1;

      if (turn < 4) {
        // 2~3턴은 다음 변곡점까지
        endStockCandleId = pointStockCandleIds[turn - 1] || startStockCandleId + 200; // 범위 확장
      } else {
        // 4턴(마지막 턴)은 마지막 변곡점부터 끝까지
        endStockCandleId =
          pointStockCandleIds.length >= 3
            ? pointStockCandleIds[2] + 1000
            : startStockCandleId + 1000; // 충분히 큰 값
      }
    }

    console.log(`턴 ${turn} 뉴스/코멘트 ID 범위:`, {
      startStockCandleId,
      endStockCandleId,
      isLastTurn: turn === 4,
      range: `${startStockCandleId}-${endStockCandleId}`,
    });

    // ID 범위가 유효한지 확인
    if (
      startStockCandleId <= 0 ||
      endStockCandleId <= 0 ||
      startStockCandleId >= endStockCandleId
    ) {
      console.error(`턴 ${turn}의 ID 범위가 유효하지 않습니다:`, {
        startStockCandleId,
        endStockCandleId,
      });
      // 유효하지 않은 경우 기본값 설정
      startStockCandleId = turn * 100;
      endStockCandleId = (turn + 1) * 100;
      console.log(`기본값으로 설정된 ID 범위:`, { startStockCandleId, endStockCandleId });
    }

    // =============================================================
    // 1. 뉴스 코멘트(요약) API 호출 -> StockTutorialComment 컴포넌트
    // =============================================================
    console.log(
      `턴 ${turn} 뉴스 코멘트(요약) API 호출 시작 - useGetNewsComment (API: tutorial/news/comment)`,
    );
    const commentResponse = await getNewsComment
      .mutateAsync({
        companyId,
        startStockCandleId,
        endStockCandleId,
      })
      .catch((error) => {
        console.error(`턴 ${turn} 뉴스 코멘트 로드 오류:`, error);
        return null;
      });

    if (commentResponse?.result) {
      console.log(`턴 ${turn} 뉴스 코멘트(요약) 데이터 수신 성공:`, {
        result: commentResponse.result,
        length: commentResponse.result.length,
        destination: 'StockTutorialComment 컴포넌트',
      });

      // 턴별 코멘트 상태 업데이트
      setTurnComments((prev) => ({
        ...prev,
        [turn]: commentResponse.result,
      }));

      // 현재 표시할 코멘트도 업데이트 (StockTutorialComment로 전달됨)
      if (turn === currentTurn) {
        console.log(
          `현재 턴 ${turn}의 코멘트로 설정 -> StockTutorialComment 컴포넌트:`,
          commentResponse.result,
        );
        setNewsComment(commentResponse.result);
      }
    } else {
      console.warn(
        `턴 ${turn} 뉴스 코멘트(요약) 데이터 없음 - StockTutorialComment 컴포넌트에 기본값 사용됨`,
      );
    }

    // =================================================================
    // 2. 과거 뉴스 리스트(변곡점) API 호출 -> DayHistory, DayHistoryCard 컴포넌트
    // =================================================================
    console.log(
      `턴 ${turn} 과거 뉴스 리스트(변곡점) API 호출 시작 - useGetPastNews (API: tutorial/news/past)`,
    );
    const pastNewsResponse = await getPastNews
      .mutateAsync({
        companyId,
        startStockCandleId,
        endStockCandleId,
      })
      .catch((error) => {
        console.error(`턴 ${turn} 과거 뉴스 리스트 로드 오류:`, error);
        return null;
      });

    if (pastNewsResponse?.result?.NewsResponse) {
      // 날짜 기준으로 정렬하여 최신 뉴스가 먼저 표시되도록 함
      const sortedNews = [...pastNewsResponse.result.NewsResponse].sort(
        (a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime(),
      );

      console.log(`턴 ${turn} 과거 뉴스 리스트 데이터 수신 성공:`, {
        count: sortedNews.length,
        firstNews: sortedNews.length > 0 ? sortedNews[0] : null,
        destination: 'DayHistory, DayHistoryCard 컴포넌트',
      });

      // 턴별 뉴스 목록 상태 업데이트
      setTurnNewsList((prev) => ({
        ...prev,
        [turn]: sortedNews,
      }));

      // 현재 턴이면 화면에 표시할 뉴스도 업데이트 (DayHistory, DayHistoryCard로 전달됨)
      if (turn === currentTurn) {
        console.log(
          `현재 턴 ${turn}의 뉴스 목록으로 설정 -> DayHistory, DayHistoryCard 컴포넌트 (${sortedNews.length}개)`,
          sortedNews,
        );
        setPastNewsList(sortedNews);
      }
    } else if (pastNewsResponse?.result) {
      // 직접 result 배열을 사용해보기 (API 응답 구조가 변경되었을 수 있음)
      console.log(`API 응답 구조 변경 감지 - 직접 result 배열 사용:`, pastNewsResponse.result);

      // result가 배열인지 확인
      if (Array.isArray(pastNewsResponse.result)) {
        const sortedNews = [...pastNewsResponse.result].sort(
          (a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime(),
        );

        console.log(`배열 형태의 result 데이터 처리:`, {
          count: sortedNews.length,
          firstNews: sortedNews.length > 0 ? sortedNews[0] : null,
        });

        // 턴별 뉴스 목록 상태 업데이트
        setTurnNewsList((prev) => ({
          ...prev,
          [turn]: sortedNews,
        }));

        // 현재 턴이면 화면에 표시할 뉴스도 업데이트
        if (turn === currentTurn) {
          console.log(`현재 턴 ${turn}의 뉴스 목록으로 설정 (배열 형태):`, sortedNews);
          setPastNewsList(sortedNews);
        }
      }
    } else {
      console.warn(
        `턴 ${turn} 과거 뉴스 리스트 데이터 없음 - DayHistory 컴포넌트에 빈 배열 전달됨`,
      );

      // 첫 번째 턴에서 데이터가 없는 경우 샘플 뉴스 데이터 사용
      if (turn === 1) {
        const sampleNews: NewsResponse[] = [
          {
            newsId: 1001,
            newsTitle: '종목 분석 보고서: 앞으로의 성장 가능성 주목',
            newsDate: new Date().toISOString(),
            changeRate: 0.5,
            stockCandleId: 101,
          },
          {
            newsId: 1002,
            newsTitle: '시장 동향: 업계 전반적인 흐름 살펴보기',
            newsDate: new Date(Date.now() - 86400000).toISOString(), // 하루 전
            changeRate: -0.3,
            stockCandleId: 102,
          },
        ];

        console.log(`턴 ${turn} 과거 뉴스 없음 - 샘플 데이터 사용 (${sampleNews.length}개)`);

        // 턴별 뉴스 목록 상태 업데이트 (샘플 데이터)
        setTurnNewsList((prev) => ({
          ...prev,
          [turn]: sampleNews,
        }));

        // 현재 턴이면 화면에 샘플 데이터 표시
        if (turn === currentTurn) {
          setPastNewsList(sampleNews);
        }
      } else if (turn === currentTurn) {
        setPastNewsList([]);
      }
    }

    // =================================================================
    // 3. 현재 뉴스 API 호출 -> StockTutorialNews 컴포넌트
    // =================================================================
    console.log(
      `턴 ${turn} 현재 뉴스 API 호출 시작 - useGetCurrentNews (API: tutorial/news/current)`,
    );
    if (turn > 0 && turn <= pointStockCandleIds.length) {
      // 현재 턴에 해당하는 변곡점 ID 가져오기
      const pointStockCandleId = pointStockCandleIds[turn - 1];

      // 변곡점 ID가 없으면 다른 방법으로 ID 계산
      const fallbackStockCandleId =
        turn === 1
          ? endStockCandleId
          : turn <= 3
            ? pointStockCandleIds[turn - 1] || endStockCandleId
            : endStockCandleId;

      const targetStockCandleId = pointStockCandleId || fallbackStockCandleId;

      console.log(`턴 ${turn} 현재 뉴스 요청 ID:`, {
        pointStockCandleId,
        fallbackStockCandleId,
        finalId: targetStockCandleId,
        destination: 'StockTutorialNews 컴포넌트',
      });

      if (targetStockCandleId > 0) {
        const currentNewsResponse = await getCurrentNews
          .mutateAsync({
            companyId,
            stockCandleId: targetStockCandleId,
          })
          .catch((error) => {
            console.error(`턴 ${turn} 현재 뉴스 로드 오류:`, error);
            return null;
          });

        if (currentNewsResponse?.result) {
          if (turn === currentTurn) {
            console.log(`현재 턴 ${turn}의 교육용 뉴스 설정 -> StockTutorialNews 컴포넌트:`, {
              newsId: currentNewsResponse.result.newsId,
              title: currentNewsResponse.result.newsTitle,
              date: currentNewsResponse.result.newsDate,
            });
            setCurrentNews(currentNewsResponse.result);
          }
        } else {
          console.warn(
            `턴 ${turn}의 교육용 뉴스 데이터 없음 - StockTutorialNews 컴포넌트에 null 전달됨`,
          );
          if (turn === currentTurn) {
            setCurrentNews(null);
          }
        }
      }
    }

    setIsNewsLoading(false);
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
  const handleTrade = async (action: TradeAction, price: number, quantity: number) => {
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
      console.error('종료 지점 ID를 찾을 수 없습니다.');
      return;
    }

    if (!memberId) {
      console.error('멤버 ID가 유효하지 않습니다.');
      return;
    }

    // 판매 시 보유 주식 수량 확인
    if (action === 'sell' && quantity > ownedStockCount) {
      console.error('판매 오류: 보유한 주식 수량이 부족합니다.', {
        requested: quantity,
        available: ownedStockCount,
      });

      // 오류 메시지 표시 (alert 대신 더 나은 UI 사용 가능)
      alert(
        `보유한 주식 수량(${ownedStockCount}주)보다 많은 수량(${quantity}주)을 판매할 수 없습니다.`,
      );
      return;
    }

    // 관망인 경우 API 호출 없이 바로 턴 완료 처리 및 다음 턴으로 이동
    if (action === 'wait') {
      console.log('관망 선택: 바로 다음 턴으로 넘어갑니다.');

      // 거래 기록 추가
      setTrades((prev) => [
        ...prev,
        {
          action: 'wait',
          price: 0,
          quantity: 0,
          timestamp: new Date(),
          stockCandleId: endPointId,
          turnNumber: currentTurn,
        },
      ]);

      // 턴 완료 처리하여 다음 턴으로 진행 가능하게 함
      setIsCurrentTurnCompleted(true);

      // 즉시 다음 턴으로 이동 - 현재가 마지막 턴(4)이 아닌 경우에만
      if (currentTurn < 4) {
        // setTimeout으로 상태 업데이트 후 다음 턴으로 이동하도록 함
        setTimeout(() => {
          moveToNextTurn();
        }, 300);
      } else {
        // 마지막 턴이면 튜토리얼 완료 처리
        setTimeout(() => {
          completeTutorial();
        }, 300);
      }
      return;
    }

    // 백엔드가 기대하는 정확한 액션 문자열 매핑
    // "buy", "sell" 등 백엔드가 이해하는 형식으로 변환
    const actionValue = action.toLowerCase();

    // API 요청 데이터 로깅
    console.log('API 요청 데이터:', {
      memberId,
      action: actionValue,
      price,
      quantity,
      companyId,
      startStockCandleId: startPointId || endPointId,
      endStockCandleId: endPointId,
    });

    try {
      const response = await processUserAction.mutateAsync({
        memberId,
        action: actionValue,
        price,
        quantity,
        companyId,
        startStockCandleId: startPointId || endPointId,
        endStockCandleId: endPointId,
      });

      console.log('거래 응답:', response);

      const assetResults = response.result?.AssetResponse;

      // 거래 기록 추가
      // 타입 가드 함수 정의
      const isWaitAction = (act: TradeAction): act is 'wait' => act === 'wait';
      const isBuyAction = (act: TradeAction): act is 'buy' => act === 'buy';
      const isSellAction = (act: TradeAction): act is 'sell' => act === 'sell';

      setTrades((prev) => [
        ...prev,
        {
          action,
          price: isWaitAction(action) ? 0 : price,
          quantity: isWaitAction(action) ? 0 : quantity,
          timestamp: new Date(),
          stockCandleId: endPointId,
          turnNumber: currentTurn,
        },
      ]);

      // 보유 주식 수량 업데이트 - 타입 가드 사용
      if (isBuyAction(action)) {
        setOwnedStockCount((prev) => prev + quantity);
      } else if (isSellAction(action)) {
        setOwnedStockCount((prev) => Math.max(0, prev - quantity));
      }

      // 자산 정보 업데이트
      if (assetResults && assetResults.length > 0) {
        const lastAsset = assetResults[assetResults.length - 1];
        setAssetInfo(lastAsset);
        setFinalChangeRate(lastAsset.totalReturnRate);
      }

      // 모든 액션(구매/판매/관망)에 대해 턴 완료 처리
      setIsCurrentTurnCompleted(true);
    } catch (error) {
      console.error('거래 처리 오류:', error);

      // 오류의 실제 응답 내용 출력
      if (error instanceof Error) {
        console.error('오류 상세:', error.message);
        console.error('오류 스택:', error.stack);

        try {
          // @ts-expect-error - 오류 객체에서 응답 정보 추출 시도
          const errorResponse = error.response;
          if (errorResponse) {
            console.error('오류 응답:', errorResponse);
            // @ts-expect-error - ky 오류 객체에서 응답 텍스트 직접 추출
            const errorText = await error.response.text();
            console.error('오류 응답 내용:', errorText);

            // JSON 응답이면 파싱하여 사용자에게 표시
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.message) {
                alert(`거래 오류: ${errorJson.message}`);
              }
            } catch (e) {
              // JSON 파싱 오류 무시
            }
          }
        } catch (e) {
          console.error('오류 응답 추출 실패:', e);
        }
      }

      // 오류 발생해도 "관망"으로 처리하고 턴 완료
      console.log('오류 발생으로 관망 처리되어 다음 턴으로 넘어갑니다.');

      // 거래 실패해도 관망으로 기록하고 턴 완료 처리
      setTrades((prev) => [
        ...prev,
        {
          action: 'wait',
          price: 0,
          quantity: 0,
          timestamp: new Date(),
          stockCandleId: endPointId,
          turnNumber: currentTurn,
        },
      ]);

      // 오류 발생해도 무조건 턴 완료 처리하여 다음 단계로 진행될 수 있게 함
      setIsCurrentTurnCompleted(true);
    }
  };

  // 변곡점 데이터 로드
  const loadPointsData = async () => {
    try {
      // 변곡점 직접 가져오기
      const pointsUrl = `tutorial/points/top3?companyId=${companyId}`;
      console.log(`변곡점 데이터 요청: ${pointsUrl}`);

      const response = await _ky.get(pointsUrl).json();
      console.log('변곡점 원본 응답 전체:', response);

      const pointsResponse = response as ApiResponse<Point[]>;

      // 변곡점 응답 구조 확인
      console.log('파싱된 변곡점 응답:', pointsResponse);

      if (!pointsResponse?.result || pointsResponse.result.length === 0) {
        console.error('변곡점 데이터가 비어있습니다.');
        return [];
      }

      // API 응답에서 변곡점 배열을 직접 사용 (PointResponseList가 아님)
      const points = pointsResponse.result;
      console.log('변곡점 로드 성공 (원본 형태):', points);

      // 변곡점 ID 저장
      const pointIds = points.map((point) => point.stockCandleId);
      console.log('추출된 변곡점 ID 목록:', pointIds);
      setPointStockCandleIds(pointIds);

      // 각 변곡점에 대한 날짜 가져오기
      const dates = [];
      for (const point of points) {
        if (point.stockCandleId) {
          try {
            const dateUrl = `tutorial/points/date?stockCandleId=${point.stockCandleId}`;
            console.log(`변곡점 날짜 요청: ${dateUrl}`);

            const dateResponseRaw = await _ky.get(dateUrl).json();
            console.log(
              `변곡점 날짜 원본 응답 (stockCandleId=${point.stockCandleId}):`,
              dateResponseRaw,
            );

            const dateResponse = dateResponseRaw as ApiResponse<string>;

            if (dateResponse?.result) {
              console.log(
                `변곡점 날짜 값 (stockCandleId=${point.stockCandleId}):`,
                dateResponse.result,
              );
              dates.push(dateResponse.result);
            } else {
              console.error(
                `변곡점 날짜 결과 없음 (stockCandleId=${point.stockCandleId}):`,
                dateResponse,
              );
            }
          } catch (err) {
            console.error(`변곡점 날짜 요청 실패 (stockCandleId=${point.stockCandleId}):`, err);
          }
        }
      }

      console.log('수집된 모든 변곡점 날짜:', dates);

      if (dates.length > 0) {
        console.log('변곡점 날짜 로드 성공:', dates);
        setPointDates(dates);
        return dates;
      } else {
        console.error('변곡점 날짜를 가져오지 못했습니다.');
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
      // 코멘트 상태 초기화
      setNewsComment('');
      setTurnComments({
        1: '',
        2: '',
        3: '',
        4: '',
      });

      // 뉴스 목록 상태 초기화
      setPastNewsList([]);
      setTurnNewsList({
        1: [],
        2: [],
        3: [],
        4: [],
      });

      // 초기화 API 호출
      console.log(`튜토리얼 세션 초기화 요청: memberId=${memberId}, companyId=${companyId}`);
      const initResponse = await initSession.mutateAsync({ memberId, companyId });
      console.log('튜토리얼 세션 초기화 응답:', initResponse);

      // 튜토리얼 시작 상태로 설정
      setIsTutorialStarted(true);

      // 변곡점 데이터 로드 (필요한 경우)
      console.log('현재 변곡점 날짜 상태:', pointDates);
      let pointDatesLoaded = pointDates;

      // 항상 새로 로드
      console.log('변곡점 데이터 로드 시작');
      pointDatesLoaded = await loadPointsData();
      console.log('로드된 변곡점 날짜:', pointDatesLoaded);

      if (pointDatesLoaded.length < 3) {
        console.error('변곡점 날짜가 부족합니다. 하드코딩된 날짜 사용');
        // 변곡점 날짜가 없으면 하드코딩된 날짜 사용
        pointDatesLoaded = ['240701', '240801', '240901'];
        setPointDates(pointDatesLoaded);
      }

      // 첫 번째 턴 설정
      setCurrentTurn(1);

      // 첫 번째 턴에 맞는 세션 설정
      console.log('세션 설정에 사용할 날짜:', pointDatesLoaded);

      const firstSession = {
        startDate: defaultStartDate,
        endDate: pointDatesLoaded[0],
        currentPointIndex: 0,
      };

      console.log('첫 번째 세션 설정:', firstSession);
      setCurrentSession(firstSession);
      setProgress(25);

      // 첫 턴 차트 데이터 로드
      console.log('첫 턴 차트 데이터 로드 시작');
      await loadChartData(firstSession.startDate, firstSession.endDate, 1);
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

  // 초기 데이터 로드 함수 추가
  const loadInitialData = useCallback(async () => {
    if (!isTutorialStarted || currentTurn <= 0) return;

    console.log('초기 데이터 로드 시작 - 턴:', currentTurn);

    // 변곡점 데이터가 없으면 먼저 로드
    if (pointStockCandleIds.length === 0) {
      console.log('변곡점 데이터 로드 필요');
      try {
        const pointDates = await loadPointsData();
        console.log('변곡점 데이터 로드 완료:', pointDates);
      } catch (error) {
        console.error('변곡점 데이터 로드 실패:', error);
      }
    }

    // 현재 턴의 세션 계산
    const session = calculateSession(currentTurn);
    if (!session) {
      console.error('세션 계산 실패 - 턴:', currentTurn);
      return;
    }

    console.log('현재 세션 계산:', session);

    // 차트 데이터 로드
    try {
      await loadChartData(session.startDate, session.endDate, currentTurn);
      console.log('차트 데이터 로드 완료');
    } catch (error) {
      console.error('차트 데이터 로드 실패:', error);
    }

    // 뉴스 데이터 로드
    try {
      await loadNewsData(currentTurn);
      console.log('뉴스 데이터 로드 완료');
    } catch (error) {
      console.error('뉴스 데이터 로드 실패:', error);
    }
  }, [currentTurn, isTutorialStarted, pointStockCandleIds.length]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    if (isTutorialStarted && currentTurn > 0) {
      loadInitialData();
    }
  }, [loadInitialData, isTutorialStarted, currentTurn]);

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
          latestPrice={latestPrice}
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
                <button
                  onClick={() =>
                    loadPointsData().then(() => {
                      const session = calculateSession(currentTurn);
                      if (session) {
                        loadChartData(session.startDate, session.endDate, currentTurn);
                      }
                    })
                  }
                  className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white"
                >
                  다시 시도하기
                </button>
              </div>
            </div>
          ) : (
            <ChartComponent periodData={stockData || undefined} height={600} />
          )}
        </div>
        <div className="col-span-2">
          <TutorialOrderStatus
            onTrade={handleTrade}
            isSessionActive={isTutorialStarted && currentTurn > 0 && currentTurn <= 4}
            companyId={companyId}
            latestPrice={latestPrice}
            ownedStockCount={ownedStockCount}
            currentTurn={currentTurn}
            isCurrentTurnCompleted={isCurrentTurnCompleted}
          />
        </div>
      </div>
      <div>
        <div className="my-[30px]">
          <div className="mb-[15px] flex items-center justify-between">
            <h3 className={h3Style}>일간 히스토리</h3>
            {currentTurn > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-white">현재 단계:</span>
                <span className="rounded-lg bg-[#2A2A3C] px-3 py-1 font-medium text-white">
                  {currentTurn}/4 단계
                </span>
              </div>
            )}
          </div>

          {/* 
            일간 히스토리는 /api/tutorial/news/past API 호출 결과를 사용합니다.
            각 턴별로 변곡점에 해당하는 뉴스 데이터를 가져와 DayHistory 컴포넌트에 전달합니다.
            pastNewsList 데이터는 loadNewsData 함수에서 setPastNewsList을 통해 설정됩니다.
          */}

          {/* 디버깅을 위한 정보 추가 */}
          {pastNewsList.length === 0 && currentTurn > 0 && !isNewsLoading && (
            <p className="mb-4 text-sm text-gray-400">
              {currentTurn === 1
                ? '첫 번째 단계의 뉴스 데이터를 불러오는 중입니다. 잠시만 기다려주세요.'
                : `${currentTurn}단계 뉴스 데이터를 불러오는 중입니다.`}
            </p>
          )}

          {isNewsLoading && (
            <div className="flex items-center justify-center p-4">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <p className="text-sm text-gray-400">뉴스 데이터를 불러오는 중입니다...</p>
            </div>
          )}

          {pastNewsList.length > 0 && (
            <div className="mb-3">
              <p className="mb-3 text-sm text-gray-400">
                {currentTurn === 1 && '첫 번째 구간의 뉴스 히스토리입니다.'}
                {currentTurn === 2 &&
                  '첫 번째 변곡점부터 두 번째 변곡점까지의 뉴스 히스토리입니다.'}
                {currentTurn === 3 &&
                  '두 번째 변곡점부터 세 번째 변곡점까지의 뉴스 히스토리입니다.'}
                {currentTurn === 4 && '세 번째 변곡점 이후의 뉴스 히스토리입니다.'}
              </p>
            </div>
          )}

          <DayHistory news={pastNewsList} />
        </div>
      </div>
      <div>
        {/* 
          뉴스 코멘트는 /api/tutorial/news/comment API 호출 결과를 사용합니다.
          각 턴별로 변곡점에 해당하는 코멘트 데이터를 가져와 StockTutorialComment 컴포넌트에 전달합니다.
          newsComment 데이터는 loadNewsData 함수에서 setNewsComment를 통해 설정됩니다.
        */}
        <StockTutorialComment comment={newsComment} />
      </div>
      <div className="mt-[25px] grid grid-cols-6 gap-3 ">
        <div className="col-span-4">
          {/* 
            현재 뉴스는 /api/tutorial/news/current API 호출 결과를 사용합니다.
            각 턴별로 변곡점에 해당하는 현재 뉴스 데이터를 가져와 StockTutorialNews 컴포넌트에 전달합니다.
            currentNews 데이터는 loadNewsData 함수에서 setCurrentNews를 통해 설정됩니다.
          */}
          <StockTutorialNews currentNews={currentNews} companyId={companyId} />
        </div>
        <div className="col-span-2">
          <StockTutorialConclusion trades={trades} isCompleted={progress === 100} />
        </div>
      </div>
      <TutorialEndModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        changeRate={finalChangeRate}
        feedback={tutorialFeedback || ''}
        onConfirmResultClick={handleNavigateToResult}
        onEndTutorialClick={handleNavigateToSelect}
      />
    </div>
  );
};
