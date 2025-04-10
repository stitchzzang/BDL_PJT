import { useEffect, useMemo, useRef, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// 공통 Props 인터페이스 정의
interface CommonProgressProps {
  progress?: number; // 외부에서 받은 진행률
  isLoading?: boolean; // 로딩 상태 추가
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
  isLoading?: boolean; // 로딩 상태 추가
}

// 전체 Props 인터페이스
interface StockProgressProps extends ProgressBarProps, ProgressInfoProps {}

// 진행률 바 컴포넌트
export const ProgressBar = ({ progress: externalProgress, isLoading }: ProgressBarProps) => {
  const [internalProgress, setInternalProgress] = useState<number>(externalProgress || 0);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // 외부 progress가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    if (externalProgress !== undefined) {
      setInternalProgress(externalProgress);
    }
  }, [externalProgress]);

  if (isLoading) {
    return (
      <div className="flex gap-3">
        <Skeleton
          className="h-[40px] w-[120px] rounded-xl"
          style={{ backgroundColor: '#0D192B' }}
        />
        <Skeleton
          className="h-[40px] w-[210px] rounded-xl"
          style={{ backgroundColor: '#0D192B' }}
        />
      </div>
    );
  }

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
            className="transition-width absolute left-0 top-0 h-full rounded-xl bg-btn-green-color duration-500"
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
  isLoading,
}: ProgressInfoProps) => {
  // YYMMDD 형식의 문자열을 Date 객체로 변환하는 함수
  const parseYYMMDDToDate = (dateStr: string): Date => {
    try {
      if (!dateStr || dateStr.length !== 6) {
        return new Date();
      }

      const year = parseInt('20' + dateStr.substring(0, 2));
      const month = parseInt(dateStr.substring(2, 4)) - 1; // 0-based 월
      const day = parseInt(dateStr.substring(4, 6));

      return new Date(year, month, day);
    } catch {
      return new Date();
    }
  };

  // Date 객체를 YYMMDD 형식 문자열로 변환하는 함수
  const formatDateToYYMMDD = (date: Date): string => {
    const adjustedYear = date.getFullYear().toString().substring(2);
    const adjustedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
    const adjustedDay = date.getDate().toString().padStart(2, '0');

    return adjustedYear + adjustedMonth + adjustedDay;
  };

  // 주어진 날짜가 평일인지 확인하는 함수 (0: 일요일, 6: 토요일)
  const isBusinessDay = (date: Date): boolean => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  };

  // 변곡점에서 하루를 빼고, 그 결과가 평일이 될 때까지 추가로 날짜 조정
  const findPreviousBusinessDay = (dateStr: string): string => {
    try {
      const date = parseYYMMDDToDate(dateStr);

      // 하루 이전으로 설정
      date.setDate(date.getDate() - 1);

      // 평일이 될 때까지 계속 이전 날짜로 이동
      while (!isBusinessDay(date)) {
        date.setDate(date.getDate() - 1);
      }

      return formatDateToYYMMDD(date);
    } catch {
      return dateStr; // 오류 시 원본 날짜 반환
    }
  };

  // 주어진 날짜가 평일이 아니면 다음 평일로 조정
  const findNextBusinessDay = (dateStr: string): string => {
    try {
      const date = parseYYMMDDToDate(dateStr);

      // 현재 날짜가 평일이 아니면 다음 평일로 이동
      while (!isBusinessDay(date)) {
        date.setDate(date.getDate() + 1);
      }

      return formatDateToYYMMDD(date);
    } catch {
      return dateStr; // 오류 시 원본 날짜 반환
    }
  };

  // 주어진 날짜가 평일이 아니면 이전 평일로 조정
  const findLatestBusinessDay = (dateStr: string): string => {
    try {
      const date = parseYYMMDDToDate(dateStr);

      // 현재 날짜가 평일이 아니면 이전 평일로 이동
      while (!isBusinessDay(date)) {
        date.setDate(date.getDate() - 1);
      }

      return formatDateToYYMMDD(date);
    } catch {
      return dateStr; // 오류 시 원본 날짜 반환
    }
  };

  // 각 턴별로 적절한 시작 및 종료 날짜 계산
  const { displayStartDate, displayEndDate } = useMemo(() => {
    if (!currentTurn || !formatDateFn) {
      return { displayStartDate: startDate, displayEndDate: endDate };
    }

    // 오늘 날짜 기준 가장 최근 평일 계산 (기본 끝점)
    const endPoint = defaultEndDate
      ? findLatestBusinessDay(defaultEndDate)
      : endDate
        ? findLatestBusinessDay(endDate)
        : formatDateToYYMMDD(new Date());

    // 변곡점을 기준으로 각 구간 정의
    if (pointDates && pointDates.length >= 3) {
      switch (currentTurn) {
        case 1: {
          // 첫 구간: 시작점 ~ (변곡점1 - 1일, 평일 기준)
          const start = findNextBusinessDay(defaultStartDate || startDate || '');
          const end = findPreviousBusinessDay(pointDates[0]);
          return { displayStartDate: start, displayEndDate: end };
        }
        case 2: {
          // 두 번째 구간: 변곡점1 ~ (변곡점2 - 1일, 평일 기준)
          const start = findNextBusinessDay(pointDates[0]);
          const end = findPreviousBusinessDay(pointDates[1]);
          return { displayStartDate: start, displayEndDate: end };
        }
        case 3: {
          // 세 번째 구간: 변곡점2 ~ (변곡점3 - 1일, 평일 기준)
          const start = findNextBusinessDay(pointDates[1]);
          const end = findPreviousBusinessDay(pointDates[2]);
          return { displayStartDate: start, displayEndDate: end };
        }
        case 4: {
          // 네 번째 구간: 변곡점3 ~ 끝점, 평일 기준
          const start = findNextBusinessDay(pointDates[2]);
          // 끝점은 오늘 기준 가장 최근 평일 (defaultEndDate가 있다면 그것의 가장 최근 평일)
          return { displayStartDate: start, displayEndDate: endPoint };
        }
        default:
          return { displayStartDate: startDate, displayEndDate: endDate };
      }
    }

    return { displayStartDate: startDate, displayEndDate: endDate };
  }, [
    currentTurn,
    startDate,
    endDate,
    pointDates,
    defaultStartDate,
    defaultEndDate,
    formatDateFn,
    findLatestBusinessDay,
    findNextBusinessDay,
    findPreviousBusinessDay,
  ]);

  if (isLoading) {
    return (
      <Skeleton className="h-[40px] w-[300px] rounded-xl" style={{ backgroundColor: '#0D192B' }} />
    );
  }

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
export const StockProgress = ({ isLoading, ...props }: StockProgressProps) => {
  if (isLoading) {
    return (
      <div className="mt-3 flex items-center justify-between gap-3">
        <Skeleton
          className="h-[40px] w-[350px] rounded-xl"
          style={{ backgroundColor: '#0D192B' }}
        />
        <Skeleton
          className="h-[40px] w-[350px] rounded-xl"
          style={{ backgroundColor: '#0D192B' }}
        />
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center justify-between gap-3">
      <ProgressBar progress={props.progress} isLoading={isLoading} />
      <ProgressInfo
        currentTurn={props.currentTurn}
        startDate={props.startDate}
        endDate={props.endDate}
        formatDateFn={props.formatDateFn}
        pointDates={props.pointDates}
        defaultStartDate={props.defaultStartDate}
        defaultEndDate={props.defaultEndDate}
        isLoading={isLoading}
      />
    </div>
  );
};
