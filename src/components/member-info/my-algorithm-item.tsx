import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

import { useDeleteAlgorithm } from '@/api/algorithm.api';
import { useGetCompaniesByCategory } from '@/api/category.api';
import { Algorithm } from '@/api/types/algorithm';
import { AlgorithmOption } from '@/components/member-info/algorithm-option';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { navigate } from '@/lib/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface MyAlgorithmItemProps {
  algorithm: Algorithm;
}

export const MyAlgorithmItem = ({ algorithm }: MyAlgorithmItemProps) => {
  const { userData } = useAuthStore();
  const memberId = userData.memberId ?? undefined;
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: deleteAlgorithm, isPending } = useDeleteAlgorithm();

  // 기업 목록 가져오기
  const { data: companies } = useGetCompaniesByCategory('0');

  const handleDelete = () => {
    if (userData?.memberId) {
      deleteAlgorithm(
        { memberId: userData.memberId.toString(), algorithmId: algorithm.algorithmId.toString() },
        {
          onSuccess: () => {
            setIsOpen(false);
          },
        },
      );
    }
  };

  const handleRouterBackTest = (algorithmId: number, companyId: number) => {
    navigate(`/backtest/${algorithmId}/${companyId}`);
  };

  return (
    <div className="flex w-full flex-row items-center justify-between rounded-[10px] bg-modal-background-color p-5">
      <div className="grid grid-cols-5">
        <div className="col-span-1 flex flex-col justify-center gap-2">
          <p className="mr-20 whitespace-nowrap text-text-main-color">{algorithm.algorithmName}</p>
          {algorithm.isRunning && (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex cursor-help items-center gap-1 rounded-full bg-btn-red-color px-3 py-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
                      <span className="text-sm text-white">실행 중</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={5}>
                    <p>
                      {algorithm.runningCompanies.map((company) => company.companyName).join(', ')}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        <div className="col-span-4 flex items-center justify-center">
          <AlgorithmOption algorithm={algorithm} />
        </div>
      </div>
      <div className="flex gap-3">
        {algorithm.dailyIncreasePercent !== null && algorithm.dailyDecreasePercent !== 0 ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="max-h-[45px] max-w-[225px]" variant={'green'} size={'lg'}>
                백 테스트
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>테스트 종목을 선택하세요.</AlertDialogTitle>
                <AlertDialogHeader>
                  <p className="text-[14px] text-border-color">
                    테스트 일자는 전날부터 1년전 기준으로 진행됩니다.
                  </p>
                </AlertDialogHeader>
                <AlertDialogDescription>
                  <>
                    {companies?.length !== 0 && companies ? (
                      <div className="max-h-[400px] animate-fadeIn overflow-y-auto">
                        {companies.map((companie, index) => (
                          <div
                            onClick={() =>
                              handleRouterBackTest(algorithm.algorithmId, companie.companyId)
                            }
                            className="mb-2 flex cursor-pointer items-center gap-2 rounded-xl border border-border-color border-opacity-20 bg-background-color p-4 py-3 transition-all duration-300 hover:bg-btn-blue-color hover:bg-opacity-20"
                          >
                            <p className="min-w-[20px] text-center opacity-40">{index + 1}</p>
                            <div className="h-10 w-10 overflow-hidden rounded-xl">
                              <img src={companie.companyImage} alt="none-logo" />
                            </div>
                            <p className="font-bold= text-[16px]">{companie.companyName}</p>
                            <p className="font-bold= text-[12px] opacity-40">
                              종목코드: {companie.companyCode.slice(0, 10)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <p>종목 종류 불러오기 실패.</p>
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
          <div className="w-[166px]"></div>
        )}
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <button
              className="rounded-[10px] border border-btn-red-color p-2 text-btn-red-color hover:bg-btn-red-color hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>알고리즘 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                {algorithm.isRunning
                  ? '알고리즘을 삭제하면 실행 중인 알고리즘이 종료되고 삭제됩니다.\n  계속하시겠습니까?'
                  : '알고리즘을 삭제하면 되돌릴 수 없습니다.\n 계속하시겠습니까?'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction variant="red" onClick={handleDelete}>
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
