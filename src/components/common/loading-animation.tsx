import Lottie from 'lottie-react';

import loadingAnimation from '@/assets/lottie/loading-animation.json';

export const LoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center">
      <Lottie animationData={loadingAnimation} loop={true} />
    </div>
  );
};
