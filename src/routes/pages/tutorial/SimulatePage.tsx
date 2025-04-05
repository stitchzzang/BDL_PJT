import Lottie from 'lottie-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useGetCompanyProfile } from '@/api/company.api';
import { handleKyError } from '@/api/instance/errorHandler';
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
import { useAuthStore } from '@/store/useAuthStore';
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
  onMoveToNextTurn?: () => void;
  currentTurn?: number;
  isCurrentTurnCompleted?: boolean;
  buttonText?: string;
  latestPrice?: number;
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
  // API 요청 상태를 추적하기 위한 ref 추가
  const newsRequestRef = useRef<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });
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

  // 로그인 상태 및 유저 정보 가져오기
  const { userData, isLogin } = useAuthStore();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // 로그인 상태 확인 및 리다이렉트
  useEffect(() => {
    if (!isLogin) {
      toast.error('로그인 후 이용해주세요.');
      setShouldRedirect(true);
    }
  }, [isLogin]);

  // 리다이렉트 처리
  useEffect(() => {
    if (shouldRedirect) {
      navigate('/login');
    }
  }, [shouldRedirect, navigate]);

  // 인증된 사용자 ID 사용 (API 호출을 위해 null이 아닌 값으로 설정)
  const memberId = userData?.memberId || 0;

  // 실제 로그인 여부 체크를 위한 함수
  const isUserLoggedIn = () => {
    if (!isLogin || !userData?.memberId) {
      toast.error('로그인 후 이용해주세요.');
      setShouldRedirect(true);
      return false;
    }
    return true;
  };

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

  // 턴별 차트 데이터를 저장할 상태 추가
  const [turnChartData, setTurnChartData] = useState<Record<number, TutorialStockResponse | null>>({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  // 보유 주식 수량 추적 상태 추가
  const [ownedStockCount, setOwnedStockCount] = useState(0);

  // 어제부터 1년 전까지의 날짜 범위 계산
  const currentDate = new Date();
  // 어제 날짜로 설정
  currentDate.setDate(currentDate.getDate() - 1);
  const oneYearAgo = new Date(currentDate); // 어제 날짜 복사
  oneYearAgo.setFullYear(currentDate.getFullYear() - 1); // 어제로부터 1년 전

  const defaultStartDate = formatDateToYYMMDD(oneYearAgo);
  const defaultEndDate = formatDateToYYMMDD(currentDate);

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

  // 피드백 요청 상태 추가
  const [shouldFetchFeedback, setShouldFetchFeedback] = useState(false);

  // 피드백 API는 수동으로 제어
  const { data: tutorialFeedbackResponse, refetch: refetchFeedback } = useGetTutorialFeedback(
    memberId,
    {
      enabled: false, // 수동으로 제어하기 위해 비활성화
    },
  );

  const tutorialFeedback = tutorialFeedbackResponse?.result;
  const processUserAction = useProcessUserAction();
  const saveTutorialResult = useSaveTutorialResult();
  const deleteTutorialSession = useDeleteTutorialSession();
  const initSessionMutation = useInitSession();
  const getCurrentNews = useGetCurrentNews();
  const getPastNews = useGetPastNews();
  const getNewsComment = useGetNewsComment();
  const { data: companyInfo } = useGetCompanyProfile(String(companyId));

  // 현재 턴이 변경될 때마다 해당 턴의 코멘트로 업데이트
  useEffect(() => {
    if (currentTurn > 0 && currentTurn <= 4) {
      const turnComment = turnComments[currentTurn];
      setNewsComment(turnComment || '');
    }
  }, [currentTurn, turnComments]);

  // 현재 턴이 변경될 때마다 해당 턴의 뉴스 목록으로 업데이트
  useEffect(() => {
    if (currentTurn > 0 && currentTurn <= 4) {
      // 이전 턴을 포함한 모든 턴의 뉴스를 누적하여 표시
      const accumulatedNews: NewsResponse[] = [];

      // 현재 턴까지의 모든 뉴스를 수집
      for (let t = 1; t <= currentTurn; t++) {
        const turnNews = turnNewsList[t] || [];
        accumulatedNews.push(...turnNews);
      }

      // 날짜 기준으로 정렬 (최신순)
      const sortedNews = [...accumulatedNews].sort(
        (a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime(),
      );

      setPastNewsList(sortedNews);

      // 이미 API가 호출되었지만 데이터가 없는 경우 다시 로드
      // 이미 요청 중인 경우 중복 요청하지 않음
      if (
        turnNewsList[currentTurn]?.length === 0 &&
        isTutorialStarted &&
        !newsRequestRef.current[currentTurn]
      ) {
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

    // 날짜 조정 함수: 주어진 날짜에서 1일을 뺍니다.
    const subtractOneDay = (dateStr: string): string => {
      try {
        // 날짜 형식이 'YYMMDD'라고 가정
        const year = parseInt('20' + dateStr.substring(0, 2));
        const month = parseInt(dateStr.substring(2, 4)) - 1; // 0-based 월
        const day = parseInt(dateStr.substring(4, 6));

        const date = new Date(year, month, day);
        date.setDate(date.getDate() - 1);

        // 다시 'YYMMDD' 형식으로 변환
        const adjustedYear = date.getFullYear().toString().substring(2);
        const adjustedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        const adjustedDay = date.getDate().toString().padStart(2, '0');

        return adjustedYear + adjustedMonth + adjustedDay;
      } catch (e) {
        console.error('날짜 조정 중 오류 발생:', e);
        return dateStr; // 오류 시 원본 날짜 반환
      }
    };

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
        endDate: subtractOneDay(pointDates[0]), // 변곡점1 - 1일
        currentPointIndex: 0,
      },
      2: {
        startDate: pointDates[0],
        endDate: subtractOneDay(pointDates[1]), // 변곡점2 - 1일
        currentPointIndex: 1,
      },
      3: {
        startDate: pointDates[1],
        endDate: subtractOneDay(pointDates[2]), // 변곡점3 - 1일
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

  // 보유 주식 수량 초기화
  const initOwnedStockCount = async () => {
    // ownedStocks로부터 보유 주식 수량 계산
    if (trades && trades.length > 0) {
      let totalStock = 0;
      trades.forEach((trade) => {
        if (trade.action === 'buy') {
          totalStock += trade.quantity;
        } else if (trade.action === 'sell') {
          totalStock -= trade.quantity;
        }
      });
      // 음수가 되지 않도록 보정
      totalStock = Math.max(0, totalStock);
      setOwnedStockCount(totalStock);
    } else {
      setOwnedStockCount(0);
    }
  };

  // 자산 정보 초기화 방지를 위한 상태 추가
  const [turnReturnRates, setTurnReturnRates] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });

  // AI 코멘트 높이를 감지하는 상태와 레퍼런스 추가
  const [commentHeight, setCommentHeight] = useState(0);
  const commentRef = useRef<HTMLDivElement>(null);

  // AI 코멘트 높이 감지 함수
  useEffect(() => {
    if (!commentRef.current) return;

    // ResizeObserver 생성하여 AI 코멘트 컴포넌트 높이 변화 감지
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        // 최소 1px 이상일 때만 높이 업데이트 (초기화 문제 방지)
        if (height > 1) {
          setCommentHeight(height);
        }
      }
    });

    // AI 코멘트 컴포넌트 관찰 시작
    resizeObserver.observe(commentRef.current);

    // 컴포넌트 언마운트 시 관찰 중단
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // 거래 처리 함수
  const handleTrade = async (action: TradeAction, price: number, quantity: number) => {
    if (!isUserLoggedIn()) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    // 거래 처리
    try {
      if (!isTutorialStarted || currentTurn === 0 || pointStockCandleIds.length === 0) {
        return;
      }

      // 4번째 턴에서는 액션 처리하지 않음 (별도의 action이 필요 없음)
      if (currentTurn === 4) {
        alert('4단계에서는 최종 결과만 확인할 수 있습니다.');
        return;
      }

      // 현재 변곡점의 stockCandleId 가져오기
      const startPointId =
        currentTurn > 1 && pointStockCandleIds.length >= currentTurn - 1
          ? pointStockCandleIds[currentTurn - 2]
          : 0;

      // endPointId 계산 - 변곡점 - 1일로 설정 (4턴 제외)
      let endPointId = 0;
      if (pointStockCandleIds.length >= currentTurn - 1) {
        // 현재 턴의 변곡점 ID
        const turnPointId = pointStockCandleIds[currentTurn - 1];

        // 4번째 턴이 아닌 경우, 변곡점 ID에서 1을 빼서 처리 (변곡점 - 1일)
        // 이는 calculateSession과 loadNewsData 함수의 변경 사항과 일치하게 함
        endPointId = currentTurn < 4 && turnPointId > 1 ? turnPointId - 1 : turnPointId;
      }

      if (endPointId === 0) {
        return;
      }

      // 판매 수량 확인
      if (action === 'sell' && quantity > ownedStockCount) {
        alert(`보유량(${ownedStockCount}주)보다 많은 수량을 판매할 수 없습니다.`);
        return;
      }

      // 이전 자산 상태 저장 (초기화 방지용)
      const prevAvailableAsset = assetInfo.availableOrderAsset;
      const prevOwnedStockCount = ownedStockCount;
      // 이전 현재 총자산 및 수익률도 저장 (초기화 방지용)
      const prevCurrentTotalAsset = assetInfo.currentTotalAsset;
      const prevTotalReturnRate = assetInfo.totalReturnRate;

      // 현재 턴의 수익률 가져오기 (초기화 방지)
      const currentTurnReturnRate = turnReturnRates[currentTurn] || prevTotalReturnRate;

      // 관망 선택 시 API 호출 없이 턴 완료 처리
      if (action === 'wait') {
        // 관망 기록 추가
        const newTrade: TradeRecord = {
          action: 'wait',
          price: 0,
          quantity: 0,
          timestamp: new Date(),
          stockCandleId: endPointId,
          turnNumber: currentTurn,
        };

        setTrades((prev) => [...prev, newTrade]);

        // 관망 시에는 현재 자산 상태를 유지하고 턴 완료 상태만 변경
        // (실제 자산 변동은 moveToNextTurn에서 처리)
        setIsCurrentTurnCompleted(true);

        return;
      }

      // API 요청은 buy 또는 sell 액션에 대해서만 처리
      const response = await processUserAction.mutateAsync({
        memberId,
        action: action.toLowerCase(),
        price,
        quantity,
        companyId,
        startStockCandleId: startPointId,
        endStockCandleId: endPointId,
      });

      // 거래 완료 처리
      const newTrade: TradeRecord = {
        action,
        price,
        quantity,
        timestamp: new Date(),
        stockCandleId: endPointId,
        turnNumber: currentTurn,
      };

      setTrades((prev) => [...prev, newTrade]);

      // 매수/매도 로직은 기록하되 현재 보유 주식 수량만 업데이트
      // (자산 가치와 수익률 변화는 moveToNextTurn에서 처리)
      if (action === 'buy') {
        // 매수: 주문 가능 금액에서 (지정가 * 수량) 차감
        const newAvailableAsset = prevAvailableAsset - price * quantity;
        // 보유 주식 수 증가
        const newOwnedStockCount = prevOwnedStockCount + quantity;

        // 주문 가능 금액만 업데이트 (총자산 및 수익률은 다음 턴에서 계산)
        setAssetInfo((prev) => ({
          ...prev,
          availableOrderAsset: newAvailableAsset,
          // 현재 총자산 및 수익률은 이전 값 유지 (초기화 방지)
          currentTotalAsset: prevCurrentTotalAsset,
          totalReturnRate: currentTurnReturnRate,
        }));

        // 보유 주식 수량 업데이트
        setOwnedStockCount(newOwnedStockCount);
      } else if (action === 'sell') {
        // 매도: 주문 가능 금액 증가 (지정가 * 수량)
        const newAvailableAsset = prevAvailableAsset + price * quantity;
        // 보유 주식에서 해당 수량 차감
        const newOwnedStockCount = Math.max(0, prevOwnedStockCount - quantity);

        // 주문 가능 금액만 업데이트 (총자산 및 수익률은 다음 턴에서 계산)
        setAssetInfo((prev) => ({
          ...prev,
          availableOrderAsset: newAvailableAsset,
          // 현재 총자산 및 수익률은 이전 값 유지 (초기화 방지)
          currentTotalAsset: prevCurrentTotalAsset,
          totalReturnRate: currentTurnReturnRate,
        }));

        // 보유 주식 수량 업데이트
        setOwnedStockCount(newOwnedStockCount);
      }

      // 턴 완료 처리 (다음 턴에서 최종 결과 계산)
      setIsCurrentTurnCompleted(true);
    } catch (error) {
      // 오류 발생 시 처리
      if (error instanceof Error) {
        // KY 라이브러리 에러 처리
        handleKyError(error as any, '거래 처리 중 오류가 발생했습니다.');

        // 주식 수량 부족 오류인 경우 보유 주식 수량 갱신
        const errorText = await (error as any).response?.text?.().catch(() => null);
        if (errorText) {
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.code === 7105 || errorJson.message.includes('보유한 주식 수량이 부족')) {
              await initOwnedStockCount();
            }
          } catch {
            // JSON 파싱 오류 무시
          }
        }
      } else {
        // 일반 오류 처리
        alert('거래 처리 중 오류가 발생했습니다.');
      }
      // 보유 주식 수량 초기화
      await initOwnedStockCount();
    }
  };

  // 턴이 변경될 때마다 보유 주식 수량 동기화
  useEffect(() => {
    if (currentTurn > 0 && isTutorialStarted) {
      initOwnedStockCount();
    }
  }, [currentTurn, isTutorialStarted]);

  // 거래 내역이 변경될 때마다 보유 주식 수량 재계산
  useEffect(() => {
    if (trades.length > 0) {
      initOwnedStockCount();
    }
  }, [trades]);

  // 자산 정보 업데이트 함수 추가
  const updateAssetInfo = () => {
    // 현재 자산 계산
    const prevAvailableAsset = assetInfo.availableOrderAsset;
    const stockValue = ownedStockCount * latestPrice;
    const newTotalAsset = prevAvailableAsset + stockValue;
    const newReturnRate = ((newTotalAsset - 10000000) / 10000000) * 100;

    const updatedAssetInfo = {
      tradingDate: new Date().toISOString(),
      availableOrderAsset: prevAvailableAsset,
      currentTotalAsset: newTotalAsset,
      totalReturnRate: newReturnRate,
    };

    // 자산 정보 및 수익률 설정
    setAssetInfo(updatedAssetInfo);
    setFinalChangeRate(newReturnRate);
  };

  // 다음 턴으로 이동하는 함수
  const moveToNextTurn = useCallback(async () => {
    if (currentTurn < 4) {
      try {
        // 현재 턴의 마지막 가격과 상태 저장 (비동기 작업 전에 값을 보존)
        const prevTurnLastPrice = latestPrice;
        const prevAvailableOrderAsset = assetInfo.availableOrderAsset;
        const prevOwnedStock = ownedStockCount;
        const prevTotalAsset = assetInfo.currentTotalAsset;
        const prevReturnRate = assetInfo.totalReturnRate;

        // 다음 턴 번호 계산
        const nextTurn = currentTurn + 1;

        // 세션 업데이트 및 데이터 로드
        const newSession = calculateSession(nextTurn);
        if (!newSession) return;

        // 시각적인 업데이트를 위해 먼저 턴과 세션 정보 업데이트
        setCurrentTurn(nextTurn);
        setIsCurrentTurnCompleted(false);
        setCurrentSession(newSession);

        // 진행률 업데이트
        const turnToProgressMap: Record<number, number> = {
          1: 25,
          2: 50,
          3: 75,
          4: 100,
        };
        setProgress(turnToProgressMap[nextTurn]);

        // 차트 데이터 로드 - 비동기 작업 (결과를 직접 저장)
        const chartResult = await loadChartData(newSession.startDate, newSession.endDate, nextTurn);

        // 데이터 로드 완료 후 자산 정보 업데이트 (일정 시간 후)
        setTimeout(() => {
          try {
            // 로드된 차트 데이터 또는 상태에 저장된 차트 데이터 사용
            const nextTurnData = chartResult || turnChartData[nextTurn];

            // 차트 데이터가 없는 경우 - 자산 계산 기본값 설정
            if (!nextTurnData?.data || nextTurnData.data.length === 0) {
              // 변화율 0%로 가정하여 자산 계산 (실제 주가는 그대로 유지)
              const stockValue = prevOwnedStock * prevTurnLastPrice;
              const newTotalAsset = prevAvailableOrderAsset + stockValue;
              const newReturnRate = ((newTotalAsset - 10000000) / 10000000) * 100;

              // 현재 턴의 수익률 저장
              setTurnReturnRates((prev) => ({
                ...prev,
                [nextTurn]: newReturnRate,
              }));

              // 자산 정보 업데이트
              setAssetInfo({
                tradingDate: new Date().toISOString(),
                availableOrderAsset: prevAvailableOrderAsset,
                currentTotalAsset: newTotalAsset,
                totalReturnRate: newReturnRate,
              });
              setFinalChangeRate(newReturnRate);
              return;
            }

            // 다음 턴의 일봉 데이터 추출
            const dayCandles = nextTurnData.data.filter(
              (candle: StockCandle) => candle.periodType === 1,
            );

            // 일봉 데이터 없는 경우 - 자산 계산 기본값 설정
            if (dayCandles.length === 0) {
              // 변화율 0%로 가정하여 자산 계산
              const stockValue = prevOwnedStock * prevTurnLastPrice;
              const newTotalAsset = prevAvailableOrderAsset + stockValue;
              const newReturnRate = ((newTotalAsset - 10000000) / 10000000) * 100;

              // 현재 턴의 수익률 저장
              setTurnReturnRates((prev) => ({
                ...prev,
                [nextTurn]: newReturnRate,
              }));

              // 자산 정보 업데이트
              setAssetInfo({
                tradingDate: new Date().toISOString(),
                availableOrderAsset: prevAvailableOrderAsset,
                currentTotalAsset: newTotalAsset,
                totalReturnRate: newReturnRate,
              });
              setFinalChangeRate(newReturnRate);
              return;
            }

            // 날짜순 정렬
            const sortedCandles = [...dayCandles].sort(
              (a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime(),
            );

            // 요구사항에 맞는 가격 설정
            let nextTurnPrice = 0;

            // 각 턴별로 적절한 가격 설정
            if (nextTurn === 1) {
              // 1턴: 변곡점1 - 1일의 종가 (마지막 캔들)
              nextTurnPrice = sortedCandles[sortedCandles.length - 1].closePrice;
            } else if (nextTurn === 2) {
              // 2턴: 변곡점2 - 1일의 종가 (마지막 캔들)
              nextTurnPrice = sortedCandles[sortedCandles.length - 1].closePrice;
            } else if (nextTurn === 3) {
              // 3턴: 변곡점3 - 1일의 종가 (마지막 캔들)
              nextTurnPrice = sortedCandles[sortedCandles.length - 1].closePrice;
            } else if (nextTurn === 4) {
              // 4턴: 끝점의 종가 (마지막 캔들)
              nextTurnPrice = sortedCandles[sortedCandles.length - 1].closePrice;
            }

            // 가격 변경
            if (nextTurnPrice > 0) {
              setLatestPrice(nextTurnPrice);
            } else {
              // 기본값으로 마지막 캔들 사용
              nextTurnPrice = sortedCandles[sortedCandles.length - 1].closePrice;
              setLatestPrice(nextTurnPrice);
            }

            // 턴 변경에 따른 자산 정보 명시적 업데이트 (수익률 변동 포함)
            const stockValue = prevOwnedStock * nextTurnPrice;
            const newTotalAsset = prevAvailableOrderAsset + stockValue;
            const newReturnRate = ((newTotalAsset - 10000000) / 10000000) * 100;

            // 현재 턴의 수익률 저장
            setTurnReturnRates((prev) => ({
              ...prev,
              [nextTurn]: newReturnRate,
            }));

            // 자산 정보 수동 업데이트
            setAssetInfo({
              tradingDate: new Date().toISOString(),
              availableOrderAsset: prevAvailableOrderAsset,
              currentTotalAsset: newTotalAsset,
              totalReturnRate: newReturnRate,
            });
            setFinalChangeRate(newReturnRate);
          } catch (error) {
            // 오류 발생 시 이전 상태 유지하면서 기본 계산 시도
            try {
              // 변화율 0%로 가정하여 자산 계산
              const stockValue = prevOwnedStock * prevTurnLastPrice;
              const newTotalAsset = prevAvailableOrderAsset + stockValue;
              const newReturnRate = ((newTotalAsset - 10000000) / 10000000) * 100;

              // 현재 턴의 수익률 저장
              setTurnReturnRates((prev) => ({
                ...prev,
                [nextTurn]: newReturnRate,
              }));

              // 자산 정보 업데이트
              setAssetInfo({
                tradingDate: new Date().toISOString(),
                availableOrderAsset: prevAvailableOrderAsset,
                currentTotalAsset: newTotalAsset,
                totalReturnRate: newReturnRate,
              });
              setFinalChangeRate(newReturnRate);
            } catch (fallbackError) {
              // 최종 예외 처리 - 이전 상태 그대로 유지
              setAssetInfo({
                tradingDate: new Date().toISOString(),
                availableOrderAsset: prevAvailableOrderAsset,
                currentTotalAsset: prevTotalAsset,
                totalReturnRate: prevReturnRate,
              });
            }
          }
        }, 800);
      } catch (error) {
        // 오류 발생 시 처리
      }
    }
  }, [
    currentTurn,
    latestPrice,
    assetInfo.availableOrderAsset,
    assetInfo.currentTotalAsset,
    assetInfo.totalReturnRate,
    ownedStockCount,
    turnChartData,
  ]);

  // 튜토리얼 완료 처리 함수
  const completeTutorial = async () => {
    if (!isUserLoggedIn()) return;

    // 튜토리얼 완료 전 자산 정보 최종 업데이트
    updateAssetInfo();

    // 4단계에서 isCurrentTurnCompleted를 true로 설정하여 피드백 API가 호출되도록 함
    if (!isCurrentTurnCompleted) {
      setIsCurrentTurnCompleted(true);

      // 피드백 데이터가 로드될 시간 확보 (500ms)
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // 피드백 데이터가 있는지 확인하고 없으면 수동으로 로드
    if (shouldFetchFeedback || !tutorialFeedback) {
      try {
        await refetchFeedback();
        // 피드백 데이터가 로드될 시간 확보 (300ms)
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        // 오류 발생
      }
    }

    // 날짜 정보 준비
    const currentDate = new Date();
    // 어제 날짜로 설정
    currentDate.setDate(currentDate.getDate() - 1);
    const oneYearAgo = new Date(currentDate); // 어제 날짜 복사
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1); // 어제로부터 1년 전

    let saveSuccess = false;
    try {
      // 튜토리얼 결과 저장
      const saveResponse = await saveTutorialResult.mutateAsync({
        companyId,
        startMoney: 10000000,
        endMoney: assetInfo.currentTotalAsset,
        changeRate: assetInfo.totalReturnRate,
        startDate: oneYearAgo.toISOString(),
        endDate: currentDate.toISOString(),
        memberId: memberId,
      });

      saveSuccess = saveResponse.isSuccess;

      if (saveSuccess) {
        // '
      } else {
        // e
      }
    } catch (error) {
      // 오류 발생
    }

    // 세션 삭제 시도 (결과 저장 성공 여부와 관계없이)
    try {
      await deleteTutorialSession.mutateAsync(memberId);
      // '
    } catch (error) {
      // 오류 발생

      // 세션 삭제 실패 시 다시 시도
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await deleteTutorialSession.mutateAsync(memberId);
        // '
      } catch (retryError) {
        // r
      }
    }

    // 최종 수익률 설정
    setFinalChangeRate(assetInfo.totalReturnRate);

    // 종료 모달 표시
    setIsModalOpen(true);
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

    setIsChartLoading(true);
    setHasChartError(false);

    // 차트 데이터 가져오기
    const apiUrl = `stocks/${companyId}/tutorial?startDate=${startDate}&endDate=${endDate}`;

    try {
      const response = await _ky.get(apiUrl).json();
      const stockDataResponse = response as ApiResponse<TutorialStockResponse>;

      if (!stockDataResponse?.result?.data || stockDataResponse.result.data.length === 0) {
        setHasChartError(true);
        return;
      }

      const result = stockDataResponse.result;

      // 현재 턴의 데이터 저장
      setStockData(result);

      // 턴별 차트 데이터 저장 - 동기적으로 업데이트하기 위해 함수형 업데이트 사용
      setTurnChartData((prev) => {
        const updated = { ...prev, [turn]: result };
        return updated;
      });

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

      // 최신 가격 업데이트 (요구사항에 맞게 각 턴별로 적절한 종가 설정)
      const dayCandles = result.data.filter((candle: StockCandle) => candle.periodType === 1);
      if (dayCandles.length > 0) {
        const sortedCandles = [...dayCandles].sort(
          (a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime(),
        );

        let priceToShow = 0;

        // 각 턴별로 요구사항에 맞는 가격 설정
        if (turn === 1) {
          // 1턴: 변곡점1 - 1일의 종가 (마지막 캔들)
          priceToShow = sortedCandles[sortedCandles.length - 1].closePrice;
        } else if (turn === 2) {
          // 2턴: 변곡점2 - 1일의 종가 (마지막 캔들)
          priceToShow = sortedCandles[sortedCandles.length - 1].closePrice;
        } else if (turn === 3) {
          // 3턴: 변곡점3 - 1일의 종가 (마지막 캔들)
          priceToShow = sortedCandles[sortedCandles.length - 1].closePrice;
        } else if (turn === 4) {
          // 4턴: 끝점의 종가 (마지막 캔들)
          priceToShow = sortedCandles[sortedCandles.length - 1].closePrice;
        }

        // 가격 설정
        if (priceToShow > 0) {
          setLatestPrice(priceToShow);
        }
      }

      // 뉴스 데이터 로드 (API 요청이 중복되지 않도록 조건 체크)
      if (!newsRequestRef.current[turn]) {
        await loadNewsData(turn);
      }

      // 데이터 로드가 완료되었음을 나타내는 return
      return result;
    } catch (error) {
      setHasChartError(true);
      return null;
    } finally {
      setIsChartLoading(false);
    }
  };

  // 최신 가격 업데이트 함수 - 가격만 업데이트하고 자산 정보는 업데이트하지 않음
  const updateLatestPrice = (data: TutorialStockResponse, turn: number = currentTurn) => {
    const dayCandles = data.data.filter((candle: StockCandle) => candle.periodType === 1);
    if (dayCandles.length > 0) {
      // 날짜순 정렬
      const sortedCandles = [...dayCandles].sort(
        (a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime(),
      );

      let priceToShow = 0;

      // 각 턴별로 요구사항에 맞는 가격 설정
      if (turn === 1) {
        // 1턴: 변곡점1 - 1일의 종가 (마지막 캔들)
        priceToShow = sortedCandles[sortedCandles.length - 1].closePrice;
      } else if (turn === 2) {
        // 2턴: 변곡점2 - 1일의 종가 (마지막 캔들)
        priceToShow = sortedCandles[sortedCandles.length - 1].closePrice;
      } else if (turn === 3) {
        // 3턴: 변곡점3 - 1일의 종가 (마지막 캔들)
        priceToShow = sortedCandles[sortedCandles.length - 1].closePrice;
      } else if (turn === 4) {
        // 4턴: 끝점의 종가 (마지막 캔들)
        priceToShow = sortedCandles[sortedCandles.length - 1].closePrice;
      }

      // 가격이 변경된 경우에만 업데이트
      if (priceToShow > 0 && priceToShow !== latestPrice) {
        // 최신 가격만 업데이트
        setLatestPrice(priceToShow);
      }
    }
  };

  // 뉴스 API 요청 완료 후 호출되는 콜백 함수
  const handleNewsDataLoaded = useCallback((turn: number) => {
    // 해당 턴의 API 요청 상태를 false로 설정
    newsRequestRef.current = {
      ...newsRequestRef.current,
      [turn]: false,
    };
  }, []);

  // 뉴스 데이터 로드
  const loadNewsData = async (turn: number) => {
    // 이미 요청 중인 턴에 대해서는 중복 요청하지 않음
    if (newsRequestRef.current[turn]) {
      return;
    }

    // 해당 턴의 API 요청 상태를 true로 설정
    newsRequestRef.current = {
      ...newsRequestRef.current,
      [turn]: true,
    };

    setIsNewsLoading(true);

    // 각 턴별 시작/종료 ID 계산
    let startStockCandleId = 0;
    let endStockCandleId = 0;

    // 턴별 stockCandleId 설정
    if (turn === 1) {
      // 첫 번째 턴: 시작점부터 첫 번째 변곡점까지 (변곡점 - 1 기준)
      startStockCandleId = 1; // 최소값 1로 설정 (0은 유효하지 않을 수 있음)
      // 첫 번째 턴에서는 더 넓은 범위의 ID를 사용하여 데이터를 보장함
      // 첫 번째 변곡점 ID에서 약간의 여유를 둠 (데이터 누락 방지)
      endStockCandleId = pointStockCandleIds[0] > 1 ? pointStockCandleIds[0] - 1 : 500;
    } else if (turn > 1 && turn <= 4) {
      // 2~4턴: 이전 변곡점부터 현재 변곡점-1까지
      startStockCandleId = pointStockCandleIds[turn - 2] || 1;

      if (turn < 4) {
        // 2~3턴은 다음 변곡점-1까지
        endStockCandleId =
          pointStockCandleIds[turn - 1] > 1
            ? pointStockCandleIds[turn - 1] - 1
            : startStockCandleId + 200; // 범위 확장
      } else {
        // 4턴(마지막 턴)은 마지막 변곡점부터 끝까지 (여기는 변경 없음)
        endStockCandleId =
          pointStockCandleIds.length >= 3
            ? pointStockCandleIds[2] + 1000
            : startStockCandleId + 1000; // 충분히 큰 값
      }
    }

    // =============================================================
    // 1. 뉴스 코멘트(요약) API 호출 -> StockTutorialComment 컴포넌트
    // =============================================================
    try {
      const commentResponse = await getNewsComment.mutateAsync({
        companyId,
        startStockCandleId,
        endStockCandleId,
      });

      if (commentResponse?.result) {
        // 턴별 코멘트 상태 업데이트
        setTurnComments((prev) => ({
          ...prev,
          [turn]: commentResponse.result,
        }));

        // 현재 표시할 코멘트도 업데이트 (StockTutorialComment로 전달됨)
        if (turn === currentTurn) {
          setNewsComment(commentResponse.result);
        }
      }
    } catch {
      // 코멘트 로드 실패 시 무시
    }

    // =================================================================
    // 2. 과거 뉴스 리스트(변곡점) API 호출 -> DayHistory, DayHistoryCard 컴포넌트
    // =================================================================
    try {
      const pastNewsResponse = await getPastNews.mutateAsync({
        companyId,
        startStockCandleId,
        endStockCandleId,
      });

      if (pastNewsResponse?.result?.NewsResponse) {
        // 날짜 기준으로 정렬하여 최신 뉴스가 먼저 표시되도록 함
        const sortedNews = [...pastNewsResponse.result.NewsResponse].sort(
          (a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime(),
        );

        // 턴별 뉴스 목록 상태 업데이트
        setTurnNewsList((prev) => ({
          ...prev,
          [turn]: sortedNews,
        }));

        // 현재 턴이면 화면에 표시할 뉴스도 업데이트 (DayHistory, DayHistoryCard로 전달됨)
        if (turn === currentTurn) {
          setPastNewsList(sortedNews);
        }
      } else if (pastNewsResponse?.result && Array.isArray(pastNewsResponse.result)) {
        // 직접 result 배열을 사용하는 경우
        const sortedNews = [...pastNewsResponse.result].sort(
          (a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime(),
        );

        // 턴별 뉴스 목록 상태 업데이트
        setTurnNewsList((prev) => ({
          ...prev,
          [turn]: sortedNews,
        }));

        // 현재 턴이면 화면에 표시할 뉴스도 업데이트
        if (turn === currentTurn) {
          setPastNewsList(sortedNews);
        }
      } else {
        //
      }
    } catch {
      // 과거 뉴스 로드 실패 시, 샘플 데이터로 대체하거나 빈 배열 설정
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

        setTurnNewsList((prev) => ({
          ...prev,
          [turn]: sampleNews,
        }));

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

      if (targetStockCandleId > 0) {
        try {
          const currentNewsResponse = await getCurrentNews.mutateAsync({
            companyId,
            stockCandleId: targetStockCandleId,
          });

          if (currentNewsResponse?.result && turn === currentTurn) {
            setCurrentNews(currentNewsResponse.result);
          }
        } catch {
          // 현재 뉴스 로드 실패 시 처리
          if (turn === currentTurn) {
            setCurrentNews(null);
          }
        }
      }
    }

    setIsNewsLoading(false);

    // API 요청 완료 콜백 호출
    handleNewsDataLoaded(turn);
  };

  // 변곡점 데이터 로드
  const loadPointsData = async () => {
    // 변곡점 직접 가져오기
    const pointsUrl = `tutorial/points/top3?companyId=${companyId}`;

    return _ky
      .get(pointsUrl)
      .json()
      .then((response) => {
        const pointsResponse = response as ApiResponse<any>;

        if (!pointsResponse?.result || pointsResponse.result.length === 0) {
          return [];
        }

        // API 응답에서 변곡점 배열을 직접 사용 (PointResponseList가 아님)
        const points = pointsResponse.result;

        // 변곡점 ID 저장
        const pointIds = points.map((point: any) => point.stockCandleId);
        setPointStockCandleIds(pointIds);

        // 각 변곡점에 대한 날짜 가져오기
        const datePromises = points
          .filter((point: any) => point.stockCandleId)
          .map((point: any) => {
            const dateUrl = `tutorial/points/date?stockCandleId=${point.stockCandleId}`;

            return _ky
              .get(dateUrl)
              .json()
              .then((dateResponseRaw) => {
                const dateResponse = dateResponseRaw as ApiResponse<string>;
                return dateResponse?.result || null;
              })
              .catch(() => null);
          });

        return Promise.all(datePromises).then((dateResults) => {
          // null 결과 필터링
          const dates = dateResults.filter((date) => date !== null) as string[];

          if (dates.length > 0) {
            setPointDates(dates);
            return dates;
          }
          return [];
        });
      })
      .catch(() => {
        return [];
      });
  };

  // 튜토리얼 시작 함수
  const handleTutorialStart = async () => {
    if (!isUserLoggedIn()) return;

    if (isTutorialStarted) {
      return;
    }

    setIsChartLoading(true);
    setHasChartError(false);

    // 초기화 API 호출
    initSessionMutation
      .mutateAsync({ memberId, companyId })
      .then(async () => {
        // 튜토리얼 시작 상태로 설정
        setIsTutorialStarted(true);

        // 변곡점 데이터 로드 (필요한 경우)
        let pointDatesLoaded = pointDates;

        // 항상 새로 로드
        pointDatesLoaded = await loadPointsData();

        if (pointDatesLoaded.length < 3) {
          // 변곡점 날짜가 없으면 하드코딩된 날짜 사용
          pointDatesLoaded = ['240701', '240801', '240901'];
          // 하드코딩된 날짜로 설정
          setPointDates(pointDatesLoaded);
        }

        // 튜토리얼 1단계(1턴)로 설정
        setCurrentTurn(1);

        // 첫 번째 턴에 맞는 세션 설정
        const firstSession = {
          startDate: defaultStartDate,
          endDate: pointDatesLoaded[0],
          currentPointIndex: 0,
        };

        setCurrentSession(firstSession);
        setProgress(25);

        // 첫 번째 턴 차트 데이터 로드
        return loadChartData(firstSession.startDate, firstSession.endDate, 1);
      })
      .catch(() => {
        setHasChartError(true);
        toast.error('튜토리얼 초기화 중 오류가 발생했습니다.');
      })
      .finally(() => {
        setIsChartLoading(false);
      });
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

  // 4단계 완료 상태 자동 설정 (별도 useEffect로 분리하고 더 엄격한 조건 설정)
  const isInitialMount = useRef(true); // useRef를 컴포넌트 최상위 레벨로 이동

  useEffect(() => {
    // 컴포넌트 마운트 시에만 실행되는 초기화 로직
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // 정확한 조건 - 4단계이고 아직 완료되지 않았을 때만 상태 업데이트
    if (currentTurn === 4 && !isCurrentTurnCompleted) {
      // 약간의 딜레이를 두고 설정하여 다른 상태 업데이트와 충돌 방지
      const timer = setTimeout(() => {
        setIsCurrentTurnCompleted(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, isCurrentTurnCompleted]);

  // 튜토리얼 버튼 텍스트 생성 - useMemo 내부에서 상태 업데이트 하지 않도록 수정
  const getTutorialButtonText = useMemo(() => {
    if (!isTutorialStarted) {
      return '튜토리얼 시작하기';
    }

    if (isCurrentTurnCompleted) {
      return currentTurn < 4 ? '다음 턴으로' : '결과 확인하기';
    }

    // 현재 턴이 4단계이면 항상 '결과 확인하기' 표시 (상태와 무관하게)
    if (currentTurn === 4) {
      return '결과 확인하기';
    }

    return '현재 턴 진행 중...';
  }, [isTutorialStarted, isCurrentTurnCompleted, currentTurn]);

  // 초기 데이터 로드 함수 - 상태 업데이트 로직 단순화
  const loadInitialData = useCallback(async () => {
    if (!isTutorialStarted || currentTurn <= 0) return;

    // 변곡점 데이터가 없으면 먼저 로드
    if (pointStockCandleIds.length === 0) {
      try {
        await loadPointsData();
      } catch (error) {
        // 오류 무시하고 계속 진행
      }
    }

    // 현재 턴의 세션 계산
    const session = calculateSession(currentTurn);
    if (!session) {
      return;
    }

    try {
      // 보유 주식 수량 초기화 (서버 API 호출 없이 거래 내역 기반으로 계산)
      await initOwnedStockCount();

      // 차트 데이터 로드
      await loadChartData(session.startDate, session.endDate, currentTurn);

      // 차트 데이터 로드 성공 후 뉴스 데이터 로드
      await loadNewsData(currentTurn);
    } catch (error) {
      // 오류 무시하고 계속 진행
    }
  }, [isTutorialStarted, currentTurn, pointStockCandleIds.length]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    if (isTutorialStarted && currentTurn > 0) {
      // 이전 자산 상태 저장
      const prevAssetInfo = { ...assetInfo };
      const prevTurnReturnRate = turnReturnRates[currentTurn] || prevAssetInfo.totalReturnRate;

      loadInitialData().then(() => {
        // 자산 정보가 초기화되지 않도록 이전 상태 유지
        if (currentTurn > 1) {
          setAssetInfo((prev) => ({
            ...prev,
            totalReturnRate: prevTurnReturnRate,
            currentTotalAsset: prevAssetInfo.currentTotalAsset,
          }));
        }
      });
    }
  }, [loadInitialData, isTutorialStarted, currentTurn]);

  // 튜토리얼 버튼 클릭 핸들러 - useCallback으로 최적화
  const handleTutorialButtonClick = useCallback(() => {
    if (!isTutorialStarted) {
      // 튜토리얼 시작
      handleTutorialStart();
    } else if (isCurrentTurnCompleted) {
      if (currentTurn < 4) {
        // 다음 턴으로 이동
        moveToNextTurn();
      } else {
        // 4턴이고 완료되었을 때 결과 확인하기 버튼 클릭 시 completeTutorial 호출
        completeTutorial();
      }
    }
  }, [
    isTutorialStarted,
    isCurrentTurnCompleted,
    currentTurn,
    handleTutorialStart,
    moveToNextTurn,
    completeTutorial,
  ]);

  // 첫 렌더링 이후 변곡점 데이터 로드
  useEffect(() => {
    // 최초 마운트 시에만 실행
    if (initialized.current === false) {
      initialized.current = true;

      // 마운트 시 변곡점 데이터가 부족하면 로드
      if (pointDates.length < 3) {
        loadPointsData().catch(() => {
          // 오류 무시
        });
      }
    }
  }, []); // 빈 의존성 배열로 마운트 시에만 실행

  // 거래 내역 변경 시 자산 정보 업데이트
  useEffect(() => {
    if (trades.length > 0 && isTutorialStarted) {
      // 수익률 업데이트를 방지하기 위해 updateAssetInfo() 호출 제거
      // 대신 주문 가능 금액만 업데이트
      let totalStock = 0;
      trades.forEach((trade) => {
        if (trade.action === 'buy') {
          totalStock += trade.quantity;
        } else if (trade.action === 'sell') {
          totalStock -= trade.quantity;
        }
      });
      // 음수가 되지 않도록 보정
      totalStock = Math.max(0, totalStock);
      setOwnedStockCount(totalStock);
    }
  }, [trades]);

  return (
    <div className="flex h-full w-full flex-col px-6">
      <div className="flex items-center justify-between">
        <StockTutorialInfo
          companyId={companyId}
          isTutorialStarted={isTutorialStarted}
          onTutorialStart={handleTutorialStart}
          onMoveToNextTurn={handleTutorialButtonClick}
          currentTurn={currentTurn}
          isCurrentTurnCompleted={isCurrentTurnCompleted}
          buttonText={getTutorialButtonText}
          latestPrice={latestPrice}
          showButtonInInfoSection={false}
        />
      </div>
      <div className="mb-[25px] flex justify-between">
        <StockTutorialMoneyInfo
          initialAsset={10000000}
          availableOrderAsset={assetInfo.availableOrderAsset}
          currentTotalAsset={assetInfo.currentTotalAsset}
          totalReturnRate={assetInfo.totalReturnRate}
        />
        <StockProgress
          progress={progress}
          currentTurn={currentTurn}
          startDate={tutorialDateRange.startDate}
          endDate={tutorialDateRange.endDate}
          formatDateFn={formatYYMMDDToYYYYMMDD}
        />
      </div>
      <div className="grid h-full grid-cols-1 gap-2 lg:grid-cols-12">
        <div className="col-span-1 h-full lg:col-span-9">
          {!isTutorialStarted ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-[#0D192B] text-white">
              <div className="max-w-[300px]">
                <Lottie animationData={ChartAnimation} loop={true} />
              </div>
              <p className="mt-4 text-center text-xl font-medium">
                튜토리얼을 시작하여 주식 차트를 확인해보세요.
              </p>
              <p className="mt-2 text-center text-sm text-gray-400">
                4단계로 구성된 주식 튜토리얼에서 실전과 같은 투자 경험을 해볼 수 있습니다.
              </p>
            </div>
          ) : isChartLoading ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-[#0D192B] text-white">
              <div className="text-center">
                <p className="mb-3 text-xl">차트 데이터를 불러오는 중입니다...</p>
                <p className="text-sm text-gray-400">
                  일봉 데이터를 로드하고 있습니다. 잠시만 기다려주세요.
                </p>
              </div>
            </div>
          ) : hasChartError ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-[#0D192B] text-white">
              <div className="text-center">
                <p className="mb-3 text-xl">차트 데이터를 불러오는데 문제가 발생했습니다.</p>
                <p className="text-sm text-gray-400">잠시 후 다시 시도해 주세요.</p>
              </div>
            </div>
          ) : !stockData?.data?.length ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-[#0D192B] text-white">
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
            <div className="relative h-full">
              <ChartComponent periodData={stockData || undefined} />
            </div>
          )}
        </div>
        <div className="col-span-1 h-full lg:col-span-3">
          <div className="h-full">
            <TutorialOrderStatus
              onTrade={handleTrade}
              isSessionActive={isTutorialStarted && !isCurrentTurnCompleted && currentTurn < 4}
              companyId={companyId}
              latestPrice={latestPrice}
              ownedStockCount={ownedStockCount}
              currentTurn={currentTurn}
              isCurrentTurnCompleted={isCurrentTurnCompleted}
              availableOrderAsset={assetInfo.availableOrderAsset}
              isTutorialStarted={isTutorialStarted}
              onTutorialStart={handleTutorialStart}
              onMoveToNextTurn={handleTutorialButtonClick}
              initSessionPending={initSessionMutation.isPending}
              companyInfoExists={!!companyInfo}
            />
          </div>
        </div>
      </div>

      <div className="mt-[44px] grid grid-cols-6 gap-3">
        <div className="col-span-3" ref={commentRef}>
          <StockTutorialComment comment={newsComment} isTutorialStarted={isTutorialStarted} />
        </div>
        <div className="col-span-3">
          <DayHistory
            news={pastNewsList}
            height={commentHeight}
            isTutorialStarted={isTutorialStarted}
          />
        </div>
      </div>
      <div className="mt-[25px] grid grid-cols-6 gap-3">
        <div className="col-span-4">
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
