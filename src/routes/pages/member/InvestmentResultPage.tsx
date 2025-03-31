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
import { useAccountConnection } from '@/services/SocketAccountService';
import {
  addCommasToThousand,
  addStockValueColorClass,
  plusMinusSign,
  roundToTwoDecimalPlaces,
} from '@/utils/numberFormatter';

export const InvestmentResultPage = () => {
  const { data: accountSummary, isLoading, isError } = useGetAccountSummary('1');
  const { IsConnected, connectAccount, disconnectAccount } = useAccountConnection();
  const [accountData, setAccountData] = useState<AccountSummaryResponse | null>(null);
  const [realTimeData, setRealTimeData] = useState(accountSummary);
  const [prevData, setPrevData] = useState(accountSummary);
  const [isFlashing, setIsFlashing] = useState(false);

  const { mutate: resetAccount } = useResetAccount('1');

  useEffect(() => {
    if (accountSummary) {
      connectAccount('1', setAccountData);
      return () => {
        disconnectAccount();
      };
    }
  }, [accountSummary, connectAccount, disconnectAccount]);

  useEffect(() => {
    if (accountData && accountSummary) {
      // 웹소켓으로 받은 데이터로 accountSummary 업데이트
      const updatedAccounts = accountSummary.accounts.map((account) => {
        // accountData가 배열이 아닐 경우를 처리
        const realTimeAccount = accountData.accounts.find(
          (rt) => rt.companyId === account.companyId,
        );

        if (realTimeAccount) {
          return {
            ...account,
            currentPrice: realTimeAccount.currentPrice,
            evaluation: realTimeAccount.evaluation,
            profit: realTimeAccount.profit,
            profitRate: realTimeAccount.profitRate,
            dailyProfit: realTimeAccount.dailyProfit,
            dailyProfitRate: realTimeAccount.dailyProfitRate,
          };
        }
        return account;
      });

      // 총 자산, 평가금액, 현금 업데이트
      const totalEvaluation = accountData.totalEvaluation;
      const totalProfit = accountData.totalProfit;
      const totalDailyProfit = accountData.dailyProfit;

      const newData = {
        ...accountSummary,
        accounts: updatedAccounts,
        totalEvaluation,
        totalProfit,
        dailyProfit: totalDailyProfit,
        totalProfitRate: accountData.totalProfitRate,
        dailyProfitRate: accountData.dailyProfitRate,
        totalAsset: accountData.totalAsset,
      };

      setIsFlashing(true);
      setTimeout(() => {
        setIsFlashing(false);
      }, 300);

      setPrevData(realTimeData || accountSummary);
      setRealTimeData(newData);
    }
  }, [accountData, accountSummary]);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return <ErrorScreen />;
  }

  const displayData = realTimeData || accountSummary;

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
            <p className="text-sm text-border-color">내 평가금</p>
            <div className="flex flex-row items-end gap-1">
              <p className="text-3xl font-bold text-btn-red-color">
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
          <Badge
            variant={
              isFlashing && displayData?.dailyProfitRate !== prevData?.dailyProfitRate
                ? (displayData?.dailyProfitRate ?? 0) > 0
                  ? 'increase-flash'
                  : 'decrease-flash'
                : (displayData?.dailyProfitRate ?? 0) === 0
                  ? 'zero'
                  : (displayData?.dailyProfitRate ?? 0) > 0
                    ? 'increase'
                    : 'decrease'
            }
            className="transition-all duration-300"
          >
            <span className="mr-1 text-sm text-border-color">일간 수익률:</span>
            <span className={addStockValueColorClass(displayData?.dailyProfitRate ?? 0)}>
              {displayData?.dailyProfitRate
                ? `${plusMinusSign(displayData.dailyProfitRate)}${roundToTwoDecimalPlaces(
                    displayData.dailyProfitRate,
                  )}`
                : '0'}
              %
            </span>
          </Badge>
          <Badge
            variant={
              isFlashing && displayData?.dailyProfit !== prevData?.dailyProfit
                ? (displayData?.dailyProfit ?? 0) > 0
                  ? 'increase-flash'
                  : 'decrease-flash'
                : (displayData?.dailyProfit ?? 0) === 0
                  ? 'zero'
                  : (displayData?.dailyProfit ?? 0) > 0
                    ? 'increase'
                    : 'decrease'
            }
            className="transition-all duration-300"
          >
            <span className="mr-1 text-sm text-border-color">일간 수익:</span>
            <span className={addStockValueColorClass(displayData?.dailyProfit ?? 0)}>
              {displayData?.dailyProfit
                ? `${plusMinusSign(displayData.dailyProfit)}${addCommasToThousand(
                    displayData.dailyProfit,
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
            <TableHead>1주 평균 금액(원)</TableHead>
            <TableHead>현재가(원)</TableHead>
            <TableHead>보유수량</TableHead>
            <TableHead>평가금(원)</TableHead>
            <TableHead>원금(원)</TableHead>
            <TableHead>일간 수익률</TableHead>
            <TableHead>일간 수익금(원)</TableHead>
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
                    account.profitRate !==
                      prevData?.accounts.find((a) => a.companyId === account.companyId)?.profitRate
                      ? account.profitRate > 0
                        ? 'bg-btn-red-color/50'
                        : 'bg-btn-blue-color/50'
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
                    account.profit !==
                      prevData?.accounts.find((a) => a.companyId === account.companyId)?.profit
                      ? account.profit > 0
                        ? 'bg-btn-red-color/50'
                        : 'bg-btn-blue-color/50'
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
                    account.currentPrice !==
                      prevData?.accounts.find((a) => a.companyId === account.companyId)
                        ?.currentPrice
                      ? account.currentPrice > 0
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
                    account.evaluation !==
                      prevData?.accounts.find((a) => a.companyId === account.companyId)?.evaluation
                      ? account.evaluation > 0
                        ? 'bg-btn-red-color/50'
                        : 'bg-btn-blue-color/50'
                      : account.evaluation > 0
                        ? 'bg-btn-red-color/10'
                        : account.evaluation < 0
                          ? 'bg-btn-blue-color/10'
                          : ''
                  }`}
                >
                  {`${plusMinusSign(account.evaluation)}${addCommasToThousand(account.evaluation)}`}
                </TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.investment)} transition-all duration-300 ${
                    isFlashing &&
                    account.investment !==
                      prevData?.accounts.find((a) => a.companyId === account.companyId)?.investment
                      ? account.investment > 0
                        ? 'bg-btn-red-color/50'
                        : 'bg-btn-blue-color/50'
                      : account.investment > 0
                        ? 'bg-btn-red-color/10'
                        : account.investment < 0
                          ? 'bg-btn-blue-color/10'
                          : ''
                  }`}
                >
                  {`${plusMinusSign(account.investment)}${addCommasToThousand(account.investment)}`}
                </TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.dailyProfitRate)} transition-all duration-300 ${
                    isFlashing &&
                    account.dailyProfitRate !==
                      prevData?.accounts.find((a) => a.companyId === account.companyId)
                        ?.dailyProfitRate
                      ? account.dailyProfitRate > 0
                        ? 'bg-btn-red-color/50'
                        : 'bg-btn-blue-color/50'
                      : account.dailyProfitRate > 0
                        ? 'bg-btn-red-color/10'
                        : account.dailyProfitRate < 0
                          ? 'bg-btn-blue-color/10'
                          : ''
                  }`}
                >
                  {`${plusMinusSign(account.dailyProfitRate)}${roundToTwoDecimalPlaces(account.dailyProfitRate)}%`}
                </TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.dailyProfit)} transition-all duration-300 ${
                    isFlashing &&
                    account.dailyProfit !==
                      prevData?.accounts.find((a) => a.companyId === account.companyId)?.dailyProfit
                      ? account.dailyProfit > 0
                        ? 'bg-btn-red-color/50'
                        : 'bg-btn-blue-color/50'
                      : account.dailyProfit > 0
                        ? 'bg-btn-red-color/10'
                        : account.dailyProfit < 0
                          ? 'bg-btn-blue-color/10'
                          : ''
                  }`}
                >
                  {`${plusMinusSign(account.dailyProfit)}${addCommasToThousand(account.dailyProfit)}`}
                </TableCell>
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
