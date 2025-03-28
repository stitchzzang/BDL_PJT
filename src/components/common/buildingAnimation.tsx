import Lottie from 'lottie-react';

import buildingAnimation from '@/assets/lottie/build-anmation.json';

export const BuildingAnimation = () => {
  return (
    <div className="flex items-center justify-center">
      <Lottie animationData={buildingAnimation} loop={true} />
    </div>
  );
};
