import { useEffect, useRef, useState } from 'react';

// Props 인터페이스 정의
interface StockProgressProps {
  progress?: number; // 외부에서 받은 진행률
  onProgressChange: (progress: number) => void; // 진행률 변경 시 호출될 콜백
}

export const StockProgress = ({
  progress: externalProgress,
  onProgressChange,
}: StockProgressProps) => {
  const [internalProgress, setInternalProgress] = useState<number>(externalProgress || 0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 외부 progress가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    if (externalProgress !== undefined && !isDragging) {
      setInternalProgress(externalProgress);
    }
  }, [externalProgress, isDragging]);

  const updateProgressFromPosition = (clientX: number) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const width = rect.width;

    // 0-100 사이의 퍼센트 계산
    const newProgress = Math.min(100, Math.max(0, Math.round((x / width) * 100)));
    setInternalProgress(newProgress);
    onProgressChange(newProgress); // 부모 컴포넌트에 진행률 알림
  };

  // 클릭 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateProgressFromPosition(e.clientX);
  };

  // 마우스 움직임 및 드래그 종료 처리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateProgressFromPosition(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3 rounded-xl bg-modal-background-color px-[20px] py-[15px]">
        <div className="flex items-center justify-between">
          <p className="text-[16px] text-border-color">진행률 :</p>
          <span className="font-medium">{internalProgress}%</span>
        </div>
      </div>
      <div className="min-w-[230px]">
        <div
          ref={progressBarRef}
          className="relative h-full w-full cursor-pointer select-none rounded-xl bg-btn-green-color bg-opacity-20"
          onMouseDown={handleMouseDown}
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
