import Lottie from 'lottie-react';

import ChartLoading from '@/assets/lottie/chart-animation.json';

export const ChartLoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <Lottie
        animationData={ChartLoading}
        loop={true}
        autoplay={true}
        style={{ height: 250, width: 250 }}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
        }}
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-[18px] font-medium">최신 데이터가 없습니다.</h1>
        <p className="text-[14px[ font-light text-border-color">
          한국 기준 09:00 - 15:10에 데이터가 최신화 됩니다.
        </p>
      </div>
    </div>
  );
};

export const WaitOrderLoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-0">
      <Lottie
        animationData={ChartLoading}
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
