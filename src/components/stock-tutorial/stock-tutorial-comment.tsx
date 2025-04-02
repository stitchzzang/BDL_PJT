import Lottie from 'lottie-react';
import { useEffect } from 'react';

import robotMove from '@/assets/lottie/robot-animation.json';
import { DecryptedText } from '@/components/ui/decrypted-text';

interface StockTutorialCommentProps {
  comment: string;
}

export const StockTutorialComment = ({ comment }: StockTutorialCommentProps) => {
  // API에서 받아온 코멘트 디버깅
  useEffect(() => {
    console.log('StockTutorialComment 컴포넌트 - 전달받은 코멘트:', {
      received: comment,
      isEmpty: !comment || comment.trim() === '',
      length: comment?.length || 0,
    });
  }, [comment]);

  // 표시할 코멘트 결정 (API 코멘트가 있으면 사용, 없으면 기본 코멘트)
  const hasValidComment = comment && comment.trim() !== '';
  const displayText = hasValidComment
    ? comment
    : '여간 어려운 일이 아닐수가 없군요... 떨어지는 주식을 보면 마음이 아파요';

  // DecryptedText에 전달되는 텍스트 추적
  useEffect(() => {
    console.log('StockTutorialComment - 표시될 텍스트:', {
      text: displayText,
      isDefault: !hasValidComment,
    });
  }, [displayText, hasValidComment]);

  return (
    <div className="flex gap-4">
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
      <div className="flex w-full items-center rounded-lg border border-border-color bg-modal-background-color p-[10px]">
        <h1>
          <DecryptedText
            text={displayText}
            animateOn="view"
            speed={250}
            encryptedClassName="text-border-color"
          />
        </h1>
      </div>
    </div>
  );
};
