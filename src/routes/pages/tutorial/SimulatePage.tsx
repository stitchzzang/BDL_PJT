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
      // 해당 턴의 과거 뉴스 데이터 설정
      const turnNews = turnNewsList[currentTurn];
      setPastNewsList(turnNews || []);

      // 이미 API가 호출되었지만 데이터가 없는 경우 다시 로드
      if ((!turnNews || turnNews.length === 0) && isTutorialStarted) {
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

  // 거래 처리 함수
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
      return;
    }

    if (!memberId) {
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

    // 관망 선택 시 API 호출 없이 턴 완료 처리 후 자동으로 다음 턴으로 이동
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

      // 관망 시에도 자산 정보 업데이트
      try {
        // 관망은 보유 주식 수량 변동 없음, 주문 가능 자산도 변동 없음
        // 현재 보유 주식 가치 계산
        const stockValue = prevOwnedStockCount * latestPrice;

        // 현재 총자산 = 주문 가능 자산 + 보유 주식 가치
        const newTotalAsset = prevAvailableAsset + stockValue;

        // 수익률 계산: (현재 총자산 - 초기 자산) / 초기 자산 * 100
        const newReturnRate = ((newTotalAsset - 10000000) / 10000000) * 100;

        // 자산 정보 직접 업데이트 (state 참조 없이)
        const updatedAssetInfo = {
          tradingDate: new Date().toISOString(),
          availableOrderAsset: prevAvailableAsset,
          currentTotalAsset: newTotalAsset,
          totalReturnRate: newReturnRate,
        };

        // 자산 정보 업데이트
        setAssetInfo(updatedAssetInfo);
        setFinalChangeRate(newReturnRate);

        console.log('관망 선택 - 자산 정보 업데이트:', updatedAssetInfo);
      } catch (error) {
        console.error('자산 정보 업데이트 중 오류 발생:', error);
      }

      // 턴 완료 처리
      setIsCurrentTurnCompleted(true);

      // 잠시 후 자동으로 다음 턴으로 이동
      setTimeout(() => {
        moveToNextTurn();
      }, 500);

      return;
    }

    // API 요청은 buy 또는 sell 액션에 대해서만 처리
    processUserAction
      .mutateAsync({
        memberId,
        action: action.toLowerCase(),
        price,
        quantity,
        companyId,
        startStockCandleId: startPointId,
        endStockCandleId: endPointId,
      })
      .then((response) => {
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

        // 매수/매도에 따른 자산 계산 (API 응답 없을 경우 대비)
        let newAvailableAsset = prevAvailableAsset;
        let newOwnedStockCount = prevOwnedStockCount;

        if (action === 'buy') {
          // 매수: 주문 가능 금액에서 (지정가 * 수량) 차감
          newAvailableAsset -= price * quantity;
          // 보유 주식 수 증가
          newOwnedStockCount += quantity;
        } else if (action === 'sell') {
          // 매도: 주문 가능 금액 증가 (지정가 * 수량)
          newAvailableAsset += price * quantity;
          // 보유 주식에서 해당 수량 차감
          newOwnedStockCount = Math.max(0, newOwnedStockCount - quantity);
        }

        // 현재 보유 주식 가치 계산
        const stockValue = newOwnedStockCount * latestPrice;

        // 현재 총자산 = 주문 가능 자산 + 보유 주식 가치
        const newTotalAsset = newAvailableAsset + stockValue;

        // 수익률 계산: (현재 총자산 - 초기 자산) / 초기 자산 * 100
        const newReturnRate = ((newTotalAsset - 10000000) / 10000000) * 100;

        // 자산 정보 업데이트 (서버 응답과 로컬 계산 중 선택)
        if (response.result?.AssetResponse && response.result.AssetResponse.length > 0) {
          const lastAsset = response.result.AssetResponse[response.result.AssetResponse.length - 1];

          // 서버 응답 자산 정보로 업데이트 (가능한 경우)
          setAssetInfo(lastAsset);
          setFinalChangeRate(lastAsset.totalReturnRate);

          // 서버 응답 데이터 로깅
          console.log('서버 응답으로 자산 정보 업데이트:', lastAsset);
        } else {
          // 서버 응답이 없는 경우 로컬에서 계산된 값 사용
          const localCalculatedAsset = {
            tradingDate: new Date().toISOString(),
            availableOrderAsset: newAvailableAsset,
            currentTotalAsset: newTotalAsset,
            totalReturnRate: newReturnRate,
          };

          // 로컬 계산 자산 정보로 업데이트
          setAssetInfo(localCalculatedAsset);
          setFinalChangeRate(newReturnRate);

          // 로컬 계산 데이터 로깅
          console.log('로컬 계산으로 자산 정보 업데이트:', localCalculatedAsset);
        }

        // 보유 주식 수량 업데이트 (직접 계산값 사용)
        setOwnedStockCount(newOwnedStockCount);

        // 턴 완료 처리
        setIsCurrentTurnCompleted(true);
      })
      .catch(async (error) => {
        // 오류 상세 정보 출력
        if (error instanceof Error) {
          const errorText = await (error as any).response?.text?.().catch(() => null);

          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.message) {
                alert(`거래 오류: ${errorJson.message}`);

                // 보유량 부족 오류인 경우 거래 내역 기반으로 보유량 재계산
                if (
                  errorJson.code === 7105 ||
                  errorJson.message.includes('보유한 주식 수량이 부족')
                ) {
                  await initOwnedStockCount(); // 거래 내역에서 재계산
                }
                return;
              }
            } catch {
              // JSON 파싱 오류 무시
            }
          }
        }

        alert('거래 처리 중 오류가 발생했습니다.');
        await initOwnedStockCount(); // 주식 수량 재계산
      });
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

  // 튜토리얼 완료 처리 함수
  const completeTutorial = async () => {
    if (!memberId) return;

    // 튜토리얼 완료 전 자산 정보 최종 업데이트
    updateAssetInfo();

    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

    saveTutorialResult
      .mutateAsync({
        companyId,
        startMoney: 10000000,
        endMoney: assetInfo.currentTotalAsset,
        changeRate: assetInfo.totalReturnRate,
        startDate: oneYearAgo.toISOString(),
        endDate: currentDate.toISOString(),
        memberId: memberId,
      })
      .then(() => {
        setIsModalOpen(true);
        setFinalChangeRate(assetInfo.totalReturnRate);
      })
      .catch(() => {
        // 오류 발생시 모달은 표시하되 현재 수익률 사용
        setIsModalOpen(true);
        setFinalChangeRate(assetInfo.totalReturnRate);
      });
  };

  // 다음 턴으로 이동하는 함수
  const moveToNextTurn = async () => {
    if (currentTurn < 4) {
      try {
        // 현재 턴의 마지막 가격과 상태 저장 (비동기 작업 전에 값을 보존)
        const prevTurnLastPrice = latestPrice;
        const prevAvailableOrderAsset = assetInfo.availableOrderAsset;
        const prevOwnedStock = ownedStockCount;

        // 현재 턴 데이터에서 실제 마지막 일봉 가격 확인 (더 정확한 값)
        let actualPrevTurnLastPrice = prevTurnLastPrice;
        const currentTurnData = turnChartData[currentTurn];
        if (currentTurnData?.data && currentTurnData.data.length > 0) {
          const dayCandles = currentTurnData.data.filter(
            (candle: StockCandle) => candle.periodType === 1,
          );
          if (dayCandles.length > 0) {
            const sortedCandles = [...dayCandles].sort(
              (a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime(),
            );
            actualPrevTurnLastPrice = sortedCandles[sortedCandles.length - 1].closePrice;
            console.log(`현재 턴(${currentTurn})의 실제 마지막 가격: ${actualPrevTurnLastPrice}`);
          }
        }

        // 다음 턴 번호 설정 및 UI 상태 업데이트
        const nextTurn = currentTurn + 1;
        setCurrentTurn(nextTurn);
        setIsCurrentTurnCompleted(false);

        // 세션 업데이트 및 데이터 로드 (차트 데이터 비동기 로드)
        await updateSessionAndLoadData(nextTurn);

        // 자산 정보가 리셋되지 않도록 1초 지연 후 처리
        // (차트 데이터가 완전히 로드된 후에 자산 정보를 업데이트)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 다음 턴의 첫 가격 확인 (차트 데이터 로드 완료 후)
        const nextTurnData = turnChartData[nextTurn];
        if (!nextTurnData?.data || nextTurnData.data.length === 0) {
          console.error(`다음 턴(${nextTurn})의 차트 데이터가 없습니다.`);
          return;
        }

        // 다음 턴의 첫 일봉 가격 가져오기
        const dayCandles = nextTurnData.data.filter(
          (candle: StockCandle) => candle.periodType === 1,
        );

        if (dayCandles.length === 0) {
          console.error(`다음 턴(${nextTurn})의 일봉 데이터가 없습니다.`);
          return;
        }

        // 날짜순 정렬
        const sortedCandles = [...dayCandles].sort(
          (a, b) => new Date(a.tradingDate).getTime() - new Date(b.tradingDate).getTime(),
        );

        // 다음 턴의 첫 일봉 종가
        const nextTurnFirstPrice = sortedCandles[0].closePrice;

        // 자산 정보 직접 업데이트 (상태 리셋 방지를 위해 복원)
        console.log(`턴 전환 가격 정보: ${actualPrevTurnLastPrice} -> ${nextTurnFirstPrice}`);
        console.log(`보유 주식: ${prevOwnedStock}주, 주문가능: ${prevAvailableOrderAsset}원`);

        // 턴 변경에 따른 자산 정보 업데이트 (가격 변화 반영)
        const updatedAssets = {
          tradingDate: new Date().toISOString(),
          availableOrderAsset: prevAvailableOrderAsset,
          currentTotalAsset: prevAvailableOrderAsset + prevOwnedStock * nextTurnFirstPrice,
          totalReturnRate:
            ((prevAvailableOrderAsset + prevOwnedStock * nextTurnFirstPrice - 10000000) /
              10000000) *
            100,
        };

        // 자산 정보 동기적으로 직접 업데이트
        setAssetInfo(updatedAssets);
        setFinalChangeRate(updatedAssets.totalReturnRate);

        console.log('턴 전환 자산 정보 직접 업데이트 완료:', updatedAssets);
      } catch (error) {
        console.error('턴 전환 중 오류 발생:', error);
      }
    } else {
      await completeTutorial();
    }
  };

  // 자산 정보 업데이트 함수 추가
  const updateAssetInfo = () => {
    try {
      // 이전 상태 값 저장 (초기화 방지용)
      const prevAvailableAsset = assetInfo.availableOrderAsset;

      // 현재 보유 주식 가치 계산
      const stockValue = ownedStockCount * latestPrice;

      // 현재 총자산 = 주문 가능 자산 + 보유 주식 가치
      const newTotalAsset = prevAvailableAsset + stockValue;

      // 수익률 계산: (현재 총자산 - 초기 자산) / 초기 자산 * 100
      const newReturnRate = ((newTotalAsset - 10000000) / 10000000) * 100;

      // 자산 정보 직접 업데이트 (상태 참조 없이)
      const updatedAssetInfo = {
        tradingDate: new Date().toISOString(),
        availableOrderAsset: prevAvailableAsset,
        currentTotalAsset: newTotalAsset,
        totalReturnRate: newReturnRate,
      };

      // 자산 정보 업데이트
      setAssetInfo(updatedAssetInfo);
      setFinalChangeRate(newReturnRate);

      console.log('일반 자산 정보 업데이트 완료:', {
        보유주식: ownedStockCount,
        현재가격: latestPrice,
        자산정보: updatedAssetInfo,
      });
    } catch (error) {
      console.error('자산 정보 업데이트 중 오류 발생:', error);
    }
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

    _ky
      .get(apiUrl)
      .json()
      .then((response) => {
        const stockDataResponse = response as ApiResponse<TutorialStockResponse>;

        if (!stockDataResponse?.result?.data || stockDataResponse.result.data.length === 0) {
          setHasChartError(true);
          return;
        }

        const result = stockDataResponse.result;

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

        // 최신 가격 업데이트
        updateLatestPrice(result);

        // 가격 업데이트 후 자산 정보도 업데이트
        updateAssetInfo();

        // 뉴스 데이터 로드
        return loadNewsData(turn);
      })
      .catch(() => {
        setHasChartError(true);
      })
      .finally(() => {
        setIsChartLoading(false);
      });
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
      const newLatestPrice = lastCandle.closePrice;

      // 가격이 변경된 경우에만 업데이트
      if (newLatestPrice !== latestPrice) {
        // 이전 값 저장 (변화율 계산 및 상태 복원용)
        const prevPrice = latestPrice;
        const prevAvailableAsset = assetInfo.availableOrderAsset;
        const prevTotalAsset = assetInfo.currentTotalAsset;
        const prevReturnRate = assetInfo.totalReturnRate;

        // 최신 가격 업데이트
        setLatestPrice(newLatestPrice);

        // 가격이 변경되었을 때 자산 정보도 업데이트 (첫 로드 이후)
        if (isTutorialStarted && currentTurn > 0 && prevPrice > 0) {
          // 비동기 타이밍 문제 해결을 위해 약간 지연
          setTimeout(() => {
            try {
              // 현재 보유 주식 가치 (새 가격 기준)
              const newStockValue = ownedStockCount * newLatestPrice;

              // 현재 총자산 = 주문 가능 자산 + 보유 주식 가치
              const newTotalAsset = prevAvailableAsset + newStockValue;

              // 수익률 계산: (현재 총자산 - 초기 자산) / 초기 자산 * 100
              const newReturnRate = ((newTotalAsset - 10000000) / 10000000) * 100;

              // 자산 정보 직접 업데이트 (중간 상태 유지)
              const updatedAssetInfo = {
                tradingDate: new Date().toISOString(),
                availableOrderAsset: prevAvailableAsset, // 주문 가능 자산은 변동 없음
                currentTotalAsset: newTotalAsset,
                totalReturnRate: newReturnRate,
              };

              // 자산 정보 및 수익률 업데이트
              setAssetInfo(updatedAssetInfo);
              setFinalChangeRate(newReturnRate);

              // 디버깅용 로그
              console.log('가격 변동 직접 반영 - 자산 업데이트:', {
                이전가격: prevPrice,
                새가격: newLatestPrice,
                보유주식: ownedStockCount,
                자산정보: updatedAssetInfo,
              });
            } catch (error) {
              console.error('가격 변동에 따른 자산 정보 업데이트 중 오류 발생:', error);

              // 오류 발생 시 이전 상태 복원 (초기화 방지)
              if (prevTotalAsset) {
                setAssetInfo({
                  tradingDate: new Date().toISOString(),
                  availableOrderAsset: prevAvailableAsset,
                  currentTotalAsset: prevTotalAsset,
                  totalReturnRate: prevReturnRate,
                });
              }
            }
          }, 100);
        }
      }
    }
  };

  // 뉴스 데이터 로드
  const loadNewsData = async (turn: number) => {
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

    // ID 범위가 유효한지 확인 - ID 역전은 오류로 처리하지 않음
    if (startStockCandleId <= 0 || endStockCandleId <= 0) {
      // 유효하지 않은 경우 기본값 설정
      startStockCandleId = turn * 100;
      endStockCandleId = (turn + 1) * 100;
    }

    // =============================================================
    // 1. 뉴스 코멘트(요약) API 호출 -> StockTutorialComment 컴포넌트
    // =============================================================
    const commentResponse = await getNewsComment
      .mutateAsync({
        companyId,
        startStockCandleId,
        endStockCandleId,
      })
      .catch((error) => {
        return null;
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

    // =================================================================
    // 2. 과거 뉴스 리스트(변곡점) API 호출 -> DayHistory, DayHistoryCard 컴포넌트
    // =================================================================
    const pastNewsResponse = await getPastNews
      .mutateAsync({
        companyId,
        startStockCandleId,
        endStockCandleId,
      })
      .catch((error) => {
        return null;
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
    } else if (pastNewsResponse?.result) {
      // 직접 result 배열을 사용해보기 (API 응답 구조가 변경되었을 수 있음)

      // result가 배열인지 확인
      if (Array.isArray(pastNewsResponse.result)) {
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
      }
    } else {
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
        const currentNewsResponse = await getCurrentNews
          .mutateAsync({
            companyId,
            stockCandleId: targetStockCandleId,
          })
          .catch((error) => {
            return null;
          });

        if (currentNewsResponse?.result) {
          if (turn === currentTurn) {
            setCurrentNews(currentNewsResponse.result);
          }
        } else {
          if (turn === currentTurn) {
            setCurrentNews(null);
          }
        }
      }
    }

    setIsNewsLoading(false);
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
    if (!memberId) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isTutorialStarted) {
      return;
    }

    setIsChartLoading(true);
    setHasChartError(false);

    // 초기화 API 호출
    initSession
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
      })
      .finally(() => {
        setIsChartLoading(false);
      });
  };

  // 튜토리얼 새로 시작
  const restartTutorial = async () => {
    // 상태 초기화
    setCurrentTurn(0);
    setIsTutorialStarted(false);
    setIsCurrentTurnCompleted(false);
    setPointStockCandleIds([]);
    setPointDates([]);
    setTrades([]);
    setOwnedStockCount(0);
    setTurnChartData({});
    setStockData(null);
    setFullChartData(null);
    setAccumulatedChartData(null);
    setFinalChangeRate(0);
    setPastNewsList([]);
    setCurrentNews(null);
    setNewsComment('');
    setTurnComments({});
    setTurnNewsList({});
    setHasChartError(false);
    setCurrentSession({
      startDate: defaultStartDate,
      endDate: defaultStartDate,
      currentPointIndex: 0,
    });
    setProgress(0);
    setLatestPrice(0);

    // 세션 삭제
    if (memberId) {
      deleteTutorialSession
        .mutateAsync(memberId)
        .catch(() => {
          // 세션 삭제 실패해도 계속 진행
        })
        .finally(() => {
          // 모달 닫기
          setIsModalOpen(false);

          // 잠시 후 다시 시작
          setTimeout(() => {
            handleTutorialStart();
          }, 500);
        });
    } else {
      // memberId가 없는 경우도 계속 진행
      setIsModalOpen(false);
      setTimeout(() => {
        handleTutorialStart();
      }, 500);
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

  // 튜토리얼 버튼 클릭 처리 함수
  const handleTutorialButtonClick = useCallback(() => {
    if (!isTutorialStarted) {
      // 튜토리얼이 시작되지 않은 경우 시작
      handleTutorialStart();
    } else if (isCurrentTurnCompleted) {
      if (currentTurn < 4) {
        // 1-3턴이 완료된 경우 다음 턴으로 이동
        moveToNextTurn();
      } else {
        // 4턴이 완료된 경우 결과 확인 모달 표시
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
  if (!initialized.current) {
    initialized.current = true;
    // setTimeout으로 마이크로태스크 큐에 넣어 렌더링 중 상태 업데이트 방지
    setTimeout(() => {
      if (pointDates.length < 3) {
        loadPointsData();
      }
    }, 0);
  }

  // 초기 데이터 로드 함수
  const loadInitialData = useCallback(async () => {
    if (!isTutorialStarted || currentTurn <= 0) return;

    // 변곡점 데이터가 없으면 먼저 로드
    if (pointStockCandleIds.length === 0) {
      await loadPointsData().catch(() => {
        // 오류 무시하고 계속 진행
      });
    }

    // 현재 턴의 세션 계산
    const session = calculateSession(currentTurn);
    if (!session) {
      return;
    }

    // 보유 주식 수량 초기화 (서버 API 호출 없이 거래 내역 기반으로 계산)
    await initOwnedStockCount();

    // 차트 데이터 로드 - 비동기 작업 동시 실행
    loadChartData(session.startDate, session.endDate, currentTurn)
      .then(() => {
        // 차트 데이터 로드 성공 후 뉴스 데이터 로드
        return loadNewsData(currentTurn);
      })
      .catch(() => {
        // 오류 무시하고 계속 진행
      });
  }, [currentTurn, isTutorialStarted, pointStockCandleIds.length]);

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    if (isTutorialStarted && currentTurn > 0) {
      loadInitialData();
      // 컴포넌트 마운트 시 자산 정보 초기화
      updateAssetInfo();
    }
  }, [loadInitialData, isTutorialStarted, currentTurn]);

  // 거래 내역 변경 시 자산 정보 업데이트
  useEffect(() => {
    if (trades.length > 0 && isTutorialStarted) {
      updateAssetInfo();
    }
  }, [trades, latestPrice]);

  return (
    <div className="flex h-full w-full flex-col px-6">
      <div>
        <StockTutorialInfo
          companyId={companyId}
          isTutorialStarted={isTutorialStarted}
          onTutorialStart={handleTutorialStart}
          onMoveToNextTurn={handleTutorialButtonClick}
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
