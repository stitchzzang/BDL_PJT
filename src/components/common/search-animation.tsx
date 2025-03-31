import Lottie from 'lottie-react';

import searchAnimation from '@/assets/lottie/search-animation.json';

export const SearchAnimation = () => {
  return (
    <div className="flex items-center justify-center">
      <Lottie animationData={searchAnimation} loop={true} style={{ height: 100, width: 100 }} />
    </div>
  );
};
