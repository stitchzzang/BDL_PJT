import { format } from 'date-fns';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  useGetAccountSummary,
  useGetAutoOrders,
  useGetConfirmedOrders,
  useGetManualOrders,
  useGetPendingOrders,
  useResetAccount,
} from '@/api/member.api';
import { useDeleteUserSimulated } from '@/api/stock.api';
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
import { Skeleton } from '@/components/ui/skeleton';
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
import { useAccountConnection } from '@/services/SocketAccountService';
import { useAuthStore } from '@/store/useAuthStore';
import {
  addCommasToThousand,
  addStockValueColorClass,
  formatKoreanMoney,
  plusMinusSign,
  roundToTwoDecimalPlaces,
} from '@/utils/numberFormatter';

// 검색 컴포넌트 (별도 분리하여 리렌더링 최소화)
const SearchBarComponent = React.memo(
  ({
    onSearch,
    mainTab,
    transactionSubTab,
  }: {
    onSearch: (query: string) => void;
    mainTab: string;
    transactionSubTab: string;
  }) => {
    const [localSearch, setLocalSearch] = useState('');

    const handleLocalSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value.length > 15) {
        toast.info('검색 가능한 종목명은 15자 이하입니다.');
        return;
      }
      setLocalSearch(value);
    };

    const handleLocalSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSearch(localSearch);
    };

    // 탭 변경 시 local input 값 초기화
    useEffect(() => {
      setLocalSearch('');
    }, [mainTab, transactionSubTab]);

    return (
      <form onSubmit={handleLocalSearchSubmit} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="종목명 검색"
          value={localSearch}
          onChange={handleLocalSearchChange}
          className="rounded-md border border-border-color bg-background px-3 py-2 text-sm text-black"
        />
        <Button type="submit" variant="blue" className="border-border-color">
          검색
        </Button>
      </form>
    );
  },
);

SearchBarComponent.displayName = 'SearchBarComponent';

export const InvestmentResultPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuthStore();
  const memberId = userData.memberId?.toString() ?? '';
  const {
    data: accountSummary,
    isLoading: isAccountLoading,
    isError: isAccountError,
    refetch: refetchAccountSummary,
  } = useGetAccountSummary(memberId);

  // 페이지네이션 및 검색을 위한 상태
  const [search, setSearch] = useState('');
  const [pendingPage, setPendingPage] = useState(0);
  const [confirmedPage, setConfirmedPage] = useState(0);
  const [manualPage, setManualPage] = useState(0);
  const [autoPage, setAutoPage] = useState(0);
  const pageSize = 10;

  // 주문 데이터 쿼리
  const {
    data: pendingOrdersData,
    isLoading: isPendingOrdersLoading,
    refetch: refetchPendingOrders,
  } = useGetPendingOrders(memberId, pendingPage, pageSize, search);

  const {
    data: confirmedOrdersData,
    isLoading: isConfirmedOrdersLoading,
    refetch: refetchConfirmedOrders,
  } = useGetConfirmedOrders(memberId, confirmedPage, pageSize, search);

  const {
    data: manualOrdersData,
    isLoading: isManualOrdersLoading,
    refetch: refetchManualOrders,
  } = useGetManualOrders(memberId, manualPage, pageSize, search);

  const {
    data: autoOrdersData,
    isLoading: isAutoOrdersLoading,
    refetch: refetchAutoOrders,
  } = useGetAutoOrders(memberId, autoPage, pageSize, search);

  // UI 관련 상태
  const [mainTab, setMainTab] = useState('holdings'); // 'holdings', 'transactions', 'pendingOrders'
  const [transactionSubTab, setTransactionSubTab] = useState('all'); // 'all', 'manual', 'auto'

  const { IsConnected, connectAccount, disconnectAccount } = useAccountConnection();

  // 이전 데이터를 ref로 관리하여 렌더링 트리거 없이 값 보존
  const prevDataRef = useRef<AccountSummaryResponse | null>(null);
  const [accountData, setAccountData] = useState<AccountSummaryResponse | null>(null);
  const [realTimeData, setRealTimeData] = useState<AccountSummaryResponse | null>(null);

  // 하이라이트 타이머를 저장할 ref
  const highlightTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  // 계정 및 항목별 하이라이트 상태를 관리하는 맵
  const [highlightMap, setHighlightMap] = useState<{
    [key: string]: {
      isFlashing: boolean;
      isIncreased?: boolean;
    };
  }>({});

  const { mutate: resetAccount } = useResetAccount(memberId);

  // 주문 취소 뮤테이션
  const deleteSimulatedMutation = useDeleteUserSimulated();

  // 주문 취소 처리
  const handleDeleteOrder = (orderId: number) => {
    deleteSimulatedMutation.mutate(orderId, {
      onSuccess: () => {
        toast.success('주문이 성공적으로 취소되었습니다.');
        refetchPendingOrders();
      },
      onError: (error) => {
        console.error('주문 취소 실패:', error);
        toast.error('주문 취소에 실패했습니다.');
        refetchPendingOrders();
      },
    });
  };

  // 총 매수/매도 주문 금액 계산
  const buyTotalPrice =
    pendingOrdersData?.orders
      ?.filter((item) => item.tradeType === 0)
      .reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  const sellTotalPrice =
    pendingOrdersData?.orders
      ?.filter((item) => item.tradeType === 1)
      .reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  // 주문 유형 변환 함수
  const getTradeTypeText = (tradeType: number) => {
    return tradeType === 0 ? '구매' : '판매';
  };

  // 주문 방식 변환 함수
  const getOrderModeText = (mode: boolean) => {
    return mode ? '자동' : '수동';
  };

  // 주문 상태 변환 함수
  const getOrderStatusText = (status: number) => {
    return status === 0 ? '대기' : '체결';
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

  // 페이지네이션 핸들러
  const handlePendingPageChange = (page: number) => {
    setPendingPage(page);
  };

  const handleConfirmedPageChange = (page: number) => {
    setConfirmedPage(page);
  };

  const handleManualPageChange = (page: number) => {
    setManualPage(page);
  };

  const handleAutoPageChange = (page: number) => {
    setAutoPage(page);
  };

  // 검색 핸들러 (부모 컴포넌트에 정의)
  const handleSearch = useCallback(
    (query: string) => {
      setSearch(query);

      // 현재 활성화된 탭에 따라 적절한 API 호출
      if (mainTab === 'pendingOrders') {
        setPendingPage(0);
        refetchPendingOrders();
      } else if (mainTab === 'transactions') {
        if (transactionSubTab === 'all') {
          setConfirmedPage(0);
          refetchConfirmedOrders();
        } else if (transactionSubTab === 'manual') {
          setManualPage(0);
          refetchManualOrders();
        } else {
          setAutoPage(0);
          refetchAutoOrders();
        }
      }
    },
    [
      mainTab,
      transactionSubTab,
      refetchPendingOrders,
      refetchConfirmedOrders,
      refetchManualOrders,
      refetchAutoOrders,
    ],
  );

  useEffect(() => {
    if (accountSummary) {
      // 초기값 설정
      setRealTimeData(accountSummary);
      prevDataRef.current = accountSummary;

      // 웹소켓 연결
      connectAccount(memberId, setAccountData);
      return () => {
        disconnectAccount();
      };
    }
  }, [accountSummary, connectAccount, disconnectAccount, memberId]);

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

  // 탭 변경 함수 업데이트
  const handleMainTabChange = (tab: string) => {
    setMainTab(tab);
    setSearch('');

    // 탭 변경 시 페이지를 초기화
    if (tab === 'transactions') {
      setConfirmedPage(0);
      setManualPage(0);
      setAutoPage(0);
    } else if (tab === 'pendingOrders') {
      setPendingPage(0);
    }
  };

  // 거래 내역 서브탭 변경 함수 업데이트
  const handleTransactionSubTabChange = (subTab: string) => {
    setTransactionSubTab(subTab);

    // 서브탭 변경 시 페이지 초기화
    if (subTab === 'all') {
      setConfirmedPage(0);
    } else if (subTab === 'manual') {
      setManualPage(0);
    } else {
      setAutoPage(0);
    }
  };

  if (isAccountLoading) {
    return (
      <div className="flex w-full flex-col gap-4 px-6">
        <div className="flex flex-row gap-3">
          <div className="flex flex-col items-start">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="mt-2 h-10 w-48" />
          </div>
          <div className="flex flex-row items-start rounded-lg bg-modal-background-color p-3">
            <div className="flex flex-col items-start">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="mt-2 h-8 w-32" />
            </div>
            <div className="mx-4 h-full w-[1px] bg-btn-primary-inactive-color" />
            <div className="flex flex-col items-start">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="mt-2 h-8 w-32" />
            </div>
            <div className="mx-4 h-full w-[1px] bg-btn-primary-inactive-color" />
            <div className="flex flex-col items-start">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="mt-2 h-8 w-32" />
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex flex-row gap-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-40" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <hr className="mt-5 w-full border-btn-primary-inactive-color" />

        <div className="mb-4 rounded-2xl bg-modal-background-color">
          <div className="flex w-fit gap-2 rounded-xl p-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div id="tab-content" className="mt-3 rounded-xl bg-modal-background-color p-[20px]">
          <div className="flex flex-row justify-between">
            <Skeleton className="h-12 w-40" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Skeleton className="h-6 w-20" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-6 w-20" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-6 w-24" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-6 w-24" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-6 w-20" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-6 w-16" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-6 w-16" />
                </TableHead>
                <TableHead className="text-right">
                  <Skeleton className="ml-auto h-6 w-20" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <div className="h-5"></div>
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-[200px]">
                      <div className="flex flex-row items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-6 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-6 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-6 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-6 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-6 w-12" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-6 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-6 w-20" />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (isAccountError) {
    return <ErrorScreen />;
  }

  const displayData = realTimeData || accountSummary;
  if (!displayData) return <LoadingAnimation />;

  // 페이지네이션 컴포넌트
  const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    const handlePrevPage = () => {
      if (currentPage > 0) {
        onPageChange(currentPage - 1);
        // 페이지 변경 시 tab-content로 스크롤 이동
      }
    };

    const handleNextPage = () => {
      if (currentPage < totalPages - 1) {
        onPageChange(currentPage + 1);
      }
    };

    // 페이지 번호 변경 시 스크롤 이동 함수 추가
    const handlePageNumberClick = (page: number) => {
      onPageChange(page);
    };

    // 페이지 번호 계산 (최대 5개 표시)
    const getPageNumbers = () => {
      const pageNumbers = [];
      const maxPagesToShow = 5;

      let startPage = Math.max(0, currentPage - Math.floor(maxPagesToShow / 2));
      const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      return pageNumbers;
    };

    return (
      <div className="flex items-center justify-center space-x-2 py-4">
        <Button
          variant="blue"
          size="icon"
          onClick={() => handlePageNumberClick(0)}
          disabled={currentPage === 0}
          className="h-8 w-8 border-border-color"
          title="첫 페이지"
        >
          &lt;&lt;
        </Button>
        <Button
          variant="blue"
          size="icon"
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="h-8 w-8 border-border-color"
        >
          &lt;
        </Button>

        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={page === currentPage ? 'blue' : 'gray'}
            size="icon"
            onClick={() => handlePageNumberClick(page)}
            className={'h-8 w-8'}
          >
            {page + 1}
          </Button>
        ))}

        <Button
          variant="blue"
          size="icon"
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1 || totalPages === 0}
          className="h-8 w-8 border-border-color"
        >
          &gt;
        </Button>
        <Button
          variant="blue"
          size="icon"
          onClick={() => handlePageNumberClick(totalPages - 1)}
          disabled={currentPage === totalPages - 1 || totalPages === 0}
          className="h-8 w-8 border-border-color"
          title="마지막 페이지"
        >
          &gt;&gt;
        </Button>
      </div>
    );
  };

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
            <TableHead className="w-[200px]">종목명</TableHead>
            <TableHead className="text-right">총 수익률</TableHead>
            <TableHead className="text-right">총 수익금(원)</TableHead>
            <TableHead className="text-right">
              <TermTooltip term="1주 평균 금액">1주 평균 금액</TermTooltip>
              <span className="text-sm text-border-color">(원)</span>
            </TableHead>
            <TableHead className="text-right">현재가(원)</TableHead>
            <TableHead className="text-right">
              <TermTooltip term="보유수량">보유수량</TermTooltip>
            </TableHead>
            <TableHead className="text-right">
              <TermTooltip term="평가금">평가금</TermTooltip>
              <span className="text-sm text-border-color">(원)</span>
            </TableHead>
            <TableHead className="text-right">
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
                <TableCell className="w-[200px]">
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
                  className={`${addStockValueColorClass(account.profitRate)} text-right transition-all duration-300 ${
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
                  className={`${addStockValueColorClass(account.profit)} text-right transition-all duration-300 ${
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
                <TableCell className="text-right">
                  {addCommasToThousand(account.avgPrice)}
                </TableCell>
                <TableCell className="text-right">
                  {addCommasToThousand(account.currentPrice)}
                </TableCell>
                <TableCell className="text-right">{account.stockCnt}</TableCell>
                <TableCell
                  className={`text-right ${addStockValueColorClass(account.evaluation)} transition-all duration-300 ${
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
                <TableCell className="text-right">
                  {addCommasToThousand(account.investment)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="py-10 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-lg">보유 종목이 없습니다.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );

  // 주문 대기 목록 탭 콘텐츠
  const pendingOrdersTabContent = (
    <>
      <div className="mb-4 flex flex-row items-center justify-between">
        <div className="flex flex-row gap-3">
          <div className="flex flex-row gap-2 rounded-lg border border-border-color bg-modal-background-color p-3">
            <p>주문 대기 목록:</p>
            <span>
              {pendingOrdersData?.totalElements ? pendingOrdersData.totalElements : '0'}개
            </span>
          </div>
        </div>
        <div className="flex">
          <SearchBarComponent
            onSearch={handleSearch}
            mainTab={mainTab}
            transactionSubTab={transactionSubTab}
          />
        </div>
      </div>

      <div className="mb-4 flex justify-end">
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
              <TableHead className="w-[200px]">종목명</TableHead>
              <TableHead className="text-center">거래 유형</TableHead>
              <TableHead className="text-right">주문 수량</TableHead>
              <TableHead className="text-right">주문 가격(원)</TableHead>
              <TableHead className="text-right">총 금액(원)</TableHead>
              <TableHead>주문 시간</TableHead>
              <TableHead>주문 취소</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPendingOrdersLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-[200px]">
                      <div className="flex flex-row items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Skeleton className="mx-auto h-6 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-6 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-6 w-20" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-6 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))
            ) : pendingOrdersData?.orders && pendingOrdersData.orders.length > 0 ? (
              pendingOrdersData.orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="w-[200px]">
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
                  <TableCell className="text-center">
                    <Badge variant={order.tradeType === 0 ? 'increase' : 'decrease'}>
                      {getTradeTypeText(order.tradeType)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{order.quantity}주</TableCell>
                  <TableCell className="text-right">{addCommasToThousand(order.price)}</TableCell>
                  <TableCell className="text-right">
                    {addCommasToThousand(order.price * order.quantity)}
                  </TableCell>
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
                <TableCell colSpan={7} className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-lg">대기 중인 주문이 없습니다.</p>
                    <p className="text-sm">주문을 하면 이곳에 표시됩니다.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {pendingOrdersData && pendingOrdersData.totalPages > 0 && (
          <Pagination
            currentPage={pendingPage}
            totalPages={pendingOrdersData.totalPages}
            onPageChange={handlePendingPageChange}
          />
        )}
      </div>
    </>
  );

  // 거래 내역 테이블 렌더링 함수
  const renderTransactionTable = (data: any, isLoading: boolean) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">종목명</TableHead>
            <TableHead className="text-center">거래 유형</TableHead>
            <TableHead className="text-center">주문 방식</TableHead>
            <TableHead className="text-right">주문 수량</TableHead>
            <TableHead className="text-right">주문 가격(원)</TableHead>
            <TableHead className="text-right">총 금액(원)</TableHead>
            <TableHead>주문 시간</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array(5)
              .fill(0)
              .map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="w-[200px]">
                    <div className="flex flex-row items-center gap-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="mx-auto h-6 w-16" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="mx-auto h-6 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-6 w-16" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-6 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-6 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-40" />
                  </TableCell>
                </TableRow>
              ))
          ) : data?.orders && data.orders.length > 0 ? (
            data.orders.map((order: any) => (
              <TableRow key={order.orderId}>
                <TableCell className="w-[200px]">
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
                <TableCell className="text-center">
                  <Badge variant={order.tradeType === 0 ? 'red' : 'blue'}>
                    {getTradeTypeText(order.tradeType)}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={order.auto ? 'auto' : 'manual'}>
                    {getOrderModeText(order.auto)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{order.quantity}주</TableCell>
                <TableCell className="text-right">{addCommasToThousand(order.price)}</TableCell>
                <TableCell className="text-right">
                  {addCommasToThousand(order.price * order.quantity)}
                </TableCell>
                <TableCell>{formatTradeTime(order.tradingTime)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="text-lg">거래 내역이 없습니다.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };

  // 거래 내역 탭 콘텐츠
  const transactionsTabContent = (
    <>
      <div className="mb-4 flex flex-row items-center justify-between">
        <div className="flex flex-row gap-3">
          <div className="flex flex-row gap-2 rounded-lg border border-border-color bg-modal-background-color p-3">
            <p>거래 내역:</p>
            <span>
              {transactionSubTab === 'all'
                ? confirmedOrdersData?.totalElements || '0'
                : transactionSubTab === 'manual'
                  ? manualOrdersData?.totalElements || '0'
                  : autoOrdersData?.totalElements || '0'}
              개
            </span>
          </div>
        </div>
        <div className="flex">
          <SearchBarComponent
            onSearch={handleSearch}
            mainTab={mainTab}
            transactionSubTab={transactionSubTab}
          />
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          variant="blue"
          className={transactionSubTab === 'all' ? '' : 'bg-btn-blue-color/20 text-btn-blue-color'}
          onClick={() => handleTransactionSubTabChange('all')}
        >
          전체
        </Button>
        <Button
          variant="blue"
          className={
            transactionSubTab === 'manual' ? '' : 'bg-btn-blue-color/20 text-btn-blue-color'
          }
          onClick={() => handleTransactionSubTabChange('manual')}
        >
          수동
        </Button>
        <Button
          variant="blue"
          className={transactionSubTab === 'auto' ? '' : 'bg-btn-blue-color/20 text-btn-blue-color'}
          onClick={() => handleTransactionSubTabChange('auto')}
        >
          자동
        </Button>
      </div>

      <div className="rounded-lg bg-modal-background-color">
        {transactionSubTab === 'all' && (
          <>
            {renderTransactionTable(confirmedOrdersData, isConfirmedOrdersLoading)}
            {confirmedOrdersData && confirmedOrdersData.totalPages > 0 && (
              <Pagination
                currentPage={confirmedPage}
                totalPages={confirmedOrdersData.totalPages}
                onPageChange={handleConfirmedPageChange}
              />
            )}
          </>
        )}

        {transactionSubTab === 'manual' && (
          <>
            {renderTransactionTable(manualOrdersData, isManualOrdersLoading)}
            {manualOrdersData && manualOrdersData.totalPages > 0 && (
              <Pagination
                currentPage={manualPage}
                totalPages={manualOrdersData.totalPages}
                onPageChange={handleManualPageChange}
              />
            )}
          </>
        )}

        {transactionSubTab === 'auto' && (
          <>
            {renderTransactionTable(autoOrdersData, isAutoOrdersLoading)}
            {autoOrdersData && autoOrdersData.totalPages > 0 && (
              <Pagination
                currentPage={autoPage}
                totalPages={autoOrdersData.totalPages}
                onPageChange={handleAutoPageChange}
              />
            )}
          </>
        )}
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

      {/* 메인 탭 네비게이션 */}
      <div className="mb-4 rounded-2xl bg-modal-background-color">
        <div className="flex w-fit gap-2 rounded-xl p-2">
          <button
            onClick={() => handleMainTabChange('holdings')}
            className={`rounded-lg px-4 py-2 transition-all duration-300 ${
              mainTab === 'holdings'
                ? 'bg-btn-blue-color font-medium text-white'
                : 'text-border-color hover:bg-btn-blue-color/20'
            }`}
          >
            보유 종목
          </button>
          <button
            onClick={() => handleMainTabChange('transactions')}
            className={`rounded-lg px-4 py-2 transition-all duration-300 ${
              mainTab === 'transactions'
                ? 'bg-btn-blue-color font-medium text-white'
                : 'text-border-color hover:bg-btn-blue-color/20'
            }`}
          >
            거래 내역
          </button>
          <button
            onClick={() => handleMainTabChange('pendingOrders')}
            className={`rounded-lg px-4 py-2 transition-all duration-300 ${
              mainTab === 'pendingOrders'
                ? 'bg-btn-blue-color font-medium text-white'
                : 'text-border-color hover:bg-btn-blue-color/20'
            }`}
          >
            주문 대기 목록
          </button>
        </div>
      </div>

      {/* 탭 내용 */}
      <div id="tab-content" className="mt-3 rounded-xl bg-modal-background-color p-[20px]">
        {mainTab === 'holdings' && holdingsTabContent}
        {mainTab === 'transactions' && transactionsTabContent}
        {mainTab === 'pendingOrders' && pendingOrdersTabContent}
      </div>
    </div>
  );
};
