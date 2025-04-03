import { useEffect, useState } from 'react';

import { useGetAccountSummary, useResetAccount } from '@/api/member.api';
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
import { TermTooltip } from '@/components/ui/TermTooltip';
import { useAccountConnection } from '@/services/SocketAccountService';
import { useAuthStore } from '@/store/useAuthStore';
import {
  addCommasToThousand,
  addStockValueColorClass,
  plusMinusSign,
  roundToTwoDecimalPlaces,
} from '@/utils/numberFormatter';

export const InvestmentResultPage = () => {
  const { userData } = useAuthStore();
  const {
    data: accountSummary,
    isLoading,
    isError,
  } = useGetAccountSummary(userData.memberId?.toString() ?? '');
  const { IsConnected, connectAccount, disconnectAccount } = useAccountConnection();
  const [accountData, setAccountData] = useState<AccountSummaryResponse | null>(null);
  const [realTimeData, setRealTimeData] = useState<AccountSummaryResponse | null>(null);
  const [prevData, setPrevData] = useState<AccountSummaryResponse | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  const { mutate: resetAccount } = useResetAccount(userData.memberId?.toString() ?? '');

  useEffect(() => {
    if (accountSummary) {
      // 초기값 설정
      setRealTimeData(accountSummary);
      setPrevData(accountSummary);

      // 웹소켓 연결
      connectAccount(userData.memberId?.toString() ?? '', setAccountData);
      return () => {
        disconnectAccount();
      };
    }
  }, [accountSummary, connectAccount, disconnectAccount, userData.memberId]);

  useEffect(() => {
    if (accountData) {
      // 웹소켓으로 받은 데이터로 상태 업데이트
      setPrevData(realTimeData || accountSummary || null);
      setRealTimeData(accountData);

      // 깜빡임 효과 적용
      setIsFlashing(true);
      setTimeout(() => {
        setIsFlashing(false);
      }, 300);
    }
  }, [accountData, accountSummary, realTimeData]);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return <ErrorScreen />;
  }

  const displayData = realTimeData || accountSummary;
  if (!displayData) return <LoadingAnimation />;

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
                    : displayData?.totalProfit && displayData.totalProfit === 0
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
              <p className="text-3xl font-bold text-btn-green-color">
                {displayData?.totalCash ? addCommasToThousand(displayData.totalCash) : '0'}
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
              isFlashing && displayData?.totalProfitRate !== prevData?.totalProfitRate
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
              isFlashing && displayData?.totalProfit !== prevData?.totalProfit
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
      <div className="flex flex-row gap-3">
        <div className="flex flex-row gap-2 rounded-lg border border-border-color bg-modal-background-color p-3">
          <p>전체 개수:</p>
          <span>{displayData?.accountCount ? displayData?.accountCount : '0'}개</span>
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
                  <div className="flex flex-row items-center gap-2">
                    <img
                      src={account.companyImage}
                      alt="companyIcon"
                      className="h-10 w-10 rounded-full"
                    />
                    {account.companyName}
                  </div>
                </TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.profitRate)} transition-all duration-300 ${
                    isFlashing &&
                    prevData?.accounts &&
                    account.profitRate !==
                      prevData?.accounts.find((a) => a.companyId === account.companyId)?.profitRate
                      ? account.profitRate > 0
                        ? 'bg-btn-red-color/50'
                        : account.profitRate < 0
                          ? 'bg-btn-blue-color/50'
                          : ''
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
                    isFlashing &&
                    prevData?.accounts &&
                    account.profit !==
                      prevData?.accounts.find((a) => a.companyId === account.companyId)?.profit
                      ? account.profit > 0
                        ? 'bg-btn-red-color/50'
                        : account.profit < 0
                          ? 'bg-btn-blue-color/50'
                          : ''
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
                <TableCell
                  className={`transition-all duration-300 ${
                    isFlashing &&
                    prevData?.accounts &&
                    account.currentPrice !==
                      prevData?.accounts.find((a) => a.companyId === account.companyId)
                        ?.currentPrice
                      ? account.currentPrice >
                        (prevData?.accounts.find((a) => a.companyId === account.companyId)
                          ?.currentPrice || 0)
                        ? 'bg-btn-red-color/50'
                        : 'bg-btn-blue-color/50'
                      : ''
                  }`}
                >
                  {addCommasToThousand(account.currentPrice)}
                </TableCell>
                <TableCell>{account.stockCnt}</TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.evaluation)} transition-all duration-300 ${
                    isFlashing &&
                    prevData?.accounts &&
                    account.evaluation !==
                      prevData?.accounts.find((a) => a.companyId === account.companyId)?.evaluation
                      ? account.evaluation > 0
                        ? 'bg-btn-red-color/50'
                        : account.evaluation < 0
                          ? 'bg-btn-blue-color/50'
                          : ''
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
    </div>
  );
};
