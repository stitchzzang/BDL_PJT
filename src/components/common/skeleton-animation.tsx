import Lottie from 'lottie-react';

import SkeletonAnimation from '@/assets/lottie/skeleton-animation.json';

interface SkeletonLoadingAnimationProps {
  subText: string;
}

export const SkeletonLoadingAnimation = ({ subText }: SkeletonLoadingAnimationProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-0">
      <Lottie
        animationData={SkeletonAnimation}
        loop={true}
        autoplay={true}
        style={{ height: 250, width: 250 }}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
        }}
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-[18px] font-medium text-border-color">{subText}</h1>
      </div>
    </div>
  );
};
