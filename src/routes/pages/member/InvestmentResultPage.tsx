import { useEffect, useState } from 'react';

import { useGetAccountSummary, useResetAccount } from '@/api/member.api';
import { AccountResponse } from '@/api/types/member';
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
  const [accountData, setAccountData] = useState<AccountResponse[]>([]);
  const [realTimeData, setRealTimeData] = useState(accountSummary);
  const [prevData, setPrevData] = useState(accountSummary);

  const { mutate: resetAccount } = useResetAccount('1');

  useEffect(() => {
    if (accountData) {
      connectAccount('1', setAccountData);
      return () => {
        disconnectAccount();
      };
    }
  }, [accountData, connectAccount, disconnectAccount]);

  useEffect(() => {
    if (accountData && accountSummary) {
      // 웹소켓으로 받은 데이터로 accountSummary 업데이트
      const updatedAccounts = accountSummary.accounts.map((account) => {
        const realTimeAccount = accountData.find((rt) => rt.companyId === account.companyId);
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
      const totalEvaluation = updatedAccounts.reduce((sum, account) => sum + account.evaluation, 0);
      const totalProfit = updatedAccounts.reduce((sum, account) => sum + account.profit, 0);
      const totalDailyProfit = updatedAccounts.reduce(
        (sum, account) => sum + account.dailyProfit,
        0,
      );

      const newData = {
        ...accountSummary,
        accounts: updatedAccounts,
        totalEvaluation,
        totalProfit,
        dailyProfit: totalDailyProfit,
        totalAsset: accountSummary.totalCash + totalEvaluation,
      };

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
          <p
            className={`text-4xl font-bold transition-colors duration-300 ${
              displayData?.totalAsset !== prevData?.totalAsset
                ? (displayData?.totalAsset ?? 0) > (prevData?.totalAsset ?? 0)
                  ? 'bg-btn-red-color/20'
                  : 'bg-btn-blue-color/20'
                : ''
            }`}
          >
            {displayData?.totalAsset ? addCommasToThousand(displayData.totalAsset) : '0'}
          </p>
        </div>
        <div className="flex flex-row items-start rounded-lg bg-modal-background-color p-3">
          <div className="flex flex-col items-start">
            <p className="text-sm text-border-color">내 평가금</p>
            <p
              className={`text-3xl font-bold text-btn-red-color transition-colors duration-300 ${
                displayData?.totalEvaluation !== prevData?.totalEvaluation
                  ? (displayData?.totalEvaluation ?? 0) > (prevData?.totalEvaluation ?? 0)
                    ? 'bg-btn-red-color/20'
                    : 'bg-btn-blue-color/20'
                  : ''
              }`}
            >
              {displayData?.totalEvaluation
                ? addCommasToThousand(displayData.totalEvaluation)
                : '0'}
            </p>
          </div>
          <div className="mx-4 h-full w-[1px] bg-btn-primary-inactive-color" />
          <div className="flex flex-col items-start">
            <p className="text-sm text-border-color">내 현금</p>
            <p
              className={`text-3xl font-bold text-btn-green-color transition-colors duration-300 ${
                displayData?.totalCash !== prevData?.totalCash
                  ? (displayData?.totalCash ?? 0) > (prevData?.totalCash ?? 0)
                    ? 'bg-btn-red-color/20'
                    : 'bg-btn-blue-color/20'
                  : ''
              }`}
            >
              {displayData?.totalCash ? addCommasToThousand(displayData.totalCash) : '0'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">
          <Badge variant={displayData?.totalProfitRate === 0 ? 'zero' : 'increase'}>
            <span className="mr-1 text-sm text-border-color">총 수익률:</span>
            <span
              className={`${addStockValueColorClass(displayData?.totalProfitRate ?? 0)} transition-colors duration-300 ${
                displayData?.totalProfitRate !== prevData?.totalProfitRate
                  ? (displayData?.totalProfitRate ?? 0) > (prevData?.totalProfitRate ?? 0)
                    ? 'bg-btn-red-color/20'
                    : 'bg-btn-blue-color/20'
                  : ''
              }`}
            >
              {displayData?.totalProfitRate
                ? `${plusMinusSign(displayData.totalProfitRate)} ${roundToTwoDecimalPlaces(
                    displayData.totalProfitRate,
                  )}`
                : '0'}
              %
            </span>
          </Badge>
          <Badge variant={displayData?.totalProfitRate === 0 ? 'zero' : 'main'}>
            <span className="mr-1 text-sm text-border-color">총 수익:</span>
            <span
              className={`${addStockValueColorClass(displayData?.totalProfit ?? 0)} transition-colors duration-300 ${
                displayData?.totalProfit !== prevData?.totalProfit
                  ? (displayData?.totalProfit ?? 0) > (prevData?.totalProfit ?? 0)
                    ? 'bg-btn-red-color/20'
                    : 'bg-btn-blue-color/20'
                  : ''
              }`}
            >
              {displayData?.totalProfit
                ? `${plusMinusSign(displayData.totalProfit)} ${addCommasToThousand(
                    displayData.totalProfit,
                  )}`
                : '0'}
            </span>
          </Badge>
          <Badge variant={displayData?.dailyProfitRate === 0 ? 'zero' : 'decrease'}>
            <span className="mr-1 text-sm text-border-color">일간 수익률:</span>
            <span
              className={`${addStockValueColorClass(displayData?.dailyProfitRate ?? 0)} transition-colors duration-300 ${
                displayData?.dailyProfitRate !== prevData?.dailyProfitRate
                  ? (displayData?.dailyProfitRate ?? 0) > (prevData?.dailyProfitRate ?? 0)
                    ? 'bg-btn-red-color/20'
                    : 'bg-btn-blue-color/20'
                  : ''
              }`}
            >
              {displayData?.dailyProfitRate
                ? `${plusMinusSign(displayData.dailyProfitRate)} ${roundToTwoDecimalPlaces(
                    displayData.dailyProfitRate,
                  )}`
                : '0'}
              %
            </span>
          </Badge>
          <Badge variant={displayData?.dailyProfitRate === 0 ? 'zero' : 'main'}>
            <span className="mr-1 text-sm text-border-color">일간 수익:</span>
            <span
              className={`${addStockValueColorClass(displayData?.dailyProfit ?? 0)} transition-colors duration-300 ${
                displayData?.dailyProfit !== prevData?.dailyProfit
                  ? (displayData?.dailyProfit ?? 0) > (prevData?.dailyProfit ?? 0)
                    ? 'bg-btn-red-color/20'
                    : 'bg-btn-blue-color/20'
                  : ''
              }`}
            >
              {displayData?.dailyProfit
                ? `${plusMinusSign(displayData.dailyProfit)} ${addCommasToThousand(
                    displayData.dailyProfit,
                  )}`
                : '0'}
            </span>
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
            <TableHead>총 수익금</TableHead>
            <TableHead>1주 평균 금액</TableHead>
            <TableHead>현재가</TableHead>
            <TableHead>보유수량</TableHead>
            <TableHead>평가금</TableHead>
            <TableHead>원금</TableHead>
            <TableHead>일간 수익률</TableHead>
            <TableHead>일간 수익금</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <div className="h-5"></div>
          {displayData?.accounts.length && displayData?.accounts.length > 0 ? (
            displayData?.accounts.map((account) => (
              <TableRow key={account.companyId}>
                <TableCell>{account.companyName}</TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.profitRate)} transition-colors duration-300 ${
                    account.profitRate !==
                    prevData?.accounts.find((a) => a.companyId === account.companyId)?.profitRate
                      ? account.profitRate >
                        (prevData?.accounts.find((a) => a.companyId === account.companyId)
                          ?.profitRate || 0)
                        ? 'bg-btn-red-color/20'
                        : 'bg-btn-blue-color/20'
                      : ''
                  }`}
                >
                  {roundToTwoDecimalPlaces(account.profitRate)}%
                </TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.profit)} transition-colors duration-300 ${
                    account.profit !==
                    prevData?.accounts.find((a) => a.companyId === account.companyId)?.profit
                      ? account.profit >
                        (prevData?.accounts.find((a) => a.companyId === account.companyId)
                          ?.profit || 0)
                        ? 'bg-btn-red-color/20'
                        : 'bg-btn-blue-color/20'
                      : ''
                  }`}
                >
                  {`${plusMinusSign(account.profit)} ${addCommasToThousand(account.profit)}`}
                </TableCell>
                <TableCell>{addCommasToThousand(account.avgPrice)}</TableCell>
                <TableCell
                  className={`transition-colors duration-300 ${
                    account.currentPrice !==
                    prevData?.accounts.find((a) => a.companyId === account.companyId)?.currentPrice
                      ? account.currentPrice >
                        (prevData?.accounts.find((a) => a.companyId === account.companyId)
                          ?.currentPrice || 0)
                        ? 'bg-btn-red-color/20'
                        : 'bg-btn-blue-color/20'
                      : ''
                  }`}
                >
                  {addCommasToThousand(account.currentPrice)}
                </TableCell>
                <TableCell>{account.stockCnt}</TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.evaluation)} transition-colors duration-300 ${
                    account.evaluation !==
                    prevData?.accounts.find((a) => a.companyId === account.companyId)?.evaluation
                      ? account.evaluation >
                        (prevData?.accounts.find((a) => a.companyId === account.companyId)
                          ?.evaluation || 0)
                        ? 'bg-btn-red-color/20'
                        : 'bg-btn-blue-color/20'
                      : ''
                  }`}
                >
                  {`${plusMinusSign(account.evaluation)} ${addCommasToThousand(account.evaluation)}`}
                </TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.investment)} transition-colors duration-300 ${
                    account.investment !==
                    prevData?.accounts.find((a) => a.companyId === account.companyId)?.investment
                      ? account.investment >
                        (prevData?.accounts.find((a) => a.companyId === account.companyId)
                          ?.investment || 0)
                        ? 'bg-btn-red-color/20'
                        : 'bg-btn-blue-color/20'
                      : ''
                  }`}
                >
                  {`${plusMinusSign(account.investment)} ${addCommasToThousand(account.investment)}`}
                </TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.dailyProfitRate)} transition-colors duration-300 ${
                    account.dailyProfitRate !==
                    prevData?.accounts.find((a) => a.companyId === account.companyId)
                      ?.dailyProfitRate
                      ? account.dailyProfitRate >
                        (prevData?.accounts.find((a) => a.companyId === account.companyId)
                          ?.dailyProfitRate || 0)
                        ? 'bg-btn-red-color/20'
                        : 'bg-btn-blue-color/20'
                      : ''
                  }`}
                >
                  {`${plusMinusSign(account.dailyProfitRate)} ${roundToTwoDecimalPlaces(account.dailyProfitRate)}%`}
                </TableCell>
                <TableCell
                  className={`${addStockValueColorClass(account.dailyProfit)} transition-colors duration-300 ${
                    account.dailyProfit !==
                    prevData?.accounts.find((a) => a.companyId === account.companyId)?.dailyProfit
                      ? account.dailyProfit >
                        (prevData?.accounts.find((a) => a.companyId === account.companyId)
                          ?.dailyProfit || 0)
                        ? 'bg-btn-red-color/20'
                        : 'bg-btn-blue-color/20'
                      : ''
                  }`}
                >
                  {`${plusMinusSign(account.dailyProfit)} ${addCommasToThousand(account.dailyProfit)}`}
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
