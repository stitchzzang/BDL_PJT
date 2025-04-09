import Lottie from 'lottie-react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
  const [finalChangeRate, setFinalChangeRate] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isTutorialStarted, setIsTutorialStarted] = useState(false);
  const companyId = Number(companyIdParam);

  // companyId 유효성 검사를 위한 useEffect 추가
  useEffect(() => {
    // companyId가 NaN이거나 정수가 아닌 경우 NotFoundPage로 리다이렉트
    if (isNaN(companyId) || !Number.isInteger(companyId) || companyId <= 0) {
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

    // 회사 정보 로드 후, 오류가 발생한 경우에만 404 페이지로 리다이렉트
    if (isCompanyInfoError) {
      console.error(`[SimulatePage] 회사 정보가 존재하지 않음: companyId=${companyId}`);
      navigate('/error/not-found');
    }
  }, [companyInfo, isCompanyInfoError, isCompanyInfoLoading, companyId, navigate]);

  // 뉴스 모달 관련 상태 추가
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  // 뉴스 데이터 로딩 상태 추가
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  // 차트 데이터 로딩 상태 추가
  const [isChartLoading, setIsChartLoading] = useState(false);

  // 페이지 이탈 방지 훅 사용
  usePreventLeave(
    isTutorialStarted || isNewsModalOpen || isNewsLoading || isChartLoading,
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
  const initSessionMutation = useInitSession();
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

  // API 응답 디버그 헬퍼 함수
  const debugAPIResponse = (response: any, action: string) => {
    console.log(`[디버그] ${action} API 응답:`, response);

    // 응답 구조 분석
    if (!response) {
      console.error(`[디버그] ${action} 응답이 없습니다.`);
      return;
    }

    if (!response.isSuccess) {
      console.error(`[디버그] ${action} 응답 실패:`, response.message || '이유 없음');
      return;
    }

    if (!response.result) {
      console.error(`[디버그] ${action} 결과 없음`);
      return;
    }

    // result 타입 확인
    console.log(
      `[디버그] ${action} result 타입:`,
      Array.isArray(response.result) ? 'Array' : typeof response.result,
    );

    // 배열 또는 AssetResponse 배열 추출
    const assetResponses = Array.isArray(response.result)
      ? response.result
      : response.result.AssetResponse || [];

    console.log(`[디버그] ${action} AssetResponse 배열 길이:`, assetResponses.length);

    // 배열이 비어있지 않다면 첫 번째와 마지막 항목 로깅
    if (assetResponses.length > 0) {
      console.log(`[디버그] ${action} 첫 번째 항목:`, assetResponses[0]);
      console.log(`[디버그] ${action} 마지막 항목:`, assetResponses[assetResponses.length - 1]);

      // 마지막 항목의 키 확인
      const latestAsset = assetResponses[assetResponses.length - 1];
      console.log(`[디버그] ${action} 마지막 항목 키:`, Object.keys(latestAsset));

      // 중요 필드 유무 확인
      const hasTradeDate = 'tradingDate' in latestAsset;
      const hasAvailableOrderAsset = 'availableOrderAsset' in latestAsset;
      const hasCurrentTotalAsset = 'currentTotalAsset' in latestAsset;
      const hasTotalReturnRate = 'totalReturnRate' in latestAsset;

      console.log(`[디버그] ${action} 필드 존재 여부:`, {
        tradingDate: hasTradeDate,
        availableOrderAsset: hasAvailableOrderAsset,
        currentTotalAsset: hasCurrentTotalAsset,
        totalReturnRate: hasTotalReturnRate,
      });
    }
  };

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

      // 현재 턴의 차트 데이터 가져오기
      const currentTurnChartData = turnChartData[currentTurn];
      if (!currentTurnChartData?.data || currentTurnChartData.data.length === 0) {
        alert('차트 데이터를 불러오는 중 오류가 발생했습니다.');
        return;
      }

      // 일봉 데이터 필터링 및 정렬
      const dayCandles = currentTurnChartData.data
        .filter((candle: StockCandle) => candle.periodType === 1)
        .sort((a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime());

      if (dayCandles.length === 0) {
        alert('유효한 거래 데이터가 없습니다.');
        return;
      }

      // 각 턴별로 적절한 구간의 stockCandleId 설정
      let startPointId = 0;
      let endPointId = 0;

      // 현재 턴의 세션 정보 가져오기
      const session = calculateSession(currentTurn);
      if (!session) {
        alert('세션 정보를 가져올 수 없습니다.');
        return;
      }

      // 현재 턴에 해당하는 정확한 구간만 필터링
      const turnStartDate = session.startDate;
      const turnEndDate = session.endDate;

      const turnSpecificCandles = dayCandles.filter((candle) => {
        const candleDate = formatDateToYYMMDD(new Date(candle.tradingDate));
        return candleDate >= turnStartDate && candleDate <= turnEndDate;
      });

      if (turnSpecificCandles.length > 0) {
        // 현재 턴의 구간에 해당하는 캔들 ID 사용
        startPointId = turnSpecificCandles[0].stockCandleId;
        endPointId = turnSpecificCandles[turnSpecificCandles.length - 1].stockCandleId;

        console.log(
          `[턴 ${currentTurn} 거래] 정확한 구간 stockCandleId: ${startPointId} ~ ${endPointId}`,
        );
      } else {
        // 턴별 구간이 없으면 전체 차트에서 첫/마지막 캔들 ID 사용 (폴백)
        startPointId = dayCandles[0].stockCandleId;
        endPointId = dayCandles[dayCandles.length - 1].stockCandleId;

        console.log(
          `[턴 ${currentTurn} 거래] 폴백 구간 stockCandleId: ${startPointId} ~ ${endPointId}`,
        );
      }

      // 유효한 ID 체크
      if (startPointId <= 0 || endPointId <= 0) {
        alert('유효하지 않은 거래 구간입니다.');
        return;
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
          startStockCandleId: startPointId,
          endStockCandleId: endPointId,
        });

        console.log('[handleTrade] hold API 응답:', response);
        // 응답 디버그 추가
        debugAPIResponse(response, 'handleTrade hold');

        // API 응답에서 자산 정보 업데이트
        if (response.isSuccess && response.result) {
          // 배열인지 확인
          const assetResponses = Array.isArray(response.result)
            ? response.result
            : response.result.AssetResponse || [];

          console.log('[handleTrade] hold AssetResponse 배열:', assetResponses);

          if (assetResponses.length > 0) {
            // 최신 자산 정보 가져오기 (마지막 항목)
            const latestAsset = assetResponses[assetResponses.length - 1];
            console.log('[handleTrade] hold 최신 자산 정보:', latestAsset);

            // 필수 필드 존재 여부 확인
            if (
              latestAsset &&
              'availableOrderAsset' in latestAsset &&
              'currentTotalAsset' in latestAsset &&
              'totalReturnRate' in latestAsset &&
              'tradingDate' in latestAsset
            ) {
              // 자산 정보 업데이트
              const newAssetInfo = {
                tradingDate: latestAsset.tradingDate,
                availableOrderAsset: latestAsset.availableOrderAsset,
                currentTotalAsset: latestAsset.currentTotalAsset,
                totalReturnRate: latestAsset.totalReturnRate,
              };

              console.log('[handleTrade] hold 새 자산 정보로 업데이트:', newAssetInfo);
              setAssetInfo(newAssetInfo);
              console.log('[handleTrade] hold 업데이트 후 확인:', newAssetInfo);
            } else {
              console.error('[handleTrade] hold 필요한 필드가 없습니다:', latestAsset);
            }
          } else {
            console.warn('[handleTrade] hold AssetResponse 배열이 비어 있습니다.');
          }
        } else {
          console.warn('[handleTrade] hold API 응답 없음 또는 오류:', response);
        }

        // 관망 거래 기록 추가
        const newTrade: TradeRecord = {
          action: 'hold',
          price: 0,
          quantity: 0,
          timestamp: new Date(),
          stockCandleId: endPointId,
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
        startStockCandleId: startPointId,
        endStockCandleId: endPointId,
      });

      console.log(`[handleTrade] ${action} API 응답:`, response);
      // 응답 디버그 추가
      debugAPIResponse(response, `handleTrade ${action}`);

      // API 응답에서 자산 정보 업데이트
      if (response.isSuccess && response.result) {
        // 배열인지 확인
        const assetResponses = Array.isArray(response.result)
          ? response.result
          : response.result.AssetResponse || [];

        console.log(`[handleTrade] ${action} AssetResponse 배열:`, assetResponses);

        if (assetResponses.length > 0) {
          // 최신 자산 정보 가져오기 (마지막 항목)
          const latestAsset = assetResponses[assetResponses.length - 1];
          console.log(`[handleTrade] ${action} 최신 자산 정보:`, latestAsset);

          // 필수 필드 존재 여부 확인
          if (
            latestAsset &&
            'availableOrderAsset' in latestAsset &&
            'currentTotalAsset' in latestAsset &&
            'totalReturnRate' in latestAsset &&
            'tradingDate' in latestAsset
          ) {
            // 자산 정보 업데이트
            const newAssetInfo = {
              tradingDate: latestAsset.tradingDate,
              availableOrderAsset: latestAsset.availableOrderAsset,
              currentTotalAsset: latestAsset.currentTotalAsset,
              totalReturnRate: latestAsset.totalReturnRate,
            };

            console.log(`[handleTrade] ${action} 새 자산 정보로 업데이트:`, newAssetInfo);
            setAssetInfo(newAssetInfo);
            console.log(`[handleTrade] ${action} 업데이트 후 확인:`, newAssetInfo);
          } else {
            console.error(`[handleTrade] ${action} 필요한 필드가 없습니다:`, latestAsset);
          }
        } else {
          console.warn(`[handleTrade] ${action} AssetResponse 배열이 비어 있습니다.`);
        }
      } else {
        console.warn(`[handleTrade] ${action} API 응답 없음 또는 오류:`, response);
      }

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

      // API 응답에 따라 보유 주식 수량 업데이트
      let totalStock = 0;
      if (action === 'buy') {
        totalStock = ownedStockCount + quantity;
      } else if (action === 'sell') {
        totalStock = Math.max(0, ownedStockCount - quantity);
      }

      // 보유 주식 수량 업데이트
      setOwnedStockCount(totalStock);

      // 턴 완료 처리
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
    // 마지막 턴(현재 턴)의 세션 정보 가져오기
    const session = calculateSession(currentTurn);
    if (!session) {
      console.error('[updateAssetInfo] 세션 정보를 가져올 수 없습니다.');
      return;
    }

    // 현재 턴의 차트 데이터 가져오기
    const currentTurnChartData = turnChartData[currentTurn];
    if (!currentTurnChartData?.data || currentTurnChartData.data.length === 0) {
      console.error('[updateAssetInfo] 차트 데이터가 없습니다.');
      return;
    }

    // 일봉 데이터 필터링 및 정렬
    const dayCandles = currentTurnChartData.data
      .filter((candle: StockCandle) => candle.periodType === 1)
      .sort((a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime());

    if (dayCandles.length === 0) {
      console.error('[updateAssetInfo] 일봉 데이터가 없습니다.');
      return;
    }

    // 현재 턴에 해당하는 정확한 구간만 필터링
    const turnStartDate = session.startDate;
    const turnEndDate = session.endDate;

    const turnSpecificCandles = dayCandles.filter((candle) => {
      const candleDate = formatDateToYYMMDD(new Date(candle.tradingDate));
      return candleDate >= turnStartDate && candleDate <= turnEndDate;
    });

    // 현재 턴의 시작점과 끝점 ID 설정
    let startPointId = 0;
    let endPointId = 0;

    if (turnSpecificCandles.length > 0) {
      // 현재 턴의 구간에 해당하는 캔들 ID 사용
      startPointId = turnSpecificCandles[0].stockCandleId;
      endPointId = turnSpecificCandles[turnSpecificCandles.length - 1].stockCandleId;

      console.log(
        `[자산 정보 업데이트] 턴 ${currentTurn}, 정확한 구간 stockCandleId: ${startPointId} ~ ${endPointId}`,
      );
    } else {
      // 턴별 구간이 없으면 전체 차트에서 첫/마지막 캔들 ID 사용 (폴백)
      startPointId = dayCandles[0].stockCandleId;
      endPointId = dayCandles[dayCandles.length - 1].stockCandleId;

      console.log(
        `[자산 정보 업데이트] 턴 ${currentTurn}, 폴백 구간 stockCandleId: ${startPointId} ~ ${endPointId}`,
      );
    }

    try {
      // 실제 거래 없이 자산 정보만 가져오기 위해 observe 액션 사용
      console.log('[updateAssetInfo] API 요청 시작:', {
        memberId,
        action: 'hold',
        price: 0,
        quantity: 0,
        companyId,
        startStockCandleId: startPointId,
        endStockCandleId: endPointId,
      });

      const response = await processUserAction.mutateAsync({
        memberId,
        action: 'hold',
        price: 0,
        quantity: 0,
        companyId,
        startStockCandleId: startPointId,
        endStockCandleId: endPointId,
      });

      console.log('[updateAssetInfo] API 응답 전체:', response);
      // 응답 디버그 추가
      debugAPIResponse(response, 'updateAssetInfo');

      // API 응답에서 자산 정보 업데이트
      if (response.isSuccess && response.result) {
        // 배열인지 확인
        const assetResponses = Array.isArray(response.result)
          ? response.result
          : response.result.AssetResponse || [];

        console.log('[updateAssetInfo] AssetResponse 배열:', assetResponses);

        if (assetResponses.length > 0) {
          // 최신 자산 정보 가져오기 (마지막 항목)
          const latestAsset = assetResponses[assetResponses.length - 1];
          console.log('[updateAssetInfo] 최신 자산 정보:', latestAsset);

          // 필수 필드 존재 여부 확인
          if (
            latestAsset &&
            'availableOrderAsset' in latestAsset &&
            'currentTotalAsset' in latestAsset &&
            'totalReturnRate' in latestAsset &&
            'tradingDate' in latestAsset
          ) {
            // 자산 정보 업데이트
            const newAssetInfo = {
              tradingDate: latestAsset.tradingDate,
              availableOrderAsset: latestAsset.availableOrderAsset,
              currentTotalAsset: latestAsset.currentTotalAsset,
              totalReturnRate: latestAsset.totalReturnRate,
            };

            console.log('[updateAssetInfo] 변경 전 자산 정보:', assetInfo);
            console.log('[updateAssetInfo] 새 자산 정보로 업데이트:', newAssetInfo);

            setAssetInfo(newAssetInfo);
            console.log('[updateAssetInfo] 업데이트 후 확인:', newAssetInfo);

            // 최종 수익률 설정
            console.log('[updateAssetInfo] 최종 수익률 설정:', latestAsset.totalReturnRate);
            setFinalChangeRate(latestAsset.totalReturnRate);
          } else {
            console.error('[updateAssetInfo] 필요한 필드가 없습니다:', latestAsset);
          }
        } else {
          console.warn('[updateAssetInfo] AssetResponse 배열이 비어 있습니다.');
        }
      } else {
        console.warn('[updateAssetInfo] API 응답 없음 또는 오류:', response);
      }
    } catch (error) {
      console.error('[updateAssetInfo] 자산 정보 업데이트 중 오류:', error);
    }
  };

  // 일시적으로 moveToNextTurn을 일반 함수로 선언 (loadChartData 의존성 제거)

  const moveToNextTurn = async () => {
    if (currentTurn < 4) {
      try {
        // 다음 턴 번호 계산
        const nextTurn = currentTurn + 1;

        // 세션 업데이트 및 데이터 로드
        const newSession = calculateSession(nextTurn);
        if (!newSession) return;

        // 다음 턴으로 이동하기 전에 자산 정보를 업데이트
        // 이렇게 하면 이전 턴의 거래 결과가 다음 턴에서 확인 가능
        await updateAssetInfo();

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

        // API 호출을 위한 정확한 턴별 구간 stockCandleId 확인 (이 정보는 자산 정보 업데이트 등 API 호출에 사용)
        const turnStartDate = newSession.startDate;
        const turnEndDate = newSession.endDate;

        // 현재 턴에 해당하는 정확한 구간만 필터링
        const turnSpecificCandles = dayCandles.filter((candle) => {
          const candleDate = formatDateToYYMMDD(new Date(candle.tradingDate));
          return candleDate >= turnStartDate && candleDate <= turnEndDate;
        });

        if (turnSpecificCandles.length > 0) {
          const turnStartId = turnSpecificCandles[0].stockCandleId;
          const turnEndId = turnSpecificCandles[turnSpecificCandles.length - 1].stockCandleId;
          console.log(
            `[턴 ${nextTurn} 정확한 구간] 시작 stockCandleId: ${turnStartId}, 끝 stockCandleId: ${turnEndId}`,
          );
        }

        // 뉴스 데이터 로드 (이미 로드된 경우 또는 요청 중인 경우 스킵)
        if (!newsRequestRef.current[nextTurn] && !loadedTurnsRef.current[nextTurn]) {
          await loadNewsData(nextTurn);
        }

        // 현재 턴의 교육용 뉴스가 있으면 설정
        if (turnCurrentNews[nextTurn] && Object.keys(turnCurrentNews[nextTurn]).length > 0) {
          setCurrentNews(turnCurrentNews[nextTurn]);
        }

        // 현재 턴의 코멘트가 있으면 설정
        if (turnComments[nextTurn]) {
          setNewsComment(turnComments[nextTurn]);
        }

        // 현재 턴까지의 모든 뉴스 누적 (구간별)
        const accumulatedNews: NewsResponse[] = [];
        const uniqueNewsMap = new Map();

        // 현재 턴까지의 모든 뉴스를 누적
        for (let t = 1; t <= nextTurn; t++) {
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

        // 뉴스가 있으면 날짜 기준으로 정렬 (최신순)
        if (accumulatedNews.length > 0) {
          const sortedNews = [...accumulatedNews].sort(
            (a, b) => new Date(b.newsDate).getTime() - new Date(a.newsDate).getTime(),
          );
          setPastNewsList(sortedNews);
        } else {
          setPastNewsList([]);
        }

        // 차트 데이터 로드 후 현재 주가 확인
        let nextTurnPrice = latestPrice;

        if (dayCandles.length > 0) {
          // 턴에 맞는 종가 설정
          nextTurnPrice = dayCandles[dayCandles.length - 1].closePrice;
        }

        // 최신 가격 업데이트
        setLatestPrice(nextTurnPrice);

        // 마지막 턴인 경우 최종 수익률 설정
        if (nextTurn === 4) {
          setFinalChangeRate(assetInfo.totalReturnRate);
        }
      } catch (error) {
        console.error('다음 턴으로 이동 중 오류:', error);
        toast.error('다음 턴으로 이동 중 오류가 발생했습니다.');
        // 세션 및 턴 정보 원상복구
        setCurrentTurn(currentTurn);
        setIsCurrentTurnCompleted(true);
      }
    }
  };

  // 튜토리얼 시작 함수 추가

  const handleTutorialStart = async () => {
    if (!isUserLoggedIn()) {
      alert('로그인이 필요한 기능입니다.');
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

        // 첫 번째 턴에 맞는 세션 계산
        const firstSession = calculateSession(1);
        if (!firstSession) {
          throw new Error('세션 계산 실패');
        }

        setCurrentSession(firstSession);
        setProgress(25);

        // 이전 API 요청 상태 초기화
        newsRequestRef.current = {};
        loadedTurnsRef.current = {
          1: false,
          2: false,
          3: false,
          4: false,
        };

        // 첫 번째 턴 차트 데이터 로드 (시작부터 첫 번째 턴의 끝까지)
        return loadChartData(defaultStartDate, firstSession.endDate, 1);
      })
      .catch(() => {
        setHasChartError(true);
        toast.error('튜토리얼 초기화 중 오류가 발생했습니다.');
      })
      .finally(() => {
        setIsChartLoading(false);
      });
  };

  // 튜토리얼 완료 처리 함수

  const completeTutorial = async () => {
    if (!isUserLoggedIn()) return;

    try {
      // 튜토리얼 완료 전 자산 정보 최종 업데이트
      await updateAssetInfo();

      // 충분한 시간을 두고 자산 정보가 업데이트되었는지 확인
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 4단계에서 isCurrentTurnCompleted를 true로 설정하여 피드백 API가 호출되도록 함
      if (!isCurrentTurnCompleted) {
        setIsCurrentTurnCompleted(true);

        // 피드백 데이터가 로드될 시간 확보 (500ms)
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // 피드백 데이터가 있는지 확인하고 없으면 수동으로 로드
      if (!tutorialFeedback) {
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

      // 현재 자산 정보에서 최종 수익률 가져오기
      // 최신 수익률 정보를 확실히 사용하기 위해 현재 자산 정보에서 직접 가져옴
      const finalRate = assetInfo.totalReturnRate;

      // 최종 수익률 설정
      console.log(`[튜토리얼 완료] 최종 수익률 설정: ${finalRate}%`);
      setFinalChangeRate(finalRate);

      let saveSuccess = false;
      try {
        // 튜토리얼 결과 저장
        const saveResponse = await saveTutorialResult.mutateAsync({
          companyId,
          startMoney: 10000000,
          endMoney: assetInfo.currentTotalAsset,
          changeRate: finalRate,
          startDate: oneYearAgo.toISOString(),
          endDate: currentDate.toISOString(),
          memberId: memberId,
        });

        saveSuccess = saveResponse.isSuccess;

        if (saveSuccess) {
          console.log(`[튜토리얼 완료] 결과 저장 성공 - 최종 수익률: ${finalRate}%`);
        } else {
          console.warn('[튜토리얼 완료] 결과 저장 실패');
        }
      } catch (error) {
        console.error('[튜토리얼 완료] 결과 저장 중 오류:', error);
      }

      // 세션 삭제 시도 (결과 저장 성공 여부와 관계없이)
      try {
        await deleteTutorialSession.mutateAsync(memberId);
        console.log('[튜토리얼 완료] 세션 삭제 성공');
      } catch (error) {
        console.warn('[튜토리얼 완료] 세션 삭제 실패, 재시도 중...');

        // 세션 삭제 실패 시 다시 시도
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));
          await deleteTutorialSession.mutateAsync(memberId);
          console.log('[튜토리얼 완료] 세션 삭제 재시도 성공');
        } catch (retryError) {
          console.error('[튜토리얼 완료] 세션 삭제 재시도 실패');
        }
      }

      // 충분한 지연 후 모달 표시 (상태 업데이트가 완전히 완료된 후)
      setTimeout(() => {
        console.log('[튜토리얼 완료] 종료 모달 표시');
        setIsModalOpen(true);
      }, 500);
    } catch (error) {
      console.error('[튜토리얼 완료] 오류 발생:', error);
      toast.error('튜토리얼 완료 처리 중 오류가 발생했습니다.');
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
    // 이미 요청 중인 턴에 대해서는 중복 요청하지 않음
    if (newsRequestRef.current[turn]) {
      return;
    }

    // 해당 턴의 API 요청 상태를 true로 설정
    newsRequestRef.current = {
      ...newsRequestRef.current,
      [turn]: true,
    };

    // 4턴일 때는 로딩 스피너 및 로딩 메시지를 표시하지 않음
    if (turn !== 4) {
      // 랜덤 로딩 메시지 설정
      const loadingMessages = [
        '오늘의 힌트: 시장을 흔든 그 한 줄을 찾는 중...',
        '그날의 흐름을 만든 뉴스 데이터를 탐색 중입니다...',
        '시장을 움직인 결정적 순간을 추적 중입니다...',
        '그 시점, 무슨 일이 있었을까... 뉴스 단서 수집 중',
        '투자의 힌트는 과거에 있다. 뉴스 맥락을 파악하는 중...',
      ];
      setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);

      // 뉴스 로딩 상태 설정
      setIsNewsLoading(true);
    }

    // 변곡점 ID가 없으면 먼저 로드
    if (pointStockCandleIds.length === 0) {
      await loadPointsData();
    }

    // 구간별 시작/종료 ID 계산
    let startStockCandleId = 1; // 기본값
    let endStockCandleId = 0; // 기본값

    // 히스토리와 코멘트용 ID 범위: 구간별 설정
    if (turn === 1) {
      // 첫 번째 턴: 시작점 ~ 변곡점1 - 1
      startStockCandleId = 1; // 시작점
      endStockCandleId = pointStockCandleIds[0] > 1 ? pointStockCandleIds[0] - 1 : 500;
    } else if (turn === 2) {
      // 두 번째 턴: 변곡점1 ~ 변곡점2 - 1
      startStockCandleId = pointStockCandleIds[0] > 0 ? pointStockCandleIds[0] : 500;
      endStockCandleId = pointStockCandleIds[1] > 1 ? pointStockCandleIds[1] - 1 : 1000;
    } else if (turn === 3) {
      // 세 번째 턴: 변곡점2 ~ 변곡점3 - 1
      startStockCandleId = pointStockCandleIds[1] > 0 ? pointStockCandleIds[1] : 1000;
      endStockCandleId = pointStockCandleIds[2] > 1 ? pointStockCandleIds[2] - 1 : 1500;
    } else if (turn === 4) {
      // 네 번째 턴: 변곡점3 ~ 끝점
      startStockCandleId = pointStockCandleIds[2] > 0 ? pointStockCandleIds[2] : 1500;
      endStockCandleId = pointStockCandleIds.length >= 3 ? pointStockCandleIds[2] + 1000 : 2000;
    }

    try {
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
        //
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

        // API 에러 상세 정보 로깅
        if (error instanceof Error) {
          console.error('[API 에러 상세]:', error.message);

          if ('response' in error) {
            try {
              // @ts-expect-error: response 객체에 text 메서드 접근
              const responseText = await error.response?.text();
              console.error('[API 에러 응답]:', responseText);
            } catch (textError) {
              console.error('[API 응답 파싱 실패]');
            }
          }
        }

        // 에러 시 빈 배열로 설정
        setTurnNewsList((prev) => ({
          ...prev,
          [turn]: [],
        }));

        if (turn === currentTurn) {
          setPastNewsList([]);
        }
      }

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
          // 데이터 로드 완료 처리
          handleNewsDataLoaded(turn);
          return;
        }

        // 교육용 뉴스 ID가 없으면 요청하지 않음
        if (educationalNewsId <= 0) {
          if (turn === currentTurn) {
            setCurrentNews(null);
          }
          handleNewsDataLoaded(turn);
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
        // 기본값으로 설정
        if (turn === currentTurn) {
          setCurrentNews(null);
        }
      }
    } finally {
      // API 요청 완료 처리
      handleNewsDataLoaded(turn);
      // 뉴스 로딩 상태 해제
      setIsNewsLoading(false);
    }
  };

  // 차트 데이터 로드
  const loadChartData = async (startDate: string, endDate: string, turn: number) => {
    // 중복 로드 방지
    const sessionKey = `${startDate}-${endDate}-${turn}`;
    if (prevSessionRef.current === sessionKey) {
      return;
    }
    prevSessionRef.current = sessionKey;

    setIsChartLoading(true);
    setHasChartError(false);

    // 차트 데이터 누적 호출을 위한 URL 생성 (항상 기본 시작점부터 현재 턴의 끝까지)
    const apiUrl = `stocks/${companyId}/tutorial?startDate=${startDate}&endDate=${endDate}`;

    try {
      console.log(`[턴 ${turn} 차트 로드 요청] 누적 구간: ${startDate} ~ ${endDate}`);

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

      // 뉴스 데이터 로드 (API 요청이 중복되지 않도록 조건 체크)
      if (!newsRequestRef.current[turn] && !loadedTurnsRef.current[turn]) {
        await loadNewsData(turn);
      }

      // 데이터 로드가 완료되었음을 나타내는 return
      return result;
    } catch (error) {
      console.error(`[턴 ${turn} 차트 로드] 오류:`, error);
      setHasChartError(true);
      return null;
    } finally {
      setIsChartLoading(false);
    }
  };

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

      // 차트 데이터 로드 - 항상 누적 방식 사용
      await loadChartData(defaultStartDate, session.endDate, currentTurn);

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
    console.log('[handleTutorialButtonClick] 상태:', {
      isTutorialStarted,
      isCurrentTurnCompleted,
      currentTurn,
    });

    if (!isTutorialStarted) {
      // 튜토리얼 시작
      console.log('[handleTutorialButtonClick] 튜토리얼 시작 호출');
      handleTutorialStart();
    } else if (currentTurn === 4) {
      console.log('[튜토리얼 버튼 클릭] 4단계 완료, 튜토리얼 결과 표시');

      // 튜토리얼 완료 처리
      await completeTutorial();
    } else if (isCurrentTurnCompleted) {
      console.log(`[튜토리얼 버튼 클릭] ${currentTurn}단계 완료, 다음 단계로 이동`);

      // 턴 변경 전 자산 정보를 확실히 업데이트
      await updateAssetInfo();

      // 0.5초 지연 후 다음 턴으로 이동 (API 응답 처리 시간 확보)
      setTimeout(async () => {
        await moveToNextTurn();
      }, 500);
    } else {
      console.log(`[튜토리얼 버튼 클릭] ${currentTurn}단계 미완료, 알림 표시`);
      toast.info('해당 단계의 주식 매매를 완료해야 다음 단계로 넘어갈 수 있습니다.');
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
    if (isTutorialStarted || isNewsModalOpen || isNewsLoading || isChartLoading) {
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
  }, [isTutorialStarted, isNewsModalOpen, isNewsLoading, isChartLoading]);

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

  return (
    <>
      {/* 투어 컴포넌트 추가 */}
      <SimulationTour run={runTour} setRun={setRunTour} />

      {/* 뉴스 모달이 열려있을 때 또는 로딩 중일 때 전체 페이지에 클릭 방지 오버레이 추가 */}
      {(isNewsModalOpen || isNewsLoading) && (
        <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          {isNewsLoading && !isNewsModalOpen && (
            <LoadingSpinner size="large">
              <p className="mt-4 text-white">{loadingMessage}</p>
            </LoadingSpinner>
          )}
        </div>
      )}

      {/* 기존 컴포넌트 */}
      <div
        className="flex h-full w-full flex-col px-6"
        style={{ pointerEvents: isNewsModalOpen || isNewsLoading ? 'none' : 'auto' }}
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
          />
        </div>
        <div className="mb-[20px] flex justify-between">
          <div className="stock-tutorial-money-info">
            <StockTutorialMoneyInfo
              initialAsset={10000000}
              availableOrderAsset={assetInfo.availableOrderAsset}
              currentTotalAsset={assetInfo.currentTotalAsset}
              totalReturnRate={assetInfo.totalReturnRate}
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
              <div className="chart-tutorial relative h-full" id="chart-tutorial">
                <ChartComponent
                  periodData={stockData || undefined}
                  inflectionPoints={pointDates.map((date, index) => ({
                    date: date,
                    label: `변곡점${index + 1}`,
                    index: pointStockCandleIds[index] ? pointStockCandleIds[index] - 1 : 0,
                  }))}
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
                initSessionPending={initSessionMutation.isPending}
                companyInfoExists={!!companyInfo}
              />
            </div>
          </div>
        </div>

        <div className="mt-[24px] grid grid-cols-6 gap-3">
          <div className="stock-tutorial-comment col-span-3" ref={commentRef}>
            <StockTutorialComment comment={newsComment} isTutorialStarted={isTutorialStarted} />
          </div>
          <div className="day-history col-span-3">
            <DayHistory
              news={pastNewsList}
              height={commentHeight}
              isTutorialStarted={isTutorialStarted}
            />
          </div>
        </div>
        <div className="mt-[25px] grid grid-cols-6 gap-3">
          <div className="stock-tutorial-news col-span-4">
            <StockTutorialNews
              currentNews={currentNews}
              companyId={companyId}
              currentTurn={currentTurn}
            />
          </div>
          <div className="stock-tutorial-conclusion col-span-2">
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
