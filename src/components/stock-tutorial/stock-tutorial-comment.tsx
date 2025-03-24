import Lottie from 'lottie-react';

import robotMove from '@/assets/lottie/robot-animation.json';

export const StockTutorialComment = () => {
  return (
    <div className="flex gap-4">
      <div>
        <Lottie
          animationData={robotMove}
          loop={true}
          autoplay={true}
          style={{ height: 70, width: 70 }}
          rendererSettings={{
            preserveAspectRatio: 'xMidYMid slice',
          }}
        />
      </div>
      <div className="flex w-full items-center rounded-lg border border-border-color bg-modal-background-color p-[10px]">
        <h1>hello</h1>
      </div>
    </div>
  );
};
