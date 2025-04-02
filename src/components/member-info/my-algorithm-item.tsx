import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

import { useDeleteAlgorithm } from '@/api/algorithm.api';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/store/useAuthStore';

interface MyAlgorithmItemProps {
  algorithm: Algorithm;
}

export const MyAlgorithmItem = ({ algorithm }: MyAlgorithmItemProps) => {
  const { userData } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: deleteAlgorithm } = useDeleteAlgorithm();

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

  return (
    <div className="flex w-full flex-row items-center justify-between rounded-[10px] bg-modal-background-color p-5">
      <div className="flex flex-col items-start gap-2">
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
      <AlgorithmOption algorithm={algorithm} />
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <button className="rounded-[10px] border border-btn-red-color p-2 text-btn-red-color hover:bg-btn-red-color hover:text-white">
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
  );
};
