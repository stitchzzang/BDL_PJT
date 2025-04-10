import Lottie from 'lottie-react';
import { useMemo } from 'react';

import robotMove from '@/assets/lottie/robot-animation.json';
import { DecryptedText } from '@/components/ui/decrypted-text';
import { Skeleton } from '@/components/ui/skeleton';

interface StockTutorialCommentProps {
  /**
   * AI가 제공하는 뉴스 코멘트 문자열
   * API에서 받아온 코멘트가 없는 경우 기본 텍스트가 표시됨
   */
  comment: string;
  isTutorialStarted?: boolean;
  isLoading?: boolean;
}

export const StockTutorialComment = ({
  comment,
  isTutorialStarted = false,
  isLoading = false,
}: StockTutorialCommentProps) => {
  // 뉴스 히스토리와 동일한 최소 높이 (DayHistory 컴포넌트와 일치)
  const MIN_HEIGHT = 320;

  // 로딩 상태일 때 Skeleton UI 표시
  if (isLoading) {
    return (
      <div className="w-full animate-fadeIn">
        <div className="flex gap-4" style={{ minHeight: `${MIN_HEIGHT}px` }}>
          <Skeleton className="h-[70px] w-[70px]" style={{ backgroundColor: '#0D192B' }} />
          <div className="flex w-full flex-col overflow-y-auto rounded-lg border border-border-color bg-modal-background-color p-[25px]">
            <Skeleton className="h-6 w-full" style={{ backgroundColor: '#0D192B' }} />
            <Skeleton className="mt-3 h-6 w-full" style={{ backgroundColor: '#0D192B' }} />
            <Skeleton className="mt-3 h-6 w-full" style={{ backgroundColor: '#0D192B' }} />
            <Skeleton className="mt-3 h-6 w-3/4" style={{ backgroundColor: '#0D192B' }} />
          </div>
        </div>
      </div>
    );
  }

  // 표시할 코멘트 결정 (API 코멘트가 있으면 사용, 없으면 기본 코멘트)
  const hasValidComment = comment && comment.trim() !== '';
  const rawDisplayText = useMemo(() => {
    if (hasValidComment) {
      return comment;
    }

    // 튜토리얼 시작 여부에 따라 다른 메시지 표시
    if (!isTutorialStarted) {
      return '🤖 AI 뉴스 코멘트\n- AI가 요약한 뉴스 코멘트를 제공해드립니다.';
    } else {
      return '이 구간에 대한 뉴스 코멘트가 준비되지 않았습니다. 곧 업데이트될 예정입니다.';
    }
  }, [hasValidComment, comment, isTutorialStarted]);

  // 줄바꿈 처리된 텍스트
  const displayText = useMemo(() => rawDisplayText, [rawDisplayText]);

  return (
    <div className="w-full animate-fadeIn">
      <div className="flex gap-4" style={{ minHeight: `${MIN_HEIGHT}px` }}>
        <div>
          <Lottie
            animationData={robotMove}
            loop={true}
            autoplay={true}
            style={{ height: 70, width: 70 }}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice',
            }}
          />
        </div>
        <div className="flex w-full flex-col overflow-y-auto rounded-lg border border-border-color bg-modal-background-color p-[25px]">
          <h1 className="whitespace-pre-line leading-relaxed">
            <DecryptedText
              text={displayText}
              animateOn="view"
              speed={200}
              encryptedClassName="text-border-color"
              parentClassName="whitespace-pre-line"
            />
          </h1>
        </div>
      </div>
    </div>
  );
};
