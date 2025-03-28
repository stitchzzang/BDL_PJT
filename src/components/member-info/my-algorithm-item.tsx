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

interface MyAlgorithmItemProps {
  algorithm: Algorithm;
}

export const MyAlgorithmItem = ({ algorithm }: MyAlgorithmItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: deleteAlgorithm } = useDeleteAlgorithm();

  const handleDelete = () => {
    deleteAlgorithm(
      { memberId: '1', algorithmId: algorithm.algorithmId.toString() },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
      },
    );
  };

  return (
    <div className="flex w-full flex-row items-center justify-between rounded-[10px] bg-modal-background-color p-5">
      <div className="flex flex-col items-start gap-2">
        <p className="mr-20 whitespace-nowrap text-text-main-color">{algorithm.algorithmName}</p>
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
                ? '알고리즘을 삭제하면 실행 중인 알고리즘이 종료되고 삭제됩니다. 계속하시겠습니까?'
                : '알고리즘을 삭제하면 되돌릴 수 없습니다. 계속하시겠습니까?'}
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
