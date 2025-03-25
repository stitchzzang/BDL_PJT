import { XMarkIcon } from '@heroicons/react/24/outline';

import { Algorithm } from '@/api/types/algorithm';
import { AlgorithmOption } from '@/components/member-info/algorithm-option';

export const MyAlgorithmItem = ({ algorithm }: { algorithm: Algorithm }) => {
  return (
    <div className="flex w-full flex-row items-center justify-between rounded-[10px] bg-modal-background-color p-5">
      <p className="mr-20 whitespace-nowrap text-text-main-color">{algorithm.algorithmName}</p>
      <AlgorithmOption algorithm={algorithm} />
      <button className="rounded-[10px] border border-btn-red-color p-2 text-btn-red-color hover:bg-btn-red-color hover:text-white">
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};
