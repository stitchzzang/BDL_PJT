import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useGetAccountSummary, useResetAccount } from '@/api/member.api';
import { useDeleteUserSimulated, useUserSimulatedData } from '@/api/stock.api';
import { AccountSummaryResponse } from '@/api/types/member';
import { ErrorScreen } from '@/components/common/error-screen';
import { LoadingAnimation } from '@/components/common/loading-animation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TermTooltip } from '@/components/ui/term-tooltip';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/queryClient';
import { useAccountConnection } from '@/services/SocketAccountService';
import { useAuthStore } from '@/store/useAuthStore';
import {
  addCommasToThousand,
  addStockValueColorClass,
  formatKoreanMoney,
  plusMinusSign,
  roundToTwoDecimalPlaces,
} from '@/utils/numberFormatter';

export const InvestmentResultPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuthStore();
  const {
    data: accountSummary,
    isLoading: isAccountLoading,
    isError: isAccountError,
    refetch: refetchAccountSummary,
  } = useGetAccountSummary(userData.memberId?.toString() ?? '');
  const {
    data: userSimulatedData,
    isLoading: isSimulatedLoading,
    isError: isSimulatedError,
    refetch: refetchUserSimulated,
  } = useUserSimulatedData(userData.memberId);
  const { IsConnected, connectAccount, disconnectAccount } = useAccountConnection();

  // 이전 데이터를 ref로 관리하여 렌더링 트리거 없이 값 보존
  const prevDataRef = useRef<AccountSummaryResponse | null>(null);
  const [accountData, setAccountData] = useState<AccountSummaryResponse | null>(null);
  const [realTimeData, setRealTimeData] = useState<AccountSummaryResponse | null>(null);
  const [activeTab, setActiveTab] = useState('holdings');

  // 하이라이트 타이머를 저장할 ref
  const highlightTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  // 계정 및 항목별 하이라이트 상태를 관리하는 맵
  const [highlightMap, setHighlightMap] = useState<{
    [key: string]: {
      isFlashing: boolean;
      isIncreased?: boolean;
    };
  }>({});

  const { mutate: resetAccount } = useResetAccount(userData.memberId?.toString() ?? '');

  // 주문 취소 뮤테이션
  const deleteSimulatedMutation = useDeleteUserSimulated();

  // 주문 취소 처리
  const handleDeleteOrder = (orderId: number) => {
    deleteSimulatedMutation.mutate(orderId, {
      onSuccess: () => {
        toast.success('주문이 성공적으로 취소되었습니다.');
        queryClient.invalidateQueries({ queryKey: ['userSimulated'] });
        refetchUserSimulated();
      },
      onError: (error) => {
        console.error('주문 취소 실패:', error);
        toast.error('주문 취소에 실패했습니다.');
        refetchUserSimulated();
      },
    });
  };

  // 총 매수/매도 주문 금액 계산
  const buyTotalPrice =
    userSimulatedData
      ?.filter((item) => item.tradeType === 0)
      .reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  const sellTotalPrice =
    userSimulatedData
      ?.filter((item) => item.tradeType === 1)
      .reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  // 주문 유형 변환 함수
  const getTradeTypeText = (tradeType: number) => {
    return tradeType === 0 ? '구매' : '판매';
  };

  // 날짜 포맷 변환 함수
  const formatTradeTime = (tradeTime: string) => {
    try {
      // 서버에서 받은 시간은 UTC이므로 한국 시간으로 변환 (UTC+9)
      const date = new Date(tradeTime);
      const koreanDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      return format(koreanDate, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return tradeTime;
    }
  };

  useEffect(() => {
    if (accountSummary) {
      // 초기값 설정
      setRealTimeData(accountSummary);
      prevDataRef.current = accountSummary;

      // 웹소켓 연결
      connectAccount(userData.memberId?.toString() ?? '', setAccountData);
      return () => {
        disconnectAccount();
      };
    }
  }, [accountSummary, connectAccount, disconnectAccount, userData.memberId]);

  useEffect(() => {
    if (accountData) {
      const prevData = prevDataRef.current;
      // 웹소켓으로 받은 데이터로 상태 업데이트
      setRealTimeData(accountData);

      // 계정별 값 변화 감지 및 하이라이트 설정
      const newHighlightMap: { [key: string]: { isFlashing: boolean; isIncreased?: boolean } } = {};

      // 총 수익률, 총 수익 변화 감지
      if (prevData) {
        // 총 수익률 변화
        if (prevData.totalProfitRate !== accountData.totalProfitRate) {
          // 값 자체의 양수/음수에 따라 isIncreased 설정
          const isIncreased = accountData.totalProfitRate > 0;

          newHighlightMap['totalProfitRate'] = {
            isFlashing: true,
            isIncreased,
          };

          // 이전 타이머 제거
          if (highlightTimersRef.current['totalProfitRate']) {
            clearTimeout(highlightTimersRef.current['totalProfitRate']);
          }

          // 새 타이머 설정 (1초 후 하이라이트 제거)
          highlightTimersRef.current['totalProfitRate'] = setTimeout(() => {
            setHighlightMap((prev) => ({
              ...prev,
              totalProfitRate: { ...prev['totalProfitRate'], isFlashing: false },
            }));
          }, 1000);
        }

        // 총 수익 변화
        if (prevData.totalProfit !== accountData.totalProfit) {
          // 값 자체의 양수/음수에 따라 isIncreased 설정
          const isIncreased = accountData.totalProfit > 0;

          newHighlightMap['totalProfit'] = {
            isFlashing: true,
            isIncreased,
          };

          // 이전 타이머 제거
          if (highlightTimersRef.current['totalProfit']) {
            clearTimeout(highlightTimersRef.current['totalProfit']);
          }

          // 새 타이머 설정 (1초 후 하이라이트 제거)
          highlightTimersRef.current['totalProfit'] = setTimeout(() => {
            setHighlightMap((prev) => ({
              ...prev,
              totalProfit: { ...prev['totalProfit'], isFlashing: false },
            }));
          }, 1000);
        }

        // 보유 종목별 변화 감지
        accountData.accounts?.forEach((account) => {
          const prevAccount = prevData.accounts?.find((a) => a.companyId === account.companyId);

          if (prevAccount) {
            // 종목별 수익률 변화
            if (prevAccount.profitRate !== account.profitRate) {
              const key = `profitRate_${account.companyId}`;
              // 값 자체의 양수/음수에 따라 isIncreased 설정
              const isIncreased = account.profitRate > 0;

              newHighlightMap[key] = { isFlashing: true, isIncreased };

              // 이전 타이머 제거
              if (highlightTimersRef.current[key]) {
                clearTimeout(highlightTimersRef.current[key]);
              }

              // 새 타이머 설정
              highlightTimersRef.current[key] = setTimeout(() => {
                setHighlightMap((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], isFlashing: false },
                }));
              }, 1000);
            }

            // 종목별 수익 변화
            if (prevAccount.profit !== account.profit) {
              const key = `profit_${account.companyId}`;
              // 값 자체의 양수/음수에 따라 isIncreased 설정
              const isIncreased = account.profit > 0;

              newHighlightMap[key] = { isFlashing: true, isIncreased };

              // 이전 타이머 제거
              if (highlightTimersRef.current[key]) {
                clearTimeout(highlightTimersRef.current[key]);
              }

              // 새 타이머 설정
              highlightTimersRef.current[key] = setTimeout(() => {
                setHighlightMap((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], isFlashing: false },
                }));
              }, 250);
            }

            // 종목별 현재가 변화
            if (prevAccount.currentPrice !== account.currentPrice) {
              const key = `currentPrice_${account.companyId}`;
              // 현재가 비교는 이전과 현재 값을 비교하여 증감 판단
              const isIncreased = account.currentPrice > prevAccount.currentPrice;

              newHighlightMap[key] = { isFlashing: true, isIncreased };

              // 이전 타이머 제거
              if (highlightTimersRef.current[key]) {
                clearTimeout(highlightTimersRef.current[key]);
              }

              // 새 타이머 설정
              highlightTimersRef.current[key] = setTimeout(() => {
                setHighlightMap((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], isFlashing: false },
                }));
              }, 250);
            }

            // 종목별 평가금 변화
            if (prevAccount.evaluation !== account.evaluation) {
              const key = `evaluation_${account.companyId}`;
              // 값 자체의 양수/음수에 따라 isIncreased 설정
              const isIncreased = account.evaluation > 0;

              newHighlightMap[key] = { isFlashing: true, isIncreased };

              // 이전 타이머 제거
              if (highlightTimersRef.current[key]) {
                clearTimeout(highlightTimersRef.current[key]);
              }

              // 새 타이머 설정
              highlightTimersRef.current[key] = setTimeout(() => {
                setHighlightMap((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], isFlashing: false },
                }));
              }, 250);
            }
          }
        });
      }

      // 하이라이트 맵 업데이트
      setHighlightMap((prev) => ({
        ...prev,
        ...newHighlightMap,
      }));

      // 이전 데이터 업데이트
      prevDataRef.current = accountData;
    }
  }, [accountData]);

  // 컴포넌트 언마운트시 모든 타이머 제거
  useEffect(() => {
    return () => {
      Object.values(highlightTimersRef.current).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  if (isAccountLoading) {
    return <LoadingAnimation />;
  }

  if (isAccountError) {
    return <ErrorScreen />;
  }

  const displayData = realTimeData || accountSummary;
  if (!displayData) return <LoadingAnimation />;

  // 보유 종목 탭 콘텐츠
  const holdingsTabContent = (
    <>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">
          <div className="flex flex-row gap-2 rounded-lg border border-border-color bg-modal-background-color p-3">
            <p>보유 종목 개수:</p>
            <span>{displayData?.accountCount ? displayData?.accountCount : '0'}개</span>
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>종목명</TableHead>
            <TableHead>총 수익률</TableHead>
            <TableHead>총 수익금(원)</TableHead>
            <TableHead>
              <TermTooltip term="1주 평균 금액">1주 평균 금액</TermTooltip>
              <span className="text-sm text-border-color">(원)</span>
            </TableHead>
            <TableHead>현재가(원)</TableHead>
            <TableHead>
              <TermTooltip term="보유수량">보유수량</TermTooltip>
            </TableHead>
            <TableHead>
              <TermTooltip term="평가금">평가금</TermTooltip>
              <span className="text-sm text-border-color">(원)</span>
            </TableHead>
            <TableHead>
              <TermTooltip term="구매금액">구매금액</TermTooltip>
              <span className="text-sm text-border-color">(원)</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <div className="h-5"></div>
          {displayData?.accounts.length && displayData?.accounts.length > 0 ? (
            displayData?.accounts.map((account) => (
              <TableRow key={account.companyId}>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => navigate(`/investment/simulate/${account.companyId}`)}
                          className="flex flex-row items-center gap-2"
                        >
                          <img
                            src={account.companyImage}
                            alt="companyIcon"
                            className="h-10 w-10 rounded-full"
                          />
                          <span className="underline">{account.companyName}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>종목 상세 페이지로 이동</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.profitRate)} transition-all duration-300 ${
                    highlightMap[`profitRate_${account.companyId}`]?.isFlashing
                      ? highlightMap[`profitRate_${account.companyId}`]?.isIncreased
                        ? 'bg-btn-red-color/40'
                        : 'bg-btn-blue-color/40'
                      : account.profitRate > 0
                        ? 'bg-btn-red-color/10'
                        : account.profitRate < 0
                          ? 'bg-btn-blue-color/10'
                          : ''
                  }`}
                >
                  {`${plusMinusSign(roundToTwoDecimalPlaces(account.profitRate))}${roundToTwoDecimalPlaces(account.profitRate)}%`}
                </TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.profit)} transition-all duration-300 ${
                    highlightMap[`profit_${account.companyId}`]?.isFlashing
                      ? highlightMap[`profit_${account.companyId}`]?.isIncreased
                        ? 'bg-btn-red-color/40'
                        : 'bg-btn-blue-color/40'
                      : account.profit > 0
                        ? 'bg-btn-red-color/10'
                        : account.profit < 0
                          ? 'bg-btn-blue-color/10'
                          : ''
                  }`}
                >
                  {`${plusMinusSign(account.profit)}${addCommasToThousand(account.profit)}`}
                </TableCell>
                <TableCell>{addCommasToThousand(account.avgPrice)}</TableCell>
                <TableCell>{addCommasToThousand(account.currentPrice)}</TableCell>
                <TableCell>{account.stockCnt}</TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.evaluation)} transition-all duration-300 ${
                    highlightMap[`evaluation_${account.companyId}`]?.isFlashing
                      ? highlightMap[`evaluation_${account.companyId}`]?.isIncreased
                        ? 'bg-btn-red-color/40'
                        : 'bg-btn-blue-color/40'
                      : account.evaluation > 0
                        ? 'bg-btn-red-color/10'
                        : account.evaluation < 0
                          ? 'bg-btn-blue-color/10'
                          : ''
                  }`}
                >
                  {`${addCommasToThousand(account.evaluation)}`}
                </TableCell>
                <TableCell>{addCommasToThousand(account.investment)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                보유 종목이 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );

  // 주문 대기 목록 탭 콘텐츠
  const ordersTabContent = (
    <>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-3">
          <div className="flex flex-row gap-2 rounded-lg border border-border-color bg-modal-background-color p-3">
            <p>주문 대기 목록:</p>
            <span>{userSimulatedData ? userSimulatedData.length : '0'}개</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-border-color">총 구매 대기액</span>
            <span className="text-right font-bold text-btn-red-color">
              {formatKoreanMoney(buyTotalPrice)}원
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-border-color">총 판매 대기액</span>
            <span className="text-right font-bold text-btn-blue-color">
              {formatKoreanMoney(sellTotalPrice)}원
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-modal-background-color">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>종목명</TableHead>
              <TableHead>거래 유형</TableHead>
              <TableHead>주문 수량</TableHead>
              <TableHead>주문 가격(원)</TableHead>
              <TableHead>총 금액(원)</TableHead>
              <TableHead>주문 시간</TableHead>
              <TableHead>주문 취소</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userSimulatedData && userSimulatedData.length > 0 ? (
              userSimulatedData.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => navigate(`/investment/simulate/${order.companyId}`)}
                            className="flex flex-row items-center gap-2"
                          >
                            <img
                              src={order.companyImage}
                              alt="companyIcon"
                              className="h-10 w-10 rounded-full"
                            />
                            <span className="underline">{order.companyName}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>종목 상세 페이지로 이동</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.tradeType === 0 ? 'increase' : 'decrease'}>
                      {getTradeTypeText(order.tradeType)}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.quantity}주</TableCell>
                  <TableCell>{addCommasToThousand(order.price)}</TableCell>
                  <TableCell>{addCommasToThousand(order.price * order.quantity)}</TableCell>
                  <TableCell>{formatTradeTime(order.tradingTime)}</TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="red" size="sm">
                          취소
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-none bg-modal-background-color">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold text-btn-red-color">
                            주문을 취소하시겠습니까?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-text-main-color">
                            {order.companyName}의 {getTradeTypeText(order.tradeType)} 주문(
                            {order.quantity}주, {addCommasToThousand(order.price)}원)을 취소합니다.
                            <div className="my-2" />
                            취소 후에는 복구할 수 없습니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-5">
                          <AlertDialogCancel className="border-none bg-btn-primary-active-color hover:bg-btn-primary-inactive-color hover:text-text-inactive-3-color">
                            취소
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="border-none bg-btn-red-color hover:bg-btn-red-color/20 hover:text-btn-red-color"
                            onClick={() => handleDeleteOrder(order.orderId)}
                          >
                            주문 취소
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-lg">대기 중인 주문이 없습니다.</p>
                    <p className="text-sm">주문을 하면 이곳에 표시됩니다.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );

  return (
    <div className="flex w-full flex-col gap-4 px-6">
      <div className="flex flex-row gap-3">
        <div className="flex flex-col items-start">
          <p className="text-lg text-border-color">총 자산</p>
          <div className="flex flex-row items-end gap-1">
            <p className="text-4xl font-bold">
              {displayData?.totalAsset ? addCommasToThousand(displayData.totalAsset) : '0'}
            </p>
            <p className="text-2xl text-border-color">원</p>
          </div>
        </div>
        <div className="flex flex-row items-start rounded-lg bg-modal-background-color p-3">
          <div className="flex flex-col items-start">
            <p className="text-sm text-border-color">
              내 <TermTooltip term="평가금">평가금</TermTooltip>
            </p>
            <div className="flex flex-row items-end gap-1">
              <p
                className={`text-3xl font-bold ${
                  displayData?.totalProfit && displayData.totalProfit > 0
                    ? 'text-btn-red-color'
                    : displayData?.totalProfit && displayData.totalProfit < 0
                      ? 'text-btn-blue-color'
                      : 'text-text-main-color'
                }`}
              >
                {displayData?.totalEvaluation
                  ? addCommasToThousand(displayData.totalEvaluation)
                  : '0'}
              </p>
              <p className="text-2xl text-border-color">원</p>
            </div>
          </div>
          <div className="mx-4 h-full w-[1px] bg-btn-primary-inactive-color" />
          <div className="flex flex-col items-start">
            <p className="text-sm text-border-color">내 현금</p>
            <div className="flex flex-row items-end gap-1">
              <p className="text-3xl font-bold">
                {displayData?.totalCash ? addCommasToThousand(displayData.totalCash) : '0'}
              </p>
              <p className="text-2xl text-border-color">원</p>
            </div>
          </div>
          <div className="mx-4 h-full w-[1px] bg-btn-primary-inactive-color" />
          <div className="flex flex-col items-start">
            <p className="text-sm text-border-color">
              내 <TermTooltip term="주문가능 금액">주문가능 금액</TermTooltip>
            </p>
            <div className="flex flex-row items-end gap-1">
              <p className="text-3xl font-bold text-btn-green-color">
                {displayData?.orderableAmount
                  ? addCommasToThousand(displayData.orderableAmount)
                  : '0'}
              </p>
              <p className="text-2xl text-border-color">원</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">
          <Badge
            variant={
              highlightMap['totalProfitRate']?.isFlashing
                ? (displayData?.totalProfitRate ?? 0) > 0
                  ? 'increase-flash'
                  : 'decrease-flash'
                : (displayData?.totalProfitRate ?? 0) === 0
                  ? 'zero'
                  : (displayData?.totalProfitRate ?? 0) > 0
                    ? 'increase'
                    : 'decrease'
            }
            className="transition-all duration-300"
          >
            <span className="mr-1 text-sm text-border-color">총 수익률:</span>
            <span className={addStockValueColorClass(displayData?.totalProfitRate ?? 0)}>
              {displayData?.totalProfitRate
                ? `${plusMinusSign(displayData.totalProfitRate)}${roundToTwoDecimalPlaces(
                    displayData.totalProfitRate,
                  )}`
                : '0'}
            </span>
            <p className="text-border-color">%</p>
          </Badge>
          <Badge
            variant={
              highlightMap['totalProfit']?.isFlashing
                ? (displayData?.totalProfit ?? 0) > 0
                  ? 'increase-flash'
                  : 'decrease-flash'
                : (displayData?.totalProfit ?? 0) === 0
                  ? 'zero'
                  : (displayData?.totalProfit ?? 0) > 0
                    ? 'increase'
                    : 'decrease'
            }
            className="transition-all duration-300"
          >
            <span className="mr-1 text-sm text-border-color">총 수익:</span>
            <span className={addStockValueColorClass(displayData?.totalProfit ?? 0)}>
              {displayData?.totalProfit
                ? `${plusMinusSign(displayData.totalProfit)}${addCommasToThousand(
                    displayData.totalProfit,
                  )}`
                : '0'}
            </span>
            <p className="text-border-color">원</p>
          </Badge>
        </div>
        <div className="flex flex-row gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="red">자산 초기화 하기</Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-none bg-modal-background-color">
              <AlertDialogHeader>
                <AlertDialogTitle className="mb-10 text-center text-2xl font-bold text-btn-red-color">
                  자산이 초기화됩니다.
                </AlertDialogTitle>
                <AlertDialogDescription className="text-text-main-color">
                  현재 모든 거래 데이터가 초기화됩니다.
                  <div className="my-2" />
                  초기화된 데이터는 더 이상 복구가 불가하니 유의 부탁드립니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-5">
                <AlertDialogCancel className="border-none bg-btn-primary-active-color hover:bg-btn-primary-inactive-color hover:text-text-inactive-3-color">
                  취소하기
                </AlertDialogCancel>
                <AlertDialogAction
                  className="border-none bg-btn-red-color hover:bg-btn-red-color/20 hover:text-btn-red-color"
                  onClick={() => resetAccount()}
                >
                  초기화하기
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <hr className="mt-5 w-full border-btn-primary-inactive-color" />

      {/* 커스텀 탭 직접 구현 */}
      <div className="mb-4 rounded-2xl bg-modal-background-color">
        <div className="flex w-fit gap-2 rounded-xl p-2">
          <button
            onClick={() => setActiveTab('holdings')}
            className={`rounded-lg px-4 py-2 transition-all duration-300 ${
              activeTab === 'holdings'
                ? 'bg-btn-blue-color font-medium text-white'
                : 'text-border-color hover:bg-btn-blue-color/20'
            }`}
          >
            보유 종목
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`rounded-lg px-4 py-2 transition-all duration-300 ${
              activeTab === 'orders'
                ? 'bg-btn-blue-color font-medium text-white'
                : 'text-border-color hover:bg-btn-blue-color/20'
            }`}
          >
            주문 대기 목록
          </button>
        </div>
      </div>

      {/* 탭 내용 */}
      <div className="mt-3 rounded-xl bg-modal-background-color p-[20px]">
        {activeTab === 'holdings' ? holdingsTabContent : ordersTabContent}
      </div>
    </div>
  );
};
