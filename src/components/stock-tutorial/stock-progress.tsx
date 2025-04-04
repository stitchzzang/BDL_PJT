import { useEffect, useRef, useState } from 'react';

// Props 인터페이스 정의
interface StockProgressProps {
  progress?: number; // 외부에서 받은 진행률
}

export const StockProgress = ({ progress: externalProgress }: StockProgressProps) => {
  const [internalProgress, setInternalProgress] = useState<number>(externalProgress || 0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 외부 progress가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    if (externalProgress !== undefined) {
      setInternalProgress(externalProgress);
    }
  }, [externalProgress]);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col gap-3 rounded-xl bg-modal-background-color px-[16px] py-[12px]">
        <div className="flex items-center justify-between">
          <p className="text-[14px] text-border-color">진행률 :</p>
          <span className="text-[14px] font-medium">{internalProgress}%</span>
        </div>
      </div>
      <div className="min-w-[210px]">
        <div
          ref={progressBarRef}
          className="relative h-full w-full select-none rounded-xl bg-btn-green-color bg-opacity-20"
        >
          <div
            className="transition-width absolute left-0 top-0 h-full rounded-xl border-4 border-[#032F2A] bg-btn-green-color duration-75"
            style={{ width: `${internalProgress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
