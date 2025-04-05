import { useEffect, useRef, useState } from 'react';

// 공통 Props 인터페이스 정의
interface CommonProgressProps {
  progress?: number; // 외부에서 받은 진행률
}

// 진행률 Props 인터페이스
interface ProgressBarProps extends CommonProgressProps {}

// 진행 정보 Props 인터페이스
interface ProgressInfoProps {
  currentTurn?: number; // 현재 단계
  startDate?: string; // 시작 날짜
  endDate?: string; // 종료 날짜
  formatDateFn?: (date: string) => string; // 날짜 포맷팅 함수
}

// 전체 Props 인터페이스
interface StockProgressProps extends ProgressBarProps, ProgressInfoProps {}

// 진행률 바 컴포넌트
export const ProgressBar = ({ progress: externalProgress }: ProgressBarProps) => {
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
          <p className="mr-2 text-[14px] text-border-color">진행률 :</p>
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

// 진행 정보 컴포넌트
export const ProgressInfo = ({
  currentTurn,
  startDate,
  endDate,
  formatDateFn,
}: ProgressInfoProps) => {
  if (!((startDate && endDate && formatDateFn) || currentTurn !== undefined)) {
    return null;
  }

  return (
    <div className="flex gap-2 rounded-xl bg-modal-background-color px-[16px] py-[12px]">
      <p className="text-[14px] text-border-color">진행 정보 :</p>
      <div className="flex gap-1">
        {startDate && endDate && formatDateFn && (
          <>
            <span className="text-[14px] font-medium">{formatDateFn(startDate)}</span>
            <span className="mx-1 text-[14px] font-bold text-border-color">-</span>
            <span className="text-[14px] font-medium">{formatDateFn(endDate)}</span>
          </>
        )}
        {currentTurn !== undefined && currentTurn > 0 && startDate && endDate && formatDateFn && (
          <span className="mx-2 text-[14px] font-bold text-border-color">|</span>
        )}
        {currentTurn !== undefined && currentTurn > 0 && (
          <span className="text-[14px] font-medium">{currentTurn}/4 단계</span>
        )}
      </div>
    </div>
  );
};

// 기존 StockProgress 컴포넌트는 이제 두 컴포넌트를 결합
export const StockProgress = (props: StockProgressProps) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <ProgressBar progress={props.progress} />
      <ProgressInfo
        currentTurn={props.currentTurn}
        startDate={props.startDate}
        endDate={props.endDate}
        formatDateFn={props.formatDateFn}
      />
    </div>
  );
};
