import Lottie from 'lottie-react';

import SkeletonAnimation from '@/assets/lottie/skeleton-animation.json';

export const SkeletonLoadingAnimation = () => {
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
        <h1 className="text-[18px] font-medium text-border-color">대기 주문이 비어있습니다.</h1>
      </div>
    </div>
  );
};
