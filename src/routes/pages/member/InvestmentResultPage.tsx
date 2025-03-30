import { useGetAccountSummary } from '@/api/member.api';
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
import { getChangeRateColorClass } from '@/utils/getChangeRateColorClass';
import { addCommasToThousand, roundToTwoDecimalPlaces } from '@/utils/numberFormatter';

export const InvestmentResultPage = () => {
  const { data: accountSummary, isLoading, isError } = useGetAccountSummary('1');

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError) {
    return <ErrorScreen />;
  }

  return (
    <div className="flex w-full flex-col gap-4 px-6">
      <div className="flex flex-row gap-3">
        <div className="flex flex-col items-start">
          <p className="text-lg text-border-color">총 자산</p>
          <p className="text-4xl font-bold">
            {accountSummary?.totalAsset ? addCommasToThousand(accountSummary?.totalAsset) : '0'}
          </p>
        </div>
        <div className="flex flex-row items-start rounded-lg bg-modal-background-color p-3">
          <div className="flex flex-col items-start">
            <p className="text-sm text-border-color">내 평가금</p>
            <p className="text-3xl font-bold text-btn-red-color">
              {accountSummary?.totalEvaluation
                ? addCommasToThousand(accountSummary?.totalEvaluation)
                : '0'}
            </p>
          </div>
          <div className="mx-4 h-full w-[1px] bg-btn-primary-inactive-color" />
          <div className="flex flex-col items-start">
            <p className="text-sm text-border-color">내 현금</p>
            <p className="text-3xl font-bold text-btn-green-color">
              {accountSummary?.totalCash ? addCommasToThousand(accountSummary?.totalCash) : '0'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">
          <Badge variant={accountSummary?.totalProfitRate === 0 ? 'zero' : 'increase'}>
            <span className="mr-1 text-sm text-border-color">총 수익률:</span>
            <span
              className={`text-sm ${getChangeRateColorClass(accountSummary?.totalProfitRate ?? 0)}`}
            >
              {accountSummary?.totalProfitRate
                ? roundToTwoDecimalPlaces(accountSummary?.totalProfitRate)
                : '0'}
              %
            </span>
          </Badge>
          <Badge variant={accountSummary?.totalProfitRate === 0 ? 'zero' : 'main'}>
            <span className="mr-1 text-sm text-border-color">총 수익:</span>
            <span className={`${getChangeRateColorClass(accountSummary?.totalProfit ?? 0)}`}>
              {accountSummary?.totalProfit ? addCommasToThousand(accountSummary?.totalProfit) : '0'}
            </span>
          </Badge>
          <Badge variant={accountSummary?.dailyProfitRate === 0 ? 'zero' : 'decrease'}>
            <span className="mr-1 text-sm text-border-color">일간 수익률:</span>
            <span
              className={`text-sm ${getChangeRateColorClass(accountSummary?.dailyProfitRate ?? 0)}`}
            >
              {accountSummary?.dailyProfitRate
                ? roundToTwoDecimalPlaces(accountSummary?.dailyProfitRate)
                : '0'}
              %
            </span>
          </Badge>
          <Badge variant={accountSummary?.dailyProfitRate === 0 ? 'zero' : 'main'}>
            <span className="mr-1 text-sm text-border-color">일간 수익:</span>
            <span
              className={`text-sm ${getChangeRateColorClass(accountSummary?.dailyProfitRate ?? 0)}`}
            >
              {accountSummary?.dailyProfit ? addCommasToThousand(accountSummary?.dailyProfit) : '0'}
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
                <AlertDialogAction className="border-none bg-btn-red-color hover:bg-btn-red-color/20 hover:text-btn-red-color">
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
          <span>{accountSummary?.accountCount ? accountSummary?.accountCount : '0'}개</span>
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
          {accountSummary?.accounts.length && accountSummary?.accounts.length > 0 ? (
            accountSummary?.accounts.map((account) => (
              <TableRow key={account.companyId}>
                <TableCell>{account.companyName}</TableCell>
                <TableCell>{roundToTwoDecimalPlaces(account.profitRate)}%</TableCell>
                <TableCell>{addCommasToThousand(account.profit)}</TableCell>
                <TableCell>{addCommasToThousand(account.avgPrice)}</TableCell>
                <TableCell>{addCommasToThousand(account.currentPrice)}</TableCell>
                <TableCell>{account.stockCnt}</TableCell>
                <TableCell>{addCommasToThousand(account.evaluation)}</TableCell>
                <TableCell>{addCommasToThousand(account.investment)}</TableCell>
                <TableCell>{roundToTwoDecimalPlaces(account.dailyProfitRate)}%</TableCell>
                <TableCell>{addCommasToThousand(account.dailyProfit)}</TableCell>
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
