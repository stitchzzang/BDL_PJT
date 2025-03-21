import { useEffect, useState } from 'react';

import { Lanyard } from '@/components/ui/lanyard';
import { Progress } from '@/components/ui/progress';

export const PageLoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + 10;
      });
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background-color">
      <div className="flex flex-col items-center gap-8">
        <Lanyard />
        <div className="flex w-[400px] flex-col gap-2">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-sm text-border-color">로딩중입니다...</p>
        </div>
      </div>
    </div>
  );
};
