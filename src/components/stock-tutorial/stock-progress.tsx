import { useEffect, useMemo, useRef, useState } from 'react';

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
  pointDates?: string[]; // 변곡점 날짜 배열 (추가)
  defaultStartDate?: string; // 기본 시작 날짜 (추가)
  defaultEndDate?: string; // 기본 종료 날짜 (추가)
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
  pointDates,
  defaultStartDate,
  defaultEndDate,
}: ProgressInfoProps) => {
  // 각 턴별로 적절한 시작 및 종료 날짜 계산
  const { displayStartDate, displayEndDate } = useMemo(() => {
    if (!currentTurn || !formatDateFn) {
      return { displayStartDate: startDate, displayEndDate: endDate };
    }

    // 각 턴에 맞는 구간별 날짜 설정
    // 변곡점 날짜가 있으면 사용, 없으면 기본 값들 사용
    if (pointDates && pointDates.length >= 3) {
      // 날짜에서 하루를 빼는 함수 (보드 내 일관성을 위함)
      const subtractOneDay = (dateStr: string): string => {
        try {
          // 날짜 형식이 'YYMMDD'라고 가정
          const year = parseInt('20' + dateStr.substring(0, 2));
          const month = parseInt(dateStr.substring(2, 4)) - 1; // 0-based 월
          const day = parseInt(dateStr.substring(4, 6));

          const date = new Date(year, month, day);
          date.setDate(date.getDate() - 1);

          // 다시 'YYMMDD' 형식으로 변환
          const adjustedYear = date.getFullYear().toString().substring(2);
          const adjustedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
          const adjustedDay = date.getDate().toString().padStart(2, '0');

          return adjustedYear + adjustedMonth + adjustedDay;
        } catch {
          return dateStr; // 오류 시 원본 날짜 반환
        }
      };

      // 턴별 날짜 범위 설정
      switch (currentTurn) {
        case 1:
          return {
            displayStartDate: defaultStartDate || startDate,
            displayEndDate: subtractOneDay(pointDates[0]),
          };
        case 2:
          return {
            displayStartDate: pointDates[0],
            displayEndDate: subtractOneDay(pointDates[1]),
          };
        case 3:
          return {
            displayStartDate: pointDates[1],
            displayEndDate: subtractOneDay(pointDates[2]),
          };
        case 4:
          return {
            displayStartDate: pointDates[2],
            displayEndDate: defaultEndDate || endDate,
          };
        default:
          return { displayStartDate: startDate, displayEndDate: endDate };
      }
    }

    return { displayStartDate: startDate, displayEndDate: endDate };
  }, [currentTurn, startDate, endDate, pointDates, defaultStartDate, defaultEndDate, formatDateFn]);

  if (!((displayStartDate && displayEndDate && formatDateFn) || currentTurn !== undefined)) {
    return null;
  }

  return (
    <div className="flex gap-2 rounded-xl bg-modal-background-color px-[20px] py-[12px]">
      <p className="text-[14px] text-border-color">진행 정보 :</p>
      <div className="flex gap-1">
        {displayStartDate && displayEndDate && formatDateFn && (
          <>
            <span className="text-[14px] font-medium">{formatDateFn(displayStartDate)}</span>
            <span className="mx-1 text-[14px] font-bold text-border-color">-</span>
            <span className="text-[14px] font-medium">{formatDateFn(displayEndDate)}</span>
          </>
        )}
        {currentTurn !== undefined &&
          currentTurn > 0 &&
          displayStartDate &&
          displayEndDate &&
          formatDateFn && <span className="mx-2 text-[14px] font-bold text-border-color">|</span>}
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
        pointDates={props.pointDates}
        defaultStartDate={props.defaultStartDate}
        defaultEndDate={props.defaultEndDate}
      />
    </div>
  );
};
