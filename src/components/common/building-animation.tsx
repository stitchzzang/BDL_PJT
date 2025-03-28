import Lottie from 'lottie-react';

import buildingAnimation from '@/assets/lottie/build-animation.json';

export const BuildingAnimation = () => {
  return (
    <div className="flex items-center justify-center">
      <Lottie animationData={buildingAnimation} loop={true} style={{ height: 100, width: 100 }} />
    </div>
  );
};
