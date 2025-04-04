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
    : '🤖 AI 뉴스 코멘트\nAI가 요약한 뉴스 코멘트를 제공해드립니다.';

  // 문장별로 분리하는 함수
  const formatSentences = (text: string): string => {
    // 문장 끝 감지 패턴 (마침표, 물음표, 느낌표 뒤에 공백이나 줄바꿈이 오는 경우)
    const sentenceEndPattern = /([.!?])\s+/g;

    // 문장 끝 문자 뒤에 줄바꿈 추가
    const formattedText = text.replace(sentenceEndPattern, '$1\n');

    // "요약:" 이라는 텍스트 앞에도 줄바꿈 추가 (API 응답이 "요약:" 으로 시작하는 경우 처리)
    return formattedText.replace(/요약:/, '요약:');
  };

  // 줄바꿈 처리된 텍스트
  const displayText = useMemo(() => formatSentences(rawDisplayText), [rawDisplayText]);

  return (
    <div className="flex h-full animate-fadeIn gap-4">
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
      <div className="items-left flex w-full rounded-lg border border-border-color bg-modal-background-color p-[15px]">
        <h1 className="whitespace-pre-line leading-relaxed">
          <DecryptedText
            text={displayText}
            animateOn="view"
            speed={250}
            encryptedClassName="text-border-color"
            parentClassName="whitespace-pre-line"
          />
        </h1>
      </div>
    </div>
  );
};
