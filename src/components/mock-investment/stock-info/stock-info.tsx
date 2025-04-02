import { useGetAlgorithm, useStartAlgorithm } from '@/api/algorithm.api';
import { CompanyInfo, TickData } from '@/api/types/stock';
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
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { calculatePriceChange } from '@/utils/calculate-price-change';
import { getCategoryIcon } from '@/utils/categoryMapper';
import { addCommasToThousand } from '@/utils/numberFormatter';

interface StockInfoProps {
  stockCompanyInfo?: CompanyInfo;
  tickData: TickData | null;
  closePrice: number;
  comparePrice?: number;
  companyId: number;
}

export const StockInfo = ({
  stockCompanyInfo,
  tickData,
  closePrice,
  comparePrice,
  companyId,
}: StockInfoProps) => {
  // 알고리즘 리스트
  const { userData } = useAuthStore();
  // 알고리즘 시작
  const StartAlgorithm = useStartAlgorithm();
  const handleStartAlgorithm = (algorithmId: number) => {
    StartAlgorithm.mutate(
      {
        algorithmId,
        companyId,
      },
      {
        onSuccess: (message) => {
          alert('알고리즘 시작 성공:');
        },
        onError: (error) => {
          console.error('알고리즘 시작 실패:', error);
        },
      },
    );
  };
  const {
    data: algorithms,
    isLoading,
    isError,
  } = useGetAlgorithm(userData.memberId?.toString() ?? '');
  // const CategoryIcon = getCategoryIcon(stockCompanyInfo?.categories?.[0] ?? 'IT');
  const priceToCompare = tickData ? tickData.stckPrpr : closePrice;
  const AutoIcon = getCategoryIcon(stockCompanyInfo?.categories[0] ?? '전체');
  // 외부 함수 호출
  const priceChange = calculatePriceChange(priceToCompare, comparePrice ?? 0);
  return (
    <div className="flex items-center">
      <div className="flex w-full items-start gap-[20px] sm:items-center">
        <div className="flex w-full gap-3">
          <div className="max-h-[60px] max-w-[60px] overflow-hidden rounded-xl">
            {/* 이미지 */}
            <img src={stockCompanyInfo?.companyImage} alt="stock-icon" />
          </div>
          <div className="flex w-full flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-medium text-white">
                {stockCompanyInfo?.companyName}
              </h3>
              <p className="text-[14px] font-light text-border-color">
                {stockCompanyInfo?.companyCode}
              </p>
            </div>
            <div className="flex w-full flex-col items-start justify-start gap-[18px] sm:flex-row sm:items-center sm:justify-between">
              <div className="ite flex flex-col gap-1 sm:flex-row">
                <div className="flex flex-col items-center gap-2 text-[14px] sm:flex-row">
                  <h3 className="text-[22px] font-medium text-white">
                    {tickData
                      ? addCommasToThousand(tickData?.stckPrpr)
                      : addCommasToThousand(closePrice)}
                    원
                  </h3>
                  <div className="flex justify-center gap-2 rounded-lg">
                    <p className="text-border-color">어제보다</p>
                    <p
                      className={priceChange.isRise ? 'text-btn-red-color' : 'text-btn-blue-color'}
                    >
                      {priceChange.isRise ? '+' : '-'}
                      {addCommasToThousand(priceChange.change)}원({priceChange.percent}%)
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-[15px] rounded-lg border border-border-color border-opacity-20 bg-modal-background-color p-2">
                  {stockCompanyInfo?.categories.map((name, index) => {
                    const IconComponent = getCategoryIcon(name);
                    return (
                      <div
                        className="flex min-h-[25px] min-w-[25px] items-center justify-center gap-1"
                        key={index}
                      >
                        <div className="h-5 w-5">
                          <IconComponent />
                        </div>
                        <p className="text-border-color">{name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="max-h-[45px] max-w-[225px]" variant={'red'} size={'lg'}>
                      알고리즘 선택
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>알고리즘을 선택하세요.</AlertDialogTitle>
                      <AlertDialogDescription>
                        <>
                          {algorithms?.length !== 0 && algorithms ? (
                            <div>
                              {algorithms.map((algorithm) => (
                                <div
                                  onClick={() => handleStartAlgorithm(algorithm.algorithmId)}
                                  className="mb-2 cursor-pointer rounded-xl border border-border-color border-opacity-20 bg-background-color p-4 transition-all duration-300 hover:bg-btn-blue-color hover:bg-opacity-20"
                                >
                                  <p>{algorithm.algorithmName}</p>
                                  <p>{algorithm.algorithmId}</p>
                                  <p>{companyId}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div>
                              <p>현재 생성된 알고리즘이 없습니다.</p>
                            </div>
                          )}
                        </>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction>확인</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
