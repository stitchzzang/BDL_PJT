import Lottie from 'lottie-react';

import tutorialAnimation from '@/assets/lottie/tutorial-animation.json';

export const TutorialAnimation = () => {
  return (
    <div className="flex items-center justify-center">
      <Lottie
        animationData={tutorialAnimation}
        loop={true}
        autoplay={true}
        style={{ height: 100, width: 100 }}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
        }}
      />
    </div>
  );
};
