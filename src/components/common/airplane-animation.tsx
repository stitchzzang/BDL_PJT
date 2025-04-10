import Lottie from 'lottie-react';

import airPlane from '@/assets/lottie/air-plane.json';

export const AirplaneAnimation = () => {
  return (
    <div className="flex items-center justify-center">
      <Lottie animationData={airPlane} loop={true} style={{ height: 180, width: 180 }} />
    </div>
  );
};
