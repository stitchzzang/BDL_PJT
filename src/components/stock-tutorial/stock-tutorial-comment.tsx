import Lottie from 'lottie-react';
import { useMemo } from 'react';

import robotMove from '@/assets/lottie/robot-animation.json';
import { DecryptedText } from '@/components/ui/decrypted-text';

interface StockTutorialCommentProps {
  /**
   * AI가 제공하는 뉴스 코멘트 문자열
   * API에서 받아온 코멘트가 없는 경우 기본 텍스트가 표시됨
   */
  comment: string;
}

export const StockTutorialComment = ({ comment }: StockTutorialCommentProps) => {
  // 표시할 코멘트 결정 (API 코멘트가 있으면 사용, 없으면 기본 코멘트)
  const hasValidComment = comment && comment.trim() !== '';
  const rawDisplayText = hasValidComment
    ? comment
    : '🤖 AI 뉴스 코멘트\n- AI가 요약한 뉴스 코멘트를 제공해드립니다.';

  // 줄바꿈 처리된 텍스트
  const displayText = useMemo(() => rawDisplayText, [rawDisplayText]);

  // 뉴스 히스토리와 동일한 최소 높이 (DayHistory 컴포넌트와 일치)
  const MIN_HEIGHT = 320;

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
