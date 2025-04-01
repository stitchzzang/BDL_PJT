import Lottie from 'lottie-react';

import rocketAnimation from '@/assets/lottie/rocket-animation.json';

export const RocketAnimation = () => {
  return (
    <div className="flex items-center justify-center">
      <Lottie animationData={rocketAnimation} loop={true} style={{ height: 30, width: 30 }} />
    </div>
  );
};
