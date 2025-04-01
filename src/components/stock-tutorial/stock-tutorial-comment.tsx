import Lottie from 'lottie-react';

import robotMove from '@/assets/lottie/robot-animation.json';
import { DecryptedText } from '@/components/ui/decrypted-text';

interface StockTutorialCommentProps {
  comment: string;
}

export const StockTutorialComment = ({ comment }: StockTutorialCommentProps) => {
  // API에서 받아온 코멘트가 없을 경우 기본 텍스트 사용
  const displayText =
    comment || '여간 어려운 일이 아닐수가 없군요... 떨어지는 주식을 보면 마음이 아파요';

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
