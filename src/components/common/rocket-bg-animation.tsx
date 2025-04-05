import Lottie from 'lottie-react';

import rocketBgAnimation from '@/assets/lottie/rocket-bg-animation.json';

export const RocketBgAnimation = ({ height, width }: { height?: number; width?: number }) => {
  return (
    <div className="flex items-center justify-center">
      <Lottie
        animationData={rocketBgAnimation}
        loop={true}
        style={{ height: height ?? 30, width: width ?? 30 }}
      />
    </div>
  );
};
