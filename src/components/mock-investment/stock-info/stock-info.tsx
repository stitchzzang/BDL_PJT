import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  useCheckAlgorithm,
  useGetAlgorithm,
  useStartAlgorithm,
  useStopAlgorithm,
} from '@/api/algorithm.api';
import { CompanyInfo, TickData } from '@/api/types/stock';
import { LoadingAnimation } from '@/components/common/loading-animation';
import {
  AlertDialog,
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
  const { userData } = useAuthStore();
  // 알고리즘 실해 여부
  const { data: checkingAlgorithm, isLoading } = useCheckAlgorithm(
    userData.memberId ?? 0,
    companyId,
  );
  console.log(checkingAlgorithm);
  // 알고리즘 리스트

  // 알고리즘 시작
  const StartAlgorithm = useStartAlgorithm();
  const handleStartAlgorithm = (algorithmId: number) => {
    StartAlgorithm.mutate(
      {
        algorithmId,
        companyId,
      },
      {
        onSuccess: () => {
          setNowAlgorithmId(algorithmId);
          setAlgorithmActive(true);
          toast.success('알고리즘 시작');
        },
        onError: (error) => {
          console.error('알고리즘 시작 실패:', error);
        },
      },
    );
  };
  // 알고리즘 정지
  const StopAlgorithm = useStopAlgorithm();
  const handleStopAlgorithm = (algorithmId: number) => {
    StopAlgorithm.mutate(
      {
        algorithmId,
        companyId,
      },
      {
        onSuccess: () => {
          toast.success('정지 완료');
          setAlgorithmActive(false);
        },
        onError: (error) => {
          alert('알고리즘 정지 실패:');
        },
      },
    );
  };
  const { data: algorithms, isError } = useGetAlgorithm(userData.memberId?.toString() ?? '');
  // const CategoryIcon = getCategoryIcon(stockCompanyInfo?.categories?.[0] ?? 'IT');
  const priceToCompare = tickData ? tickData.stckPrpr : closePrice;
  const AutoIcon = getCategoryIcon(stockCompanyInfo?.categories[0] ?? '전체');
  // 외부 함수 호출
  const priceChange = calculatePriceChange(priceToCompare, comparePrice ?? 0);

  // 알고리즘 버튼 활성화
  const [algorithmActive, setAlgorithmActive] = useState<boolean>(false);
  useEffect(() => {
    if (checkingAlgorithm?.isRunning === false) {
      setAlgorithmActive(false);
    } else {
      setAlgorithmActive(true);
    }
  }, [checkingAlgorithm]);
  // 알고리즘 아이디 관리
  const [nowAlgorithmId, setNowAlgorithmId] = useState<number>(0);
  useEffect(() => {
    if (checkingAlgorithm) {
      setNowAlgorithmId(checkingAlgorithm?.algorithmId);
    }
  }, [checkingAlgorithm]);

  if (isLoading) {
    return (
      <>
        <LoadingAnimation />
      </>
    );
  }
  return (
    <div className="flex animate-fadeIn items-center">
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
                          {IconComponent ? (
                            <div className="h-5 w-5">
                              <IconComponent />
                            </div>
                          ) : (
                            <div className="h-5 w-5">{/* 기본 아이콘 또는 빈 요소 */}</div>
                          )}
                        </div>
                        <p className="text-border-color">{name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                {algorithmActive === false ? (
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
                                    className="mb-2 cursor-pointer rounded-xl border border-border-color border-opacity-20 bg-background-color p-4 py-6 transition-all duration-300 hover:bg-btn-blue-color hover:bg-opacity-20"
                                  >
                                    <p className="font-bold= text-[14px]">
                                      {algorithm.algorithmName}
                                    </p>
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
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <>
                    <Button
                      className="max-h-[45px] max-w-[225px]"
                      variant={'red'}
                      size={'lg'}
                      onClick={() => handleStopAlgorithm(nowAlgorithmId)}
                    >
                      알고리즘 실행중
                      <p className="text-[12px] opacity-30"></p>
                      {StopAlgorithm.isPending ? (
                        <p className="text-[14px]">정지중 ...</p>
                      ) : (
                        <p className="text-[12px] opacity-30">정지하기</p>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
