import Lottie from 'lottie-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useGetCompanyProfile } from '@/api/company.api';
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
  NewsResponse,
  NewsResponseWithThumbnail,
  StockCandle,
  TutorialStockResponse,
} from '@/api/types/tutorial';
import ChartAnimation from '@/assets/lottie/chart-animation.json';
import { DayHistory } from '@/components/stock-tutorial/day-history';
import { SimulationTour } from '@/components/stock-tutorial/simulationTour';
import { StockProgress } from '@/components/stock-tutorial/stock-progress';
import { StockTutorialComment } from '@/components/stock-tutorial/stock-tutorial-comment';
import { StockTutorialConclusion } from '@/components/stock-tutorial/stock-tutorial-conclusion';
import { StockTutorialInfo } from '@/components/stock-tutorial/stock-tutorial-info';
import { StockTutorialMoneyInfo } from '@/components/stock-tutorial/stock-tutorial-money-info';
import { StockTutorialNews } from '@/components/stock-tutorial/stock-tutorial-news';
import { TutorialOrderStatus } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status';
import { TutorialNewsModal } from '@/components/stock-tutorial/tutorial-news-modal';
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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDateToYYMMDD, formatYYMMDDToYYYYMMDD } from '@/utils/dateFormatter.ts';

// 거래 기록을 위한 타입 정의 (외부 컴포넌트와 호환되는 타입)
type TradeAction = 'buy' | 'sell' | 'hold';

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
    const isPositive = changeRate > 0;
    const isZero = changeRate === 0;
    const rateColor = isZero ? 'text-gray-400' : isPositive ? 'text-[#E5404A]' : 'text-blue-500';
    const formattedRate = `${isPositive ? '+' : ''}${changeRate.toFixed(2)}%`;

    // props 로그 추가
    useEffect(() => {
      console.log('[TutorialEndModal] props 변경:', {
        isOpen,
        changeRate,
        formattedRate,
        feedback,
      });
    }, [isOpen, changeRate, formattedRate, feedback]);

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

// 튜토리얼 페이지 이탈 방지를 위한 커스텀 훅
const usePreventLeave = (when: boolean, message: string) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPathRef = useRef(location.pathname);

  // beforeunload 이벤트 핸들러 (페이지 새로고침, 브라우저 닫기 등)
  useEffect(() => {
    if (when) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = message; // Chrome에서는 이 설정이 필요
        return message; // 다른 브라우저를 위한 리턴값
      };

      // 이벤트 리스너 등록
      window.addEventListener('beforeunload', handleBeforeUnload);

      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [when, message]);

  // 경로 변경 감지 - 뒤로가기/앞으로가기 버튼이나 다른 페이지로 이동할 때 작동
  useEffect(() => {
    // location이 변경되었고, 현재 경로가 이전 경로와 다르고, when 조건이 true일 때
    if (when && location.pathname !== currentPathRef.current) {
      // 확인 창 표시
      const confirmed = window.confirm(message);
      if (!confirmed) {
        // 사용자가 취소하면 이전 경로로 다시 이동
        navigate(currentPathRef.current, { replace: true });
        return;
      }
      // 사용자가 확인을 누르면 현재 경로를 업데이트
      currentPathRef.current = location.pathname;
    }
  }, [when, message, location.pathname, navigate]);

  // 브라우저의 뒤로가기/앞으로가기 버튼 감지를 위한 추가 이벤트 핸들러
  useEffect(() => {
    if (!when) return;

    // popstate 이벤트는 브라우저의 히스토리 엔트리가 변경될 때 발생
    const handlePopState = (e: PopStateEvent) => {
      // 사용자에게 확인 메시지 표시
      const confirmed = window.confirm(message);
      if (!confirmed) {
        // 사용자가 취소하면 현재 URL로 히스토리 엔트리 추가 (뒤로가기 방지)
        window.history.pushState(null, '', window.location.href);
        // 기본 이벤트 방지
        e.preventDefault();
      } else {
        // 사용자가 확인하면 현재 경로 업데이트
        currentPathRef.current = location.pathname;
      }
    };

    // popstate 이벤트 리스너 등록
    window.addEventListener('popstate', handlePopState);

    // history.pushState를 가로채서 현재 페이지 상태 저장
    window.history.pushState(null, '', window.location.href);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [when, message, navigate, location.pathname]);
};

export const SimulatePage = () => {
  const navigate = useNavigate();
  const { companyId: companyIdParam } = useParams<{ companyId: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 튜토리얼 완료 모달 상태 추가
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const [finalChangeRate, setFinalChangeRate] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTutorialStarted, setIsTutorialStarted] = useState(false);
  const companyId = Number(companyIdParam);

  // companyId 유효성 검사를 위한 useEffect 추가
  useEffect(() => {
    // companyId가 NaN이거나 정수가 아닌 경우 또는 범위를 벗어나는 경우 NotFoundPage로 리다이렉트
    if (isNaN(companyId) || !Number.isInteger(companyId) || companyId <= 0 || companyId > 33) {
      navigate('/error/not-found');
      return;
    }
  }, [companyId, navigate]);

  // 회사 정보 가져오기
  const {
    data: companyInfo,
    isError: isCompanyInfoError,
    isLoading: isCompanyInfoLoading,
  } = useGetCompanyProfile(String(companyId));

  // 회사 정보 존재 여부 확인 및 리다이렉트 처리
  useEffect(() => {
    // 회사 정보 로딩 중인 경우 리다이렉트하지 않음
    if (isCompanyInfoLoading) return;

    // 회사 정보 로드 후, 오류가 발생했거나 데이터가 없는 경우 404 페이지로 리다이렉트
    if (isCompanyInfoError || !companyInfo) {
      navigate('/error/not-found');
    }
  }, [companyInfo, isCompanyInfoError, isCompanyInfoLoading, companyId, navigate]);

  // 뉴스 모달 관련 상태 추가
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  // 뉴스 데이터 로딩 상태 추가
  const [isLoading, setIsLoading] = useState(false);
  // 차트 데이터 로딩 상태 추가
  const [isChartLoading, setIsChartLoading] = useState(false);

  // 페이지 이탈 방지 훅 사용
  usePreventLeave(
    isTutorialStarted || isNewsModalOpen || isLoading || isChartLoading,
    '페이지를 벗어나면 튜토리얼 단계가 초기화됩니다. 벗어나시겠습니까?',
  );

  // 투어 관련 상태 추가
  const [runTour, setRunTour] = useState(false);

  // 랜덤 로딩 메시지를 위한 상태 추가
  const [loadingMessage, setLoadingMessage] = useState('');

  // 각 턴별로 모달이 이미 표시되었는지 여부를 기록하는 상태 추가
  const [turnModalShown, setTurnModalShown] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

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
  // 차트 데이터 로딩 오류 여부 추가
  const [hasChartError, setHasChartError] = useState(false);

  // 로그인 상태 및 유저 정보 가져오기
  const { userData, isLogin } = useAuthStore();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  // 사용자 ID 가져오기
  const memberId = userData?.memberId || 0;

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
  const [assetInfo, setAssetInfo] = useState<{
    tradingDate: string;
    availableOrderAsset: number;
    currentTotalAsset: number;
    totalReturnRate: number;
  }>({
    tradingDate: new Date().toISOString(),
    availableOrderAsset: 10000000, // 1천만원 초기 자금
    currentTotalAsset: 10000000, // 초기 자산 가치
    totalReturnRate: 0, // 초기 수익률
  });

  // 자산 정보 상태 변경 감지
  useEffect(() => {
    console.log('[SimulatePage] assetInfo 업데이트됨:', assetInfo);

    // 자산 정보 유효성 검증
    if (
      typeof assetInfo.availableOrderAsset !== 'number' ||
      typeof assetInfo.currentTotalAsset !== 'number' ||
      typeof assetInfo.totalReturnRate !== 'number'
    ) {
      console.error('[SimulatePage] 유효하지 않은 자산 정보:', assetInfo);
    }

    // 상태 업데이트 후 최신 자산 정보 출력
    const timer = setTimeout(() => {
      console.log('[SimulatePage] 최신 자산 정보 확인 (setTimeout):', {
        availableOrderAsset: assetInfo.availableOrderAsset,
        currentTotalAsset: assetInfo.currentTotalAsset,
        totalReturnRate: assetInfo.totalReturnRate,
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [assetInfo]);

  // 튜토리얼 주식 데이터 상태
  const [stockData, setStockData] = useState<TutorialStockResponse | null>(null);

  // 거래 내역 상태
  const [trades, setTrades] = useState<TradeRecord[]>([]);

  // 현재 가격 상태
  const [latestPrice, setLatestPrice] = useState(0);

  // 현재 뉴스 상태
  const [currentNews, setCurrentNews] = useState<NewsResponseWithThumbnail | null>(null);

  // 턴별 현재 뉴스 상태 추가
  const [turnCurrentNews, setTurnCurrentNews] = useState<Record<number, NewsResponseWithThumbnail>>(
    {},
  );

  // 과거 뉴스 목록 상태 (턴별로 관리)
  const [turnNewsList, setTurnNewsList] = useState<Record<number, NewsResponse[]>>({});

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
  const [turnChartData, setTurnChartData] = useState<Record<number, TutorialStockResponse>>({});

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
  const [currentSession, setCurrentSession] = useState({
    startDate: '',
    endDate: '',
    currentPointIndex: 0,
  });

  // 날짜 상태 추가
  const [tutorialDateRange, setTutorialDateRange] = useState({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
  });

  // 이미 API 요청이 완료된 턴을 추적하는 ref 추가
  const loadedTurnsRef = useRef<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  // 날짜에서 하루를 빼는 유틸리티 함수
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
      return dateStr; // 오류 시 원본 날짜 반환
    }
  };

  // 턴별 날짜 표시를 위한 함수
  const getTurnDateRange = useCallback(
    (turn: number) => {
      if (turn <= 0 || pointDates.length < 3) {
        return { start: defaultStartDate, end: defaultEndDate };
      }

      switch (turn) {
        case 1:
          return {
            start: defaultStartDate,
            end: subtractOneDay(pointDates[0]),
          };
        case 2:
          return {
            start: pointDates[0],
            end: subtractOneDay(pointDates[1]),
          };
        case 3:
          return {
            start: pointDates[1],
            end: subtractOneDay(pointDates[2]),
          };
        case 4:
          return {
            start: pointDates[2],
            end: defaultEndDate,
          };
        default:
          return { start: defaultStartDate, end: defaultEndDate };
      }
    },
    [pointDates, defaultStartDate, defaultEndDate],
  );

  // 날짜 범위에 따른 세션 설정
  const calculateSession = useCallback(
    (turn: number) => {
      if (turn <= 0 || pointDates.length < 3) return null;

      // 턴에 따른 구간 설정
      let startDate = '';
      let endDate = '';

      switch (turn) {
        case 1:
          // 1턴: 시작점 ~ 변곡점1 - 1일
          startDate = defaultStartDate;
          endDate = subtractOneDay(pointDates[0]);
          break;
        case 2:
          // 2턴: 변곡점1 ~ 변곡점2 - 1일
          startDate = pointDates[0];
          endDate = subtractOneDay(pointDates[1]);
          break;
        case 3:
          // 3턴: 변곡점2 ~ 변곡점3 - 1일
          startDate = pointDates[1];
          endDate = subtractOneDay(pointDates[2]);
          break;
        case 4:
          // 4턴: 변곡점3 ~ 끝점
          startDate = pointDates[2];
          endDate = defaultEndDate;
          break;
        default:
          return null;
      }

      console.log(`[턴 ${turn}] 세션 계산: ${startDate} ~ ${endDate}`);

      return {
        startDate,
        endDate,
        currentPointIndex: turn - 1,
      };
    },
    [pointDates, defaultStartDate, defaultEndDate],
  );

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
  const initSession = useInitSession();
  const getCurrentNews = useGetCurrentNews();
  const getPastNews = useGetPastNews();
  const getNewsComment = useGetNewsComment();

  // 현재 턴이 변경될 때마다 해당 턴의 코멘트로 업데이트
  useEffect(() => {
    if (currentTurn > 0 && currentTurn <= 4) {
      const turnComment = turnComments[currentTurn];
      setNewsComment(turnComment || '');
    }
  }, [currentTurn, turnComments]);

  // 현재 턴이 변경될 때마다 해당 턴의 뉴스 목록으로 업데이트
  useEffect(() => {
    // 튜토리얼이 시작되지 않았거나 현재 턴이 유효하지 않으면 실행하지 않음
    if (!isTutorialStarted || currentTurn <= 0 || currentTurn > 4) {
      return;
    }

    // 이미 로드된 턴인 경우 재로드하지 않음
    if (loadedTurnsRef.current[currentTurn]) {
      return;
    }

    // API 요청 중인 경우 중복 요청 방지
    if (newsRequestRef.current[currentTurn]) {
      return;
    }

    // 변곡점 데이터가 필요한 경우만 로드
    if (pointStockCandleIds.length === 0) {
      loadPointsData().then(() => {
        // 변곡점 데이터 로드 후 뉴스 데이터 로드
        if (!newsRequestRef.current[currentTurn] && !loadedTurnsRef.current[currentTurn]) {
          loadNewsData(currentTurn);
        }
      });
    } else {
      // 변곡점 데이터가 이미 있는 경우 바로 뉴스 데이터 로드
      loadNewsData(currentTurn);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTurn, isTutorialStarted]); // 의존성 배열 최소화

  // 뉴스 모달 표시를 위한 useEffect 추가
  useEffect(() => {
    // 1, 2, 3턴 시작 시에만 모달 표시
    if (isTutorialStarted && (currentTurn === 1 || currentTurn === 2 || currentTurn === 3)) {
      // 이미 해당 턴에 모달을 표시한 적이 있으면 표시하지 않음
      if (turnModalShown[currentTurn]) {
        return;
      }

      const timer = setTimeout(() => {
        // 해당 턴의 교육용 뉴스가 있을 때만 모달 표시
        if (turnCurrentNews[currentTurn] && Object.keys(turnCurrentNews[currentTurn]).length > 0) {
          setIsNewsModalOpen(true);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentTurn, isTutorialStarted, turnCurrentNews, turnModalShown]);

  // 뉴스 데이터가 로드된 후 화면 업데이트
  useEffect(() => {
    if (!isTutorialStarted || currentTurn <= 0 || currentTurn > 4) {
      return;
    }

    // 1. 현재 턴의 코멘트로 업데이트
    const turnComment = turnComments[currentTurn];
    if (turnComment) {
      setNewsComment(turnComment);
    }

    // 2. 현재 턴의 교육용 뉴스로 업데이트
    const currentTurnNews = turnCurrentNews[currentTurn];
    if (currentTurnNews && Object.keys(currentTurnNews).length > 0) {
      setCurrentNews(currentTurnNews);

      // 교육용 뉴스가 로드되면 모달 표시 (중복 표시 방지)
      if (
        (currentTurn === 1 || currentTurn === 2 || currentTurn === 3) &&
        !isNewsModalOpen &&
        !turnModalShown[currentTurn]
      ) {
        // 지연 시간 단축 (500ms → 200ms)
        setTimeout(() => {
          setIsNewsModalOpen(true);
        }, 200);
      }
    } else if (currentTurn === 1 || currentTurn === 2 || currentTurn === 3 || currentTurn === 4) {
      // 데이터가 없을 경우 null로 설정하여 기본 메시지 표시 (특정 턴에서만)
      setCurrentNews(null);
    }

    // 3. 현재 턴까지의 모든 뉴스 누적 (구간별)
    const accumulatedNews: NewsResponse[] = [];
    const uniqueNewsMap = new Map();

    // 현재 턴까지의 모든 뉴스를 누적
    for (let t = 1; t <= currentTurn; t++) {
      const turnNews = turnNewsList[t] || [];

      // 현재 턴의 뉴스 중 중복되지 않은 것만 추가
      turnNews.forEach((newsItem) => {
        if (newsItem.newsId && !uniqueNewsMap.has(newsItem.newsId)) {
          uniqueNewsMap.set(newsItem.newsId, newsItem);
          accumulatedNews.push(newsItem);
        } else if (!newsItem.newsId) {
          accumulatedNews.push(newsItem);
        }
      });
    }

    // 날짜 기준으로 정렬 (최신순)
    if (accumulatedNews.length > 0) {
      const sortedNews = [...accumulatedNews].sort(
        (a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime(),
      );
      setPastNewsList(sortedNews);
    } else if (currentTurn > 0) {
      // 뉴스가 없을 경우 빈 배열로 설정 (턴이 진행 중인 경우만)
      setPastNewsList([]);
    }

    // 데이터가 있으면 로드 완료 표시
    const hasTurnNewsData = turnNewsList[currentTurn]?.length > 0;
    const hasTurnCurrentNews = currentTurnNews && Object.keys(currentTurnNews).length > 0;
    const hasTurnComment = turnComment && turnComment.length > 0;

    if (hasTurnNewsData || hasTurnCurrentNews || hasTurnComment) {
      loadedTurnsRef.current = {
        ...loadedTurnsRef.current,
        [currentTurn]: true,
      };
    }
  }, [
    turnNewsList,
    turnCurrentNews,
    turnComments,
    currentTurn,
    isTutorialStarted,
    isNewsModalOpen,
    turnModalShown,
  ]);

  // 보유 주식 수량 초기화 함수
  const initOwnedStockCount = async () => {
    if (trades.length > 0) {
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
    // 셀렉트박스 초기값이 아닌지 확인 (0은 초기값)
    if (quantity === 0) {
      alert('수량을 선택해주세요.');
      return;
    }

    try {
      // 거래 전에 차트 데이터 확인
      if (!stockData || !stockData.data) {
        alert('차트 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // 일봉 데이터만 필터링 (periodType: 1 = 일봉)
      const dayCandles = stockData.data
        .filter((candle) => candle.periodType === 1)
        .sort((a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime());

      if (dayCandles.length === 0) {
        alert('차트 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // 현재 턴의 세션 계산 (구간 정보)
      const session = calculateSession(currentTurn);
      if (!session) {
        alert('세션 정보를 가져올 수 없습니다.');
        return;
      }

      // StockCandleId 범위 가져오기 - getStockCandleIdRange 함수 사용
      const { startStockCandleId, endStockCandleId } = getStockCandleIdRange(currentTurn);

      console.log(
        `[handleTrade] 거래 요청 - 턴: ${currentTurn}, 액션: ${action}, 가격: ${price}, 수량: ${quantity}, 범위: ${startStockCandleId}~${endStockCandleId}`,
      );

      // 매수 가능 금액 확인
      if (action === 'buy') {
        const totalPrice = price * quantity;
        if (totalPrice > assetInfo.availableOrderAsset) {
          alert(
            `매수 가능 금액(${assetInfo.availableOrderAsset.toLocaleString()}원)을 초과했습니다.`,
          );
          return;
        }
      }

      // 판매 수량 확인
      if (action === 'sell' && quantity > ownedStockCount) {
        alert(`보유량(${ownedStockCount}주)보다 많은 수량을 판매할 수 없습니다.`);
        return;
      }

      // 관망 선택 시 API 호출
      if (action === 'hold') {
        // API 요청 처리
        const response = await processUserAction.mutateAsync({
          memberId,
          action: 'hold',
          price: 0,
          quantity: 0,
          companyId,
          startStockCandleId,
          endStockCandleId,
        });

        // API 응답 처리하지만 UI 업데이트는 하지 않음 (다음 턴으로 넘어갈 때 적용)
        if (response.isSuccess && response.result) {
          // 배열인지 확인
          const assetResponses = Array.isArray(response.result)
            ? response.result
            : response.result.AssetResponse || [];

          if (assetResponses.length > 0) {
            // 최신 자산 정보 가져오기 (마지막 항목)
            const latestAsset = assetResponses[assetResponses.length - 1];

            // 필수 필드 존재 여부 확인
            if (
              latestAsset &&
              'availableOrderAsset' in latestAsset &&
              'currentTotalAsset' in latestAsset &&
              'totalReturnRate' in latestAsset &&
              'tradingDate' in latestAsset
            ) {
              // 자산 정보 임시 저장 (다음 턴에서 사용)
              tempAssetInfoRef.current = {
                tradingDate: latestAsset.tradingDate,
                availableOrderAsset: latestAsset.availableOrderAsset,
                currentTotalAsset: latestAsset.currentTotalAsset,
                totalReturnRate: latestAsset.totalReturnRate,
              };
            }
          }
        }

        // 관망 거래 기록 추가
        const newTrade: TradeRecord = {
          action: 'hold',
          price: 0,
          quantity: 0,
          timestamp: new Date(),
          stockCandleId: endStockCandleId,
          turnNumber: currentTurn,
        };

        setTrades((prev) => [...prev, newTrade]);

        // 턴 완료 처리
        setIsCurrentTurnCompleted(true);
        return;
      }

      // buy 또는 sell 액션 처리
      const response = await processUserAction.mutateAsync({
        memberId,
        action: action.toLowerCase(),
        price,
        quantity,
        companyId,
        startStockCandleId,
        endStockCandleId,
      });

      // API 응답 처리하지만 UI 업데이트는 하지 않음 (다음 턴으로 넘어갈 때 적용)
      if (response.isSuccess && response.result) {
        // 배열인지 확인
        const assetResponses = Array.isArray(response.result)
          ? response.result
          : response.result.AssetResponse || [];

        if (assetResponses.length > 0) {
          // 최신 자산 정보 가져오기 (마지막 항목)
          const latestAsset = assetResponses[assetResponses.length - 1];

          // 필수 필드 존재 여부 확인
          if (
            latestAsset &&
            'availableOrderAsset' in latestAsset &&
            'currentTotalAsset' in latestAsset &&
            'totalReturnRate' in latestAsset &&
            'tradingDate' in latestAsset
          ) {
            // 자산 정보 임시 저장 (다음 턴에서 사용)
            tempAssetInfoRef.current = {
              tradingDate: latestAsset.tradingDate,
              availableOrderAsset: latestAsset.availableOrderAsset,
              currentTotalAsset: latestAsset.currentTotalAsset,
              totalReturnRate: latestAsset.totalReturnRate,
            };
          }
        }
      }

      // 새 거래 기록 추가
      const newTrade: TradeRecord = {
        action,
        price,
        quantity,
        timestamp: new Date(),
        stockCandleId: endStockCandleId,
        turnNumber: currentTurn,
      };

      setTrades((prev) => [...prev, newTrade]);

      // 거래 성공 안내 (매수/매도에 따라 다른 메시지)
      if (action === 'buy') {
        toast.success(`${price.toLocaleString()}원에 ${quantity}주 매수 완료`);
      } else if (action === 'sell') {
        toast.success(`${price.toLocaleString()}원에 ${quantity}주 매도 완료`);
      }

      // 턴 완료 처리
      setIsCurrentTurnCompleted(true);
    } catch (error) {
      console.error('[handleTrade] 거래 처리 중 오류:', error);
      // 오류 발생 시 알림 표시
      toast.error('거래 처리 중 오류가 발생했습니다.');
    }
  };

  // 턴이 변경될 때마다 보유 주식 수량 동기화
  useEffect(() => {
    if (currentTurn > 0 && isTutorialStarted) {
      initOwnedStockCount();
    }
  }, [currentTurn, isTutorialStarted, initOwnedStockCount]);

  // 거래 내역이 변경될 때마다 보유 주식 수량 재계산
  useEffect(() => {
    if (trades.length > 0 && isTutorialStarted) {
      // 현재 턴의 거래만 필터링
      const currentTurnTrades = trades.filter((trade) => trade.turnNumber === currentTurn);

      // 보유 주식 수량 계산
      let totalStock = 0;

      // 이전 턴까지의 거래 결과 합산
      if (currentTurn > 1) {
        const previousTurnTrades = trades.filter((trade) => trade.turnNumber < currentTurn);
        previousTurnTrades.forEach((trade) => {
          if (trade.action === 'buy') {
            totalStock += trade.quantity;
          } else if (trade.action === 'sell') {
            totalStock -= trade.quantity;
          }
        });
      }

      // 현재 턴의 거래 결과 합산
      currentTurnTrades.forEach((trade) => {
        if (trade.action === 'buy') {
          totalStock += trade.quantity;
        } else if (trade.action === 'sell') {
          totalStock -= trade.quantity;
        }
      });

      // 음수가 되지 않도록 보정
      totalStock = Math.max(0, totalStock);
      setOwnedStockCount(totalStock);

      // 자산 정보 업데이트 로그
      console.log(`[거래 내역 업데이트] 현재 턴: ${currentTurn}, 총 보유 주식: ${totalStock}주`);
    }
  }, [isTutorialStarted, trades, currentTurn]);

  // 자산 정보 업데이트 함수 추가
  const updateAssetInfo = async () => {
    console.log('[updateAssetInfo] 시작, 현재 턴:', currentTurn);

    // 현재 자산 정보를 현재 턴의 결과로 저장
    turnAssetInfoRef.current = {
      ...turnAssetInfoRef.current,
      [currentTurn]: { ...assetInfo },
    };

    console.log(
      `[updateAssetInfo] 턴 ${currentTurn} 자산 정보 저장:`,
      turnAssetInfoRef.current[currentTurn],
    );

    // 마지막 턴(4턴)일 경우 최종 수익률 설정
    if (currentTurn === 4) {
      console.log('[updateAssetInfo] 마지막 턴, 최종 수익률 설정:', assetInfo.totalReturnRate);
      setFinalChangeRate(assetInfo.totalReturnRate);
    }
  };

  // 일시적으로 moveToNextTurn을 일반 함수로 선언 (loadChartData 의존성 제거)
  const moveToNextTurn = async () => {
    if (currentTurn < 4) {
      try {
        // 다음 턴 번호 계산
        const nextTurn = currentTurn + 1;

        // 모든 skeleton 표시
        setIsChartSkeleton(true);
        setIsNewsSkeleton(true);
        setIsCommentSkeleton(true);
        setIsHistorySkeleton(true);
        setIsConclusionSkeleton(true);

        // 세션 업데이트 및 데이터 로드
        const newSession = calculateSession(nextTurn);
        if (!newSession) return;

        console.log(
          `[moveToNextTurn] 턴 ${currentTurn}에서 턴 ${nextTurn}으로 이동 전 자산 정보 업데이트`,
        );

        // 이전 턴에 완료된 거래의 자산 정보를 현재 표시할 자산 정보로 적용
        // (중요) 각 턴에서의 행동과 거래체결에 대한 수익률은 다음 턴에 나타내야 함
        if (tempAssetInfoRef.current) {
          console.log(
            `[moveToNextTurn] 이전 턴(${currentTurn})에서 저장한 임시 자산 정보 적용:`,
            tempAssetInfoRef.current,
          );

          // 저장된 자산 정보로 UI 업데이트
          setAssetInfo(tempAssetInfoRef.current);

          // 임시 자산 정보도 턴 정보에 저장
          turnAssetInfoRef.current = {
            ...turnAssetInfoRef.current,
            [currentTurn]: { ...tempAssetInfoRef.current },
          };

          // 임시 자산 정보 초기화
          tempAssetInfoRef.current = null;
        }

        // 시각적인 업데이트를 위해 턴과 세션 정보 업데이트
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

        // 현재 턴에 맞는 stockCandleId 범위를 사용하여 자산 정보 연동 보장
        // stockCandleId 범위:
        // 2턴: 변곡점1 ~ (변곡점2 - 1)
        // 3턴: 변곡점2 ~ (변곡점3 - 1)
        // 4턴: 변곡점3 ~ 전체 진행기간의 끝점
        const { startStockCandleId, endStockCandleId } = getStockCandleIdRange(nextTurn);
        console.log(
          `[moveToNextTurn] 턴 ${nextTurn} 자산 정보 계산 stockCandleId 범위: ${startStockCandleId} ~ ${endStockCandleId}`,
        );

        // 차트 데이터 로드 - 누적 방식 (시작부터 현재 턴의 끝까지)
        const chartResult = await loadChartData(defaultStartDate, newSession.endDate, nextTurn);

        if (!chartResult || !chartResult.data || chartResult.data.length === 0) {
          throw new Error('차트 데이터를 불러오는 중 오류가 발생했습니다.');
        }

        // 일봉 데이터 필터링 및 정렬 (시간순)
        const dayCandles = chartResult.data
          .filter((candle: StockCandle) => candle.periodType === 1)
          .sort((a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime());

        if (dayCandles.length === 0) {
          throw new Error('일봉 데이터가 없습니다.');
        }

        // 시작점과 끝점의 stockCandleId 로깅 (디버깅용)
        const firstCandleId = dayCandles[0].stockCandleId;
        const lastCandleId = dayCandles[dayCandles.length - 1].stockCandleId;
        console.log(
          `[턴 ${nextTurn} 차트 누적 데이터] 시작 stockCandleId: ${firstCandleId}, 끝 stockCandleId: ${lastCandleId}`,
        );

        // 현재 턴의 구간 계산
        if (!newSession) return;

        // 현재 턴에 해당하는 구간만 필터링
        const turnSpecificCandles = dayCandles.filter((candle) => {
          const candleDate = formatDateToYYMMDD(new Date(candle.tradingDate));
          return candleDate >= newSession.startDate && candleDate <= newSession.endDate;
        });

        // 턴 차트 데이터 저장
        setTurnChartData((prev) => ({
          ...prev,
          [nextTurn]: {
            ...chartResult,
            turnData: turnSpecificCandles,
          },
        }));

        // 뉴스 데이터 로드 - 차트 로드와 병렬로 처리
        setTimeout(async () => {
          try {
            await loadNewsData(nextTurn);
          } catch (error) {
            console.error(`[moveToNextTurn] 뉴스 데이터 로드 오류:`, error);
            setIsNewsSkeleton(false);
            setIsCommentSkeleton(false);
            setIsHistorySkeleton(false);
            setIsConclusionSkeleton(false);
          }
        }, 300);

        // 스켈레톤 해제 타이머
        const timer = setTimeout(() => {
          setIsChartSkeleton(false);
        }, 1000);

        return () => clearTimeout(timer);
      } catch (error) {
        console.error(`[moveToNextTurn] 오류:`, error);
        setIsChartSkeleton(false);
        setIsNewsSkeleton(false);
        setIsCommentSkeleton(false);
        setIsHistorySkeleton(false);
        setIsConclusionSkeleton(false);
      }
    }
  };

  // 튜토리얼 시작 함수
  const handleTutorialStart = async () => {
    // 이미 진행 중인 경우 중복 실행 방지
    if (isTutorialStarted || isLoading) return;

    try {
      // 로딩 상태 설정
      setIsLoading(true);

      // 기존 튜토리얼 세션 삭제
      await deleteTutorialSession.mutateAsync(memberId);

      // 세션 초기화 요청
      const initResult = await initSession.mutateAsync({
        companyId,
        memberId,
      });

      if (!initResult.isSuccess) {
        toast.error('튜토리얼 초기화에 실패했습니다.');
        setIsLoading(false);
        return;
      }

      // 전체 일봉 데이터 로드 (튜토리얼 시작 시 한 번만 로드)
      const allCandles = await loadAllTutorialCandles(companyId, defaultStartDate, defaultEndDate);
      setAllStockCandles(allCandles);

      // 변곡점 데이터 로드
      await loadPointsData();

      // 튜토리얼 상태 업데이트
      setIsTutorialStarted(true);
      setCurrentTurn(1);
      setProgress(25);

      // 첫 번째 턴의 세션 계산
      const session = calculateSession(1);
      if (session) {
        setCurrentSession(session);
      }

      // 로딩 상태 해제
      setIsLoading(false);

      // 초기 데이터 로드
      setTimeout(() => {
        loadInitialData();
      }, 500);
    } catch (error) {
      console.error('[handleTutorialStart] 오류:', error);
      toast.error('튜토리얼 시작 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // 튜토리얼 완료 처리 함수
  const completeTutorial = async () => {
    // 최종 턴(4턴)의 자산 정보 확인
    console.log('[completeTutorial] 튜토리얼 완료 처리 시작, 4턴 최종 자산 정보:', assetInfo);

    try {
      // 모든 skeleton 표시
      setIsChartSkeleton(true);
      setIsNewsSkeleton(true);
      setIsCommentSkeleton(true);
      setIsHistorySkeleton(true);
      setIsConclusionSkeleton(true);

      // 4턴 거래 내역 확인
      const lastTurnTrades = trades.filter((trade) => trade.turnNumber === 4);

      // StockCandleId 범위 가져오기 - getStockCandleIdRange 함수 사용
      const { startStockCandleId, endStockCandleId } = getStockCandleIdRange(4);

      console.log(
        `[completeTutorial] 최종 자산 계산 stockCandleId 범위: ${startStockCandleId} ~ ${endStockCandleId}`,
      );

      // 4턴의 마지막 거래 액션 확인
      let actualAction: TradeAction = 'hold';
      let actualPrice = 0;
      let actualQuantity = 0;

      if (lastTurnTrades.length > 0) {
        // 4턴의 마지막 거래 사용
        const lastTrade = lastTurnTrades[lastTurnTrades.length - 1];
        actualAction = lastTrade.action;
        actualPrice = lastTrade.price;
        actualQuantity = lastTrade.quantity;
      }

      console.log(
        `[completeTutorial] 최종 자산 정보 API 요청 - 액션: ${actualAction}, 가격: ${actualPrice}, 수량: ${actualQuantity}, 범위: ${startStockCandleId}~${endStockCandleId}`,
      );

      // 최종 API 요청
      const response = await processUserAction.mutateAsync({
        memberId,
        action: actualAction.toLowerCase(),
        price: actualPrice,
        quantity: actualQuantity,
        companyId,
        startStockCandleId,
        endStockCandleId,
      });

      // 마지막 자산 정보 업데이트
      if (response.isSuccess && response.result) {
        // 배열인지 확인
        const assetResponses = Array.isArray(response.result)
          ? response.result
          : response.result.AssetResponse || [];

        if (assetResponses.length > 0) {
          // 최신 자산 정보 가져오기 (마지막 항목)
          const latestAsset = assetResponses[assetResponses.length - 1];

          // 필수 필드 존재 여부 확인
          if (
            latestAsset &&
            'availableOrderAsset' in latestAsset &&
            'currentTotalAsset' in latestAsset &&
            'totalReturnRate' in latestAsset &&
            'tradingDate' in latestAsset
          ) {
            // 최종 수익률 설정
            const finalRate = latestAsset.totalReturnRate;
            setFinalChangeRate(finalRate);

            // 튜토리얼 피드백 가져오기
            try {
              const feedbackResponse = await refetchFeedback();
              console.log('[completeTutorial] 튜토리얼 피드백:', feedbackResponse);
            } catch (error) {
              console.error('[completeTutorial] 튜토리얼 피드백 로드 오류:', error);
            }

            // 튜토리얼 결과 저장
            try {
              await saveTutorialResult.mutateAsync({
                companyId,
                memberId,
                startMoney: 10000000, // 1천만원 (초기금액)
                endMoney: latestAsset.currentTotalAsset,
                changeRate: finalRate,
                startDate: defaultStartDate,
                endDate: defaultEndDate,
              });
              console.log('[completeTutorial] 튜토리얼 결과 저장 완료');
            } catch (error) {
              console.error('[completeTutorial] 튜토리얼 결과 저장 오류:', error);
            }

            // 결과 모달 표시
            setIsModalOpen(true);
            setIsAnyModalOpen(true);
          }
        }
      }

      // 모든 스켈레톤 숨기기
      setIsChartSkeleton(false);
      setIsNewsSkeleton(false);
      setIsCommentSkeleton(false);
      setIsHistorySkeleton(false);
      setIsConclusionSkeleton(false);
    } catch (error) {
      console.error('[completeTutorial] 오류:', error);
      // 오류 처리
      toast.error('튜토리얼 완료 처리 중 오류가 발생했습니다.');

      // 모든 스켈레톤 숨기기
      setIsChartSkeleton(false);
      setIsNewsSkeleton(false);
      setIsCommentSkeleton(false);
      setIsHistorySkeleton(false);
      setIsConclusionSkeleton(false);
    }
  };

  // 변곡점 데이터 로드
  const loadPointsData = async () => {
    // 변곡점 직접 가져오기
    const pointsUrl = `tutorial/points/top3?companyId=${companyId}`;

    try {
      const response = await _ky.get(pointsUrl).json();
      const pointsResponse = response as ApiResponse<any>;

      if (!pointsResponse?.result || pointsResponse.result.length === 0) {
        return [];
      }

      // API 응답에서 변곡점 배열을 직접 사용
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

      const dateResults = await Promise.all(datePromises);
      // null 결과 필터링
      const dates = dateResults.filter((date) => date !== null) as string[];

      if (dates.length > 0) {
        setPointDates(dates);
        return dates;
      }

      // 변곡점 날짜가 없으면 하드코딩된 날짜 사용 (최후의 대안)
      const fallbackDates = ['240701', '240801', '240901'];
      setPointDates(fallbackDates);
      return fallbackDates;
    } catch (error) {
      // 오류 시 하드코딩된 날짜 사용
      const fallbackDates = ['240701', '240801', '240901'];
      setPointDates(fallbackDates);
      return fallbackDates;
    }
  };

  // 뉴스 데이터 로드
  const loadNewsData = async (turn: number) => {
    try {
      // 이미 로드 중이거나 로드 완료된 턴은 중복 로드하지 않음
      if (newsRequestRef.current[turn] || loadedTurnsRef.current[turn]) {
        console.log(`[loadNewsData] 턴 ${turn} 데이터 이미 로드 중이거나 완료됨, 중복 로드 방지`);
        return;
      }

      // 로드 상태 업데이트
      newsRequestRef.current = {
        ...newsRequestRef.current,
        [turn]: true,
      };

      console.log(`[loadNewsData] 턴 ${turn} 뉴스 데이터 로드 시작`);

      // 차트 데이터 확인 로직 제거 - 차트 데이터 없이도 뉴스를 로드할 수 있도록 수정
      // 현재 턴의 세션 계산
      const session = calculateSession(turn);
      if (!session) {
        console.warn(`[loadNewsData] 턴 ${turn}의 세션 계산 실패, 기본값 사용`);
        // 세션 계산 실패 시 기본값으로 진행 (오류를 던지지 않음)
      }

      // 시작 및 종료 StockCandleId 설정
      const range = getStockCandleIdRange(turn);
      const { startStockCandleId, endStockCandleId } = range;

      console.log(`[loadNewsData] 턴 ${turn} stockCandleId 범위:`, {
        startStockCandleId,
        endStockCandleId,
        pointStockCandleIds: pointStockCandleIds.length > 0 ? pointStockCandleIds : '없음',
        hasTurnData: !!turnChartData[turn]?.data,
        turnDataLength: turnChartData[turn]?.data?.length || 0,
      });

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
      } catch (error) {
        console.error(`[loadNewsData] 코멘트 데이터 로드 오류:`, error);
      }

      // 코멘트 스켈레톤 상태 해제
      setIsCommentSkeleton(false);

      // =================================================================
      // 2. 과거 뉴스 리스트(변곡점) API 호출 -> DayHistory, DayHistoryCard 컴포넌트
      // =================================================================
      try {
        const pastNewsResponse = await getPastNews.mutateAsync({
          companyId,
          startStockCandleId,
          endStockCandleId,
        });

        // 응답 구조 확인 (API 변경 가능성 대비)
        let newsData: NewsResponse[] = [];

        if (
          pastNewsResponse?.result?.NewsResponse &&
          Array.isArray(pastNewsResponse.result.NewsResponse)
        ) {
          // 기존 예상 구조: result.NewsResponse 배열
          newsData = pastNewsResponse.result.NewsResponse;
        } else if (pastNewsResponse?.result && Array.isArray(pastNewsResponse.result)) {
          // 대체 구조 1: result 자체가 배열인 경우
          newsData = pastNewsResponse.result;
        } else if (pastNewsResponse?.result && typeof pastNewsResponse.result === 'object') {
          // 대체 구조 2: result가 객체인 경우 내부 배열 찾기
          const resultObj = pastNewsResponse.result as Record<string, any>;

          // 배열을 포함할 수 있는 모든 키 확인
          for (const key of Object.keys(resultObj)) {
            if (Array.isArray(resultObj[key])) {
              newsData = resultObj[key];
              break;
            }
          }
        }

        if (newsData.length > 0) {
          // 날짜 기준으로 정렬하여 최신 뉴스가 먼저 표시되도록 함
          const sortedNews = [...newsData].sort(
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
          // 빈 배열로 설정
          setTurnNewsList((prev) => ({
            ...prev,
            [turn]: [],
          }));

          if (turn === currentTurn) {
            setPastNewsList([]);
          }
        }
      } catch (error) {
        console.error(`[API 에러] 과거 뉴스 로드 실패 (턴 ${turn}):`, error);

        // 에러 시 빈 배열로 설정
        setTurnNewsList((prev) => ({
          ...prev,
          [turn]: [],
        }));

        if (turn === currentTurn) {
          setPastNewsList([]);
        }
      }

      // 히스토리 스켈레톤 상태 해제
      setIsHistorySkeleton(false);

      // =================================================================
      // 3. 교육용 현재 뉴스 조회 API 호출 -> StockTutorialNews 컴포넌트
      // =================================================================
      try {
        // 교육용 뉴스는 해당 턴의 변곡점 ID 사용 (4단계는 없음)
        let educationalNewsId = 0;
        if (turn === 1 && pointStockCandleIds.length >= 1) {
          educationalNewsId = pointStockCandleIds[0]; // 변곡점 1
        } else if (turn === 2 && pointStockCandleIds.length >= 2) {
          educationalNewsId = pointStockCandleIds[1]; // 변곡점 2
        } else if (turn === 3 && pointStockCandleIds.length >= 3) {
          educationalNewsId = pointStockCandleIds[2]; // 변곡점 3
        } else if (turn === 4) {
          // 4단계는 교육용 뉴스 없음
          if (turn === currentTurn) {
            setCurrentNews(null);
          }

          // 뉴스 스켈레톤 상태 해제
          setIsNewsSkeleton(false);

          // 로드 완료 상태 업데이트
          loadedTurnsRef.current = {
            ...loadedTurnsRef.current,
            [turn]: true,
          };

          newsRequestRef.current = {
            ...newsRequestRef.current,
            [turn]: false,
          };

          console.log(`[loadNewsData] 턴 ${turn} 데이터 로드 완료 (4단계)`);
          return;
        }

        // 교육용 뉴스 ID가 없으면 요청하지 않음
        if (educationalNewsId <= 0) {
          if (turn === currentTurn) {
            setCurrentNews(null);
          }

          // 로드 완료 상태 업데이트
          loadedTurnsRef.current = {
            ...loadedTurnsRef.current,
            [turn]: true,
          };

          newsRequestRef.current = {
            ...newsRequestRef.current,
            [turn]: false,
          };

          // 뉴스 스켈레톤 상태 해제
          setIsNewsSkeleton(false);

          console.log(`[loadNewsData] 턴 ${turn} 데이터 로드 완료 (교육용 뉴스 ID 없음)`);
          return;
        }

        const currentNewsResponse = await getCurrentNews.mutateAsync({
          companyId,
          stockCandleId: educationalNewsId,
        });

        if (currentNewsResponse?.result) {
          // 턴별 현재 뉴스 상태 업데이트
          setTurnCurrentNews((prev) => ({
            ...prev,
            [turn]: currentNewsResponse.result,
          }));

          // 현재 턴이면 화면에 표시할 뉴스도 업데이트 (StockTutorialNews로 전달됨)
          if (turn === currentTurn) {
            setCurrentNews(currentNewsResponse.result);
          }
        } else if (turn === currentTurn) {
          // 응답이 없으면 null로 설정
          setCurrentNews(null);
        }
      } catch (error) {
        console.error(`[loadNewsData] 교육용 뉴스 로드 오류:`, error);
        // 기본값으로 설정
        if (turn === currentTurn) {
          setCurrentNews(null);
        }
      }

      // 뉴스 스켈레톤 상태 해제
      setIsNewsSkeleton(false);

      // 로드 완료 상태 업데이트
      loadedTurnsRef.current = {
        ...loadedTurnsRef.current,
        [turn]: true,
      };

      newsRequestRef.current = {
        ...newsRequestRef.current,
        [turn]: false,
      };

      console.log(`[loadNewsData] 턴 ${turn} 데이터 로드 완료`);
    } catch (error) {
      console.error(`[loadNewsData] 턴 ${turn} 데이터 로드 중 오류:`, error);

      // 로드 상태 초기화
      newsRequestRef.current = {
        ...newsRequestRef.current,
        [turn]: false,
      };

      // 스켈레톤 상태 해제
      setIsNewsSkeleton(false);
      setIsCommentSkeleton(false);
      setIsHistorySkeleton(false);
      setIsConclusionSkeleton(false);
    }
  };

  // 차트 데이터 로드
  const loadChartData = async (startDate: string, endDate: string, turn: number) => {
    console.log(`[loadChartData] 턴 ${turn} 차트 데이터 로드 요청: ${startDate} ~ ${endDate}`);
    setIsChartLoading(true);
    setIsChartSkeleton(true);
    setHasChartError(false);

    // 전체 일봉 데이터가 이미 로드된 경우 해당 구간만 필터링하여 반환
    if (allStockCandles.length > 0) {
      console.log(
        `[loadChartData] 턴 ${turn} - 저장된 전체 일봉 데이터에서 ${startDate} ~ ${endDate} 구간 필터링`,
      );

      // 날짜 범위에 해당하는 캔들 필터링
      const filteredCandles = allStockCandles.filter((candle) => {
        const candleDate = formatDateToYYMMDD(new Date(candle.tradingDate));
        return candleDate >= startDate && candleDate <= endDate;
      });

      if (filteredCandles.length > 0) {
        // 원본 API 응답 구조를 유지하여 반환
        const result: TutorialStockResponse = {
          companyId: companyId.toString(),
          cursor: '',
          limit: filteredCandles.length,
          data: filteredCandles,
        };

        console.log(
          `[loadChartData] 턴 ${turn} - 로컬 캐시에서 ${filteredCandles.length}개 캔들 필터링 완료`,
        );

        // 턴별 차트 데이터 저장
        setTurnChartData((prev) => {
          const updated = { ...prev, [turn]: result };
          return updated;
        });

        // 일봉 데이터 필터링 및 정렬
        const dayCandles = filteredCandles
          .filter((candle: StockCandle) => candle.periodType === 1)
          .sort((a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime());

        if (dayCandles.length > 0) {
          // 전체 차트 데이터의 첫 번째와 마지막 캔들의 ID 로깅 (디버깅용)
          const firstCandleId = dayCandles[0].stockCandleId;
          const lastCandleId = dayCandles[dayCandles.length - 1].stockCandleId;
          console.log(
            `[턴 ${turn} 차트 로드 결과] 로컬 캐시 데이터 stockCandleId: ${firstCandleId} ~ ${lastCandleId}`,
          );

          // 현재 턴의 세션 정보 가져오기
          const session = calculateSession(turn);
          if (session) {
            // 현재 턴에 해당하는 정확한 구간만 필터링
            const turnStartDate = session.startDate;
            const turnEndDate = session.endDate;

            const turnSpecificCandles = dayCandles.filter((candle) => {
              const candleDate = formatDateToYYMMDD(new Date(candle.tradingDate));
              return candleDate >= turnStartDate && candleDate <= turnEndDate;
            });

            if (turnSpecificCandles.length > 0) {
              // 현재 턴의 구간에 해당하는 캔들 ID 로깅
              const turnStartId = turnSpecificCandles[0].stockCandleId;
              const turnEndId = turnSpecificCandles[turnSpecificCandles.length - 1].stockCandleId;
              console.log(
                `[턴 ${turn} 차트 로드 결과] 정확한 구간 stockCandleId: ${turnStartId} ~ ${turnEndId}`,
              );
            }
          }

          // 튜토리얼 날짜 범위 업데이트
          const firstDate = formatDateToYYMMDD(new Date(dayCandles[0].tradingDate));
          const lastDate = formatDateToYYMMDD(
            new Date(dayCandles[dayCandles.length - 1].tradingDate),
          );

          setTutorialDateRange({
            startDate: firstDate,
            endDate: lastDate,
          });

          // 최신 가격 업데이트 - 각 턴의 마지막 캔들 종가 사용
          const priceToShow = dayCandles[dayCandles.length - 1].closePrice;
          if (priceToShow > 0) {
            setLatestPrice(priceToShow);
          }
        }

        // 스켈레톤 상태 해제
        setIsChartSkeleton(false);
        setIsChartLoading(false);

        // 차트 렌더링을 위해 stockData 업데이트
        setStockData(result);

        return result;
      }

      console.log(
        `[loadChartData] 턴 ${turn} - 로컬 캐시에서 적합한 데이터를 찾지 못해 API 요청 진행`,
      );
    }

    // 기존 API 요청 로직 (캐시가 없거나 필터링 결과가 없는 경우)
    const apiUrl = `stocks/${companyId}/tutorial?startDate=${startDate}&endDate=${endDate}`;

    try {
      console.log(`[턴 ${turn} 차트 로드 요청] 누적 구간: ${startDate} ~ ${endDate}`);

      const response = await _ky.get(apiUrl).json();
      const stockDataResponse = response as ApiResponse<TutorialStockResponse>;

      if (!stockDataResponse?.result?.data || stockDataResponse.result.data.length === 0) {
        setHasChartError(true);
        setIsChartLoading(false);
        setIsChartSkeleton(false);
        console.error(`[턴 ${turn} 차트 로드] 차트 데이터가 없습니다.`);
        return null;
      }

      const result = stockDataResponse.result;

      // 턴별 차트 데이터 저장 - 동기적으로 업데이트하기 위해 함수형 업데이트 사용
      setTurnChartData((prev) => {
        const updated = { ...prev, [turn]: result };
        return updated;
      });

      // 일봉 데이터 필터링 및 정렬
      const dayCandles = result.data
        .filter((candle: StockCandle) => candle.periodType === 1)
        .sort((a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime());

      if (dayCandles.length > 0) {
        // 전체 차트 데이터의 첫 번째와 마지막 캔들의 ID 로깅 (디버깅용)
        const firstCandleId = dayCandles[0].stockCandleId;
        const lastCandleId = dayCandles[dayCandles.length - 1].stockCandleId;
        console.log(
          `[턴 ${turn} 차트 로드 결과] 누적 데이터 stockCandleId: ${firstCandleId} ~ ${lastCandleId}`,
        );

        // 현재 턴의 세션 정보 가져오기
        const session = calculateSession(turn);
        if (session) {
          // 현재 턴에 해당하는 정확한 구간만 필터링
          const turnStartDate = session.startDate;
          const turnEndDate = session.endDate;

          const turnSpecificCandles = dayCandles.filter((candle) => {
            const candleDate = formatDateToYYMMDD(new Date(candle.tradingDate));
            return candleDate >= turnStartDate && candleDate <= turnEndDate;
          });

          if (turnSpecificCandles.length > 0) {
            // 현재 턴의 구간에 해당하는 캔들 ID 로깅
            const turnStartId = turnSpecificCandles[0].stockCandleId;
            const turnEndId = turnSpecificCandles[turnSpecificCandles.length - 1].stockCandleId;
            console.log(
              `[턴 ${turn} 차트 로드 결과] 정확한 구간 stockCandleId: ${turnStartId} ~ ${turnEndId}`,
            );
          }
        }

        // 튜토리얼 날짜 범위 업데이트
        const firstDate = formatDateToYYMMDD(new Date(dayCandles[0].tradingDate));
        const lastDate = formatDateToYYMMDD(
          new Date(dayCandles[dayCandles.length - 1].tradingDate),
        );

        setTutorialDateRange({
          startDate: firstDate,
          endDate: lastDate,
        });

        // 최신 가격 업데이트 - 각 턴의 마지막 캔들 종가 사용
        const priceToShow = dayCandles[dayCandles.length - 1].closePrice;
        if (priceToShow > 0) {
          setLatestPrice(priceToShow);
        }
      } else {
        console.warn(`[턴 ${turn} 차트 로드] 일봉 데이터가 없습니다.`);
      }

      // 모든 데이터 처리가 완료된 후 마지막으로 스켈레톤 상태 해제
      setIsChartSkeleton(false);

      // 마지막으로 stockData 업데이트하여 차트 렌더링 트리거
      setStockData(result);

      // 차트 로딩 상태 해제
      setIsChartLoading(false);

      // 데이터 로드가 완료되었음을 나타내는 return
      return result;
    } catch (error) {
      console.error(`[턴 ${turn} 차트 로드] 오류:`, error);
      setHasChartError(true);
      setIsChartLoading(false);
      setIsChartSkeleton(false);
      return null;
    }
  };

  // 차트 구간 분석 및 StockCandleId 범위 계산 함수 개선
  const getStockCandleIdRange = (turn: number) => {
    let startStockCandleId = 0;
    let endStockCandleId = 0;

    // 전체 일봉 데이터의 마지막 캔들 ID 찾기
    let lastCandleId = 0;
    if (allStockCandles.length > 0) {
      // 전역 상태에 저장된 전체 일봉 데이터 사용
      lastCandleId = allStockCandles[allStockCandles.length - 1].stockCandleId;
      console.log(`[getStockCandleIdRange] 전체 일봉 데이터의 마지막 ID: ${lastCandleId}`);
    } else {
      // 전역 상태가 없을 경우 기존 방식으로 수집
      const allCandles: StockCandle[] = [];
      Object.values(turnChartData).forEach((data) => {
        if (data?.data && Array.isArray(data.data)) {
          const periodTypeCandles = data.data.filter(
            (candle: StockCandle) => candle.periodType === 1,
          );
          allCandles.push(...periodTypeCandles);
        }
      });

      if (allCandles.length > 0) {
        // stockCandleId 기준으로 내림차순 정렬
        const sortedCandles = [...allCandles].sort((a, b) => b.stockCandleId - a.stockCandleId);
        lastCandleId = sortedCandles[0].stockCandleId;
        console.log(`[getStockCandleIdRange] 수집된 데이터의 마지막 ID: ${lastCandleId}`);
      }
    }

    // 항상 전체 데이터의 마지막 ID 사용을 보장
    if (lastCandleId <= 0) {
      console.error('[getStockCandleIdRange] 마지막 캔들 ID를 찾을 수 없습니다. API 호출 필요');
      // API 데이터가 아직 로드되지 않은 경우 비상 대책으로 매우 큰 값 설정
      lastCandleId = 100000;
    }

    // 변곡점 데이터 유효성 확인
    if (pointStockCandleIds.length >= 3) {
      // 변곡점 기반으로 명확하게 턴별 구간 설정
      switch (turn) {
        case 1:
          // 첫 번째 턴: 변곡점1 ~ 변곡점2
          startStockCandleId = pointStockCandleIds[0];
          endStockCandleId = pointStockCandleIds[1];
          break;
        case 2:
          // 두 번째 턴: 변곡점2 ~ 변곡점3
          startStockCandleId = pointStockCandleIds[1];
          endStockCandleId = pointStockCandleIds[2];
          break;
        case 3:
          // 세 번째 턴: 변곡점3 ~ 전체 데이터 마지막
          startStockCandleId = pointStockCandleIds[2];
          // 반드시 전체 데이터의 마지막 ID 사용
          endStockCandleId = lastCandleId;
          break;
        case 4:
          // 네 번째 턴: 변곡점3 ~ 전체 데이터 마지막 (3턴과 동일)
          startStockCandleId = pointStockCandleIds[2];
          // 반드시 전체 데이터의 마지막 ID 사용
          endStockCandleId = lastCandleId;
          break;
        default:
          // 기본값: 첫 번째 변곡점 ~ 마지막 ID
          startStockCandleId = pointStockCandleIds[0];
          endStockCandleId = lastCandleId;
      }

      console.log(
        `[getStockCandleIdRange] 턴 ${turn} 구간 설정 (변곡점 기반): ${startStockCandleId} ~ ${endStockCandleId}`,
      );
    } else {
      // 변곡점 데이터가 없는 경우 기본값 설정
      switch (turn) {
        case 1:
          startStockCandleId = 1;
          endStockCandleId = Math.floor(lastCandleId * 0.33); // 전체 범위의 약 1/3
          break;
        case 2:
          startStockCandleId = Math.floor(lastCandleId * 0.33) + 1;
          endStockCandleId = Math.floor(lastCandleId * 0.66); // 전체 범위의 약 2/3
          break;
        case 3:
          startStockCandleId = Math.floor(lastCandleId * 0.66) + 1;
          // 반드시 전체 데이터의 마지막 ID 사용
          endStockCandleId = lastCandleId;
          break;
        case 4:
          // 3턴과 동일하게 처리
          startStockCandleId = Math.floor(lastCandleId * 0.66) + 1;
          endStockCandleId = lastCandleId;
          break;
        default:
          startStockCandleId = 1;
          endStockCandleId = lastCandleId;
      }

      console.log(
        `[getStockCandleIdRange] 턴 ${turn} 구간 설정 (기본값): ${startStockCandleId} ~ ${endStockCandleId}`,
      );
    }

    // 유효한 범위 확인 (시작점은 항상 1 이상, 종료점은 시작점보다 커야 함)
    startStockCandleId = Math.max(1, startStockCandleId);
    endStockCandleId = Math.max(startStockCandleId + 1, endStockCandleId);

    console.log(
      `[getStockCandleIdRange] 최종 턴 ${turn} 구간: ${startStockCandleId} ~ ${endStockCandleId}`,
    );
    return { startStockCandleId, endStockCandleId };
  };

  // 초기 데이터 로드 함수 수정: 로딩 순서 개선
  const loadInitialData = useCallback(async () => {
    if (!isTutorialStarted || currentTurn <= 0) return;

    // 변곡점 데이터가 없으면 먼저 로드
    if (pointStockCandleIds.length === 0) {
      try {
        await loadPointsData();
      } catch (error) {
        console.error('[loadInitialData] 변곡점 데이터 로드 오류:', error);
        // 오류 무시하고 계속 진행
      }
    }

    // 현재 턴의 세션 계산
    const session = calculateSession(currentTurn);
    if (!session) {
      console.error('[loadInitialData] 세션 계산 실패');
      return;
    }

    try {
      // 보유 주식 수량 초기화 (서버 API 호출 없이 거래 내역 기반으로 계산)
      await initOwnedStockCount();

      // 초기 로드 상태 설정
      if (newsRequestRef.current[currentTurn]) {
        newsRequestRef.current = {
          ...newsRequestRef.current,
          [currentTurn]: false,
        };
      }

      // 차트 데이터 먼저 로드
      const chartResult = await loadChartData(defaultStartDate, session.endDate, currentTurn);

      // 차트 로드 실패 시에도 뉴스 데이터 로드 시도
      if (!chartResult) {
        console.warn('[loadInitialData] 차트 데이터 로드 실패, 뉴스 데이터 로드 계속 진행');
      }

      // 뉴스 데이터 로드 (차트 데이터와 독립적으로 실행)
      setTimeout(async () => {
        try {
          await loadNewsData(currentTurn);
        } catch (error) {
          console.error(`[loadInitialData] 뉴스 데이터 로드 오류:`, error);
          // 오류 발생 시에도 스켈레톤 상태 해제
          setIsNewsSkeleton(false);
          setIsCommentSkeleton(false);
          setIsHistorySkeleton(false);
          setIsConclusionSkeleton(false);
        }
      }, 300);
    } catch (error) {
      console.error('[loadInitialData] 오류:', error);
      // 오류 발생 시에도 스켈레톤 상태 해제
      setIsChartSkeleton(false);
      setIsNewsSkeleton(false);
      setIsCommentSkeleton(false);
      setIsHistorySkeleton(false);
      setIsConclusionSkeleton(false);
    }
  }, [isTutorialStarted, currentTurn, pointStockCandleIds.length]);

  // 뉴스 API 요청 완료 후 호출되는 콜백 함수
  const handleNewsDataLoaded = useCallback((turn: number) => {
    // 해당 턴의 API 요청 상태를 false로 설정
    newsRequestRef.current = {
      ...newsRequestRef.current,
      [turn]: false,
    };

    // 데이터 로드 완료 표시
    loadedTurnsRef.current = {
      ...loadedTurnsRef.current,
      [turn]: true,
    };
  }, []);

  // 초기 데이터 로드 시 skeleton 처리
  useEffect(() => {
    if (!isTutorialStarted) {
      // 튜토리얼이 시작되기 전에는 skeleton 숨김
      setIsChartSkeleton(false);
      setIsNewsSkeleton(false);
      setIsCommentSkeleton(false);
      setIsHistorySkeleton(false);
      setIsConclusionSkeleton(false);
    } else if (currentTurn > 0) {
      // 튜토리얼이 시작되면 skeleton 표시
      setIsChartSkeleton(true);
      setIsNewsSkeleton(true);
      setIsCommentSkeleton(true);
      setIsHistorySkeleton(true);
      setIsConclusionSkeleton(true);
    }
  }, [isTutorialStarted, currentTurn]);

  // 다음 턴으로 이동할 때 skeleton 표시
  useEffect(() => {
    if (isTutorialStarted && !isCurrentTurnCompleted) {
      setIsChartSkeleton(true);
      setIsNewsSkeleton(true);
      setIsCommentSkeleton(true);
      setIsHistorySkeleton(true);
      setIsConclusionSkeleton(true);
    }
  }, [isTutorialStarted, currentTurn, isCurrentTurnCompleted]);

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

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    if (isTutorialStarted && currentTurn > 0) {
      // 이전 자산 상태 저장
      const prevAssetInfo = { ...assetInfo };

      loadInitialData().then(() => {
        // 자산 정보가 초기화되지 않도록 이전 상태 유지
        if (currentTurn > 1) {
          setAssetInfo((prev) => ({
            ...prev,
            totalReturnRate: prevAssetInfo.totalReturnRate,
            currentTotalAsset: prevAssetInfo.currentTotalAsset,
          }));
        }
      });
    }
  }, [loadInitialData, isTutorialStarted, currentTurn]);

  // 튜토리얼 버튼 클릭 핸들러 (턴 이동 또는 튜토리얼 완료)
  const handleTutorialButtonClick = async () => {
    if (!isUserLoggedIn()) {
      alert('로그인이 필요한 기능입니다.');
      return;
    }

    try {
      if (!isTutorialStarted) {
        // 튜토리얼이 시작되지 않은 경우, 시작
        await handleTutorialStart();
        return;
      }

      // 턴이 완료되지 않은 경우 처리
      if (!isCurrentTurnCompleted) {
        alert('현재 단계를 완료해야 다음 단계로 넘어갈 수 있습니다.');
        return;
      }

      // 다음 턴으로 이동
      setCurrentTurn((prev) => prev + 1);
      setIsCurrentTurnCompleted(false);

      // 다음 턴에 맞게 진행 상태 업데이트
      const nextTurn = currentTurn + 1;
      const turnToProgressMap: Record<number, number> = {
        1: 25,
        2: 50,
        3: 75,
        4: 100,
      };
      setProgress(turnToProgressMap[nextTurn]);

      // 차트 데이터와 뉴스 데이터 로드
      await moveToNextTurn();
    } catch (error) {
      console.error('[handleTutorialButtonClick] 오류:', error);
      toast.error('다음 단계로 이동 중 오류가 발생했습니다.');
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 거래 내역 변경 시 자산 정보 업데이트
  useEffect(() => {
    if (trades.length > 0 && isTutorialStarted) {
      // 현재 턴의 거래만 필터링
      const currentTurnTrades = trades.filter((trade) => trade.turnNumber === currentTurn);

      // 보유 주식 수량 계산
      let totalStock = 0;

      // 이전 턴까지의 거래 결과 합산
      if (currentTurn > 1) {
        const previousTurnTrades = trades.filter((trade) => trade.turnNumber < currentTurn);
        previousTurnTrades.forEach((trade) => {
          if (trade.action === 'buy') {
            totalStock += trade.quantity;
          } else if (trade.action === 'sell') {
            totalStock -= trade.quantity;
          }
        });
      }

      // 현재 턴의 거래 결과 합산
      currentTurnTrades.forEach((trade) => {
        if (trade.action === 'buy') {
          totalStock += trade.quantity;
        } else if (trade.action === 'sell') {
          totalStock -= trade.quantity;
        }
      });

      // 음수가 되지 않도록 보정
      totalStock = Math.max(0, totalStock);
      setOwnedStockCount(totalStock);

      // 자산 정보 업데이트 로그
      console.log(`[거래 내역 업데이트] 현재 턴: ${currentTurn}, 총 보유 주식: ${totalStock}주`);
    }
  }, [isTutorialStarted, trades, currentTurn]);

  // 모달 닫기 핸들러 추가
  const handleCloseNewsModal = useCallback(() => {
    setIsNewsModalOpen(false);
    // 현재 턴의 모달 표시 상태를 true로 설정하여 다시 표시되지 않도록 함
    setTurnModalShown((prev) => ({
      ...prev,
      [currentTurn]: true,
    }));
  }, [currentTurn]);

  // 도움말 버튼 클릭 핸들러 추가
  const handleHelpClick = () => {
    setRunTour((prev) => !prev); // 이전 상태의 반대값으로 토글
  };

  // 페이지 접근 시 투어 자동 시작
  useEffect(() => {
    if (isLogin && memberId > 0) {
      // localStorage에서 이 사용자가 이미 투어를 봤는지 확인
      const hasSeen = localStorage.getItem(`tutorial_tour_seen_${memberId}`);
      if (!hasSeen) {
        // 1초 후 투어 시작 (페이지 렌더링 안정화를 위해)
        const timer = setTimeout(() => {
          setRunTour(true);
          // 투어를 봤다고 표시
          localStorage.setItem(`tutorial_tour_seen_${memberId}`, 'true');
        });
        return () => clearTimeout(timer);
      }
    }
  }, [isLogin, memberId]);

  // 페이지 이탈/새로고침 방지를 위한 핸들러 추가
  useEffect(() => {
    // 튜토리얼이 시작되었거나, 뉴스 모달이 열려있거나, 데이터 로딩 중일 때 경고창 표시
    if (isTutorialStarted || isNewsModalOpen || isLoading || isChartLoading) {
      // beforeunload 이벤트 핸들러 (페이지 새로고침, 브라우저 닫기 등)
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        // 표준 메시지 설정 (브라우저마다 실제 표시되는 메시지는 다를 수 있음)
        const message = '페이지를 벗어나면 튜토리얼 단계가 초기화됩니다. 벗어나시겠습니까?';
        e.preventDefault();
        e.returnValue = message; // Chrome에서는 이 설정이 필요
        return message; // 다른 브라우저를 위한 리턴값
      };

      // 이벤트 리스너 등록
      window.addEventListener('beforeunload', handleBeforeUnload);

      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isTutorialStarted, isNewsModalOpen, isLoading, isChartLoading]);

  // isCurrentTurnCompleted 상태 변경 감지
  useEffect(() => {
    console.log(
      '[SimulatePage] isCurrentTurnCompleted 변경:',
      isCurrentTurnCompleted,
      '현재 턴:',
      currentTurn,
    );
  }, [isCurrentTurnCompleted, currentTurn]);

  // isCurrentTurnCompleted 상태 변경 시 자산 정보 업데이트
  useEffect(() => {
    // 1. 턴 완료 시 (거래 후) 자산 정보 업데이트
    if (isTutorialStarted && isCurrentTurnCompleted && currentTurn > 0) {
      console.log(`[턴 완료 감지] ${currentTurn}단계 완료, 자산 정보 업데이트`);

      // 0.5초 지연 후 자산 정보 업데이트 (API 응답 처리 시간 확보)
      const timer = setTimeout(async () => {
        await updateAssetInfo();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isTutorialStarted, isCurrentTurnCompleted, currentTurn]);

  // isCurrentTurnCompleted 상태 변경 감지 (디버깅용)
  useEffect(() => {
    console.log(
      '[SimulatePage] isCurrentTurnCompleted 변경:',
      isCurrentTurnCompleted,
      '현재 턴:',
      currentTurn,
    );
  }, [isCurrentTurnCompleted, currentTurn]);

  // 추가: 각 영역별 로딩 상태 관리
  const [isChartSkeleton, setIsChartSkeleton] = useState(true);
  const [isNewsSkeleton, setIsNewsSkeleton] = useState(true);
  const [isCommentSkeleton, setIsCommentSkeleton] = useState(true);
  const [isHistorySkeleton, setIsHistorySkeleton] = useState(true);
  const [isConclusionSkeleton, setIsConclusionSkeleton] = useState(true);

  // 컴포넌트 상단 state 정의 부분에 추가
  const turnAssetInfoRef = useRef<Record<number, any>>({});
  // 임시 자산 정보 저장용 ref 추가
  const tempAssetInfoRef = useRef<any>(null);

  // 전체 일봉 데이터를 저장할 상태 추가
  const [allStockCandles, setAllStockCandles] = useState<StockCandle[]>([]);

  // 튜토리얼 시작 시 전체 일봉 데이터를 한 번에 로드하는 함수
  const loadAllTutorialCandles = async (companyId: number, startDate: string, endDate: string) => {
    try {
      console.log(`[loadAllTutorialCandles] 전체 일봉 데이터 로드 요청: ${startDate} ~ ${endDate}`);

      const apiUrl = `stocks/${companyId}/tutorial?startDate=${startDate}&endDate=${endDate}`;
      const response = await _ky.get(apiUrl).json();
      const stockDataResponse = response as ApiResponse<TutorialStockResponse>;

      if (!stockDataResponse?.result?.data || stockDataResponse.result.data.length === 0) {
        console.error('[loadAllTutorialCandles] 일봉 데이터가 없습니다.');
        return [];
      }

      // 전체 데이터 개수 로깅
      console.log(
        `[loadAllTutorialCandles] 전체 데이터 개수: ${stockDataResponse.result.data.length}개`,
      );

      // 일봉 데이터만 필터링하고 날짜 기준으로 정렬
      const dayCandles = stockDataResponse.result.data
        .filter((candle: StockCandle) => candle.periodType === 1)
        .sort((a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime());

      console.log(`[loadAllTutorialCandles] 일봉 데이터 필터링 완료: ${dayCandles.length}개`);

      // 첫 번째와 마지막 캔들의 ID와 날짜 로깅
      if (dayCandles.length > 0) {
        const firstCandle = dayCandles[0];
        const lastCandle = dayCandles[dayCandles.length - 1];

        console.log(
          `[loadAllTutorialCandles] 전체 일봉 데이터 범위: 
          - 시작: ID ${firstCandle.stockCandleId}, 날짜 ${formatDateToYYMMDD(new Date(firstCandle.tradingDate))}, 가격 ${firstCandle.closePrice}
          - 종료: ID ${lastCandle.stockCandleId}, 날짜 ${formatDateToYYMMDD(new Date(lastCandle.tradingDate))}, 가격 ${lastCandle.closePrice}
          - 총 개수: ${dayCandles.length}개`,
        );

        // stockCandleId 기준으로 정렬하여 최대값 확인
        const sortedByIdCandles = [...dayCandles].sort((a, b) => b.stockCandleId - a.stockCandleId);
        const maxIdCandle = sortedByIdCandles[0];
        console.log(
          `[loadAllTutorialCandles] 최대 stockCandleId: ${maxIdCandle.stockCandleId}, 날짜: ${formatDateToYYMMDD(new Date(maxIdCandle.tradingDate))}`,
        );

        // 변곡점과 비교
        if (pointStockCandleIds.length > 0) {
          console.log(`[loadAllTutorialCandles] 변곡점 ID 목록: ${pointStockCandleIds.join(', ')}`);
        }
      }

      return dayCandles;
    } catch (error) {
      console.error('[loadAllTutorialCandles] 일봉 데이터 로드 오류:', error);
      return [];
    }
  };

  return (
    <>
      {/* 투어 컴포넌트 추가 */}
      <SimulationTour run={runTour} setRun={setRunTour} />

      {/* 뉴스 모달이 열려있을 때 또는 로딩 중일 때 전체 페이지에 클릭 방지 오버레이 추가 */}
      {(isNewsModalOpen || isLoading) && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          {isLoading && !isNewsModalOpen && (
            <LoadingSpinner size="large">
              <p className="mt-4 text-white">{loadingMessage}</p>
            </LoadingSpinner>
          )}
        </div>
      )}

      {/* 기존 컴포넌트 */}
      <div
        className="flex h-full w-full flex-col px-6"
        style={{ pointerEvents: isNewsModalOpen || isLoading ? 'none' : 'auto' }}
      >
        <div className="stock-tutorial-info flex items-center justify-between">
          <StockTutorialInfo
            companyId={companyId}
            isTutorialStarted={isTutorialStarted}
            onTutorialStart={handleTutorialStart}
            onMoveToNextTurn={handleTutorialButtonClick}
            currentTurn={currentTurn}
            isCurrentTurnCompleted={isCurrentTurnCompleted}
            buttonText={getTutorialButtonText}
            latestPrice={latestPrice}
            onHelpClick={handleHelpClick}
            isLoading={isLoading || isChartLoading}
            isPending={initSession.isPending || processUserAction.isPending}
          />
        </div>
        <div className="mb-[20px] flex justify-between">
          <div className="stock-tutorial-money-info">
            <StockTutorialMoneyInfo
              initialAsset={10000000}
              availableOrderAsset={assetInfo.availableOrderAsset}
              currentTotalAsset={assetInfo.currentTotalAsset}
              totalReturnRate={assetInfo.totalReturnRate}
              isLoading={isLoading || isChartLoading}
            />
          </div>
          <div className="stock-progress">
            <StockProgress
              progress={progress}
              currentTurn={currentTurn}
              startDate={
                currentTurn > 0 ? getTurnDateRange(currentTurn).start : tutorialDateRange.startDate
              }
              endDate={
                currentTurn > 0 ? getTurnDateRange(currentTurn).end : tutorialDateRange.endDate
              }
              formatDateFn={formatYYMMDDToYYYYMMDD}
              pointDates={pointDates}
              defaultStartDate={defaultStartDate}
              defaultEndDate={defaultEndDate}
              isLoading={isLoading || isChartLoading}
            />
          </div>
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
            ) : isChartLoading && !isChartSkeleton ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-[#0D192B] text-white">
                <div className="text-center">
                  <p className="mb-3 text-xl">차트 데이터를 불러오는 중입니다...</p>
                  <p className="text-sm text-gray-400">
                    일봉 데이터를 로드하고 있습니다. 잠시만 기다려주세요.
                  </p>
                </div>
              </div>
            ) : isChartSkeleton ? (
              <div className="h-full rounded-2xl">
                <Skeleton
                  className="h-full w-full rounded-2xl"
                  style={{ backgroundColor: '#0D192B' }}
                />
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
              <div className="chart-tutorial relative h-full" id="chart-tutorial">
                <ChartComponent
                  periodData={stockData || undefined}
                  inflectionPoints={pointDates.map((date, index) => ({
                    date: date,
                    label: `변곡점${index + 1}`,
                    index: pointStockCandleIds[index] ? pointStockCandleIds[index] - 1 : 0,
                  }))}
                  isLoading={isChartSkeleton || isChartLoading}
                />
              </div>
            )}
          </div>
          <div className="col-span-1 h-full lg:col-span-3">
            <div className="stock-tutorial-order h-full">
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
                initSessionPending={initSession.isPending}
                companyInfoExists={!!companyInfo}
                isLoading={isLoading || isChartLoading}
                isPending={initSession.isPending || processUserAction.isPending}
              />
            </div>
          </div>
        </div>

        <div className="mt-[24px] grid grid-cols-6 gap-3">
          <div className="stock-tutorial-comment col-span-3" ref={commentRef}>
            {isCommentSkeleton && isTutorialStarted ? (
              <Skeleton
                className="h-[150px] w-full rounded-lg"
                style={{ backgroundColor: '#0D192B' }}
              />
            ) : (
              <StockTutorialComment comment={newsComment} isTutorialStarted={isTutorialStarted} />
            )}
          </div>
          <div className="day-history col-span-3">
            {isHistorySkeleton && isTutorialStarted ? (
              <Skeleton
                className="h-[150px] w-full rounded-lg"
                style={{ backgroundColor: '#0D192B' }}
              />
            ) : (
              <DayHistory
                news={pastNewsList}
                height={commentHeight}
                isTutorialStarted={isTutorialStarted}
              />
            )}
          </div>
        </div>
        <div className="mt-[25px] grid grid-cols-6 gap-3">
          <div className="stock-tutorial-news col-span-4">
            {isNewsSkeleton && isTutorialStarted ? (
              <Skeleton
                className="h-[170px] w-full rounded-lg"
                style={{ backgroundColor: '#0D192B' }}
              />
            ) : (
              <StockTutorialNews
                currentNews={currentNews}
                companyId={companyId}
                currentTurn={currentTurn}
              />
            )}
          </div>
          <div className="stock-tutorial-conclusion col-span-2">
            {isConclusionSkeleton && isTutorialStarted ? (
              <Skeleton
                className="h-[170px] w-full rounded-lg"
                style={{ backgroundColor: '#0D192B' }}
              />
            ) : (
              <StockTutorialConclusion
                trades={trades}
                isCompleted={progress === 100}
                isLoading={isConclusionSkeleton}
              />
            )}
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

        {/* 교육용 뉴스 모달 추가 - z-index가 가장 높고 pointer-events가 항상 auto여야 함 */}
        <div style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}>
          <TutorialNewsModal
            isOpen={isNewsModalOpen}
            onClose={handleCloseNewsModal}
            news={currentNews}
            companyId={companyId}
            currentTurn={currentTurn}
          />
        </div>
      </div>
    </>
  );
};
