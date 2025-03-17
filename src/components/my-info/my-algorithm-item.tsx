import { XMarkIcon } from '@heroicons/react/24/outline';

import { AlgorithmOptionItem } from '@/components/my-info/algorithm-option-item';

export const MyAlgorithmItem = () => {
  return (
    <div className="flex flex-row items-center gap-5 rounded-[10px] bg-modal-background-color p-3">
      <p className="text-text-main-color">알고리즘 이름</p>
      <div className="flex flex-row gap-2">
        <AlgorithmOptionItem />
        <AlgorithmOptionItem />
        <AlgorithmOptionItem />
      </div>
      <button className="rounded-[10px] border border-btn-red-color p-2 text-btn-red-color hover:bg-btn-red-color hover:text-white">
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
};
