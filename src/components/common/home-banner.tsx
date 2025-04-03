import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

import { SparklesCore } from '@/components/ui/sparkles';

export const HomeBanner = () => {
  const bdlText = '부자될랩(BDL)';

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-0 h-full w-full">
        <SparklesCore
          id="sparkles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleColor="#ffffff"
          particleDensity={70}
          className="h-full w-full"
        />
      </div>

      <div className="mx-auto flex h-[500px] w-full max-w-6xl flex-col items-center justify-center px-4 py-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="mb-6 text-center text-4xl font-bold text-white md:text-5xl lg:text-6xl "
        >
          <span className="text-primary-color">{bdlText}</span>에서
          <br className="w-full" />
          <p className="mt-2">당신의 투자 여정을 시작해보세요</p>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="mt-4 rounded-full border border-primary-color/30 bg-background-color/20 px-8 py-4 backdrop-blur-md"
        >
          <h3 className="text-lg font-semibold text-white md:text-xl">
            <span className="text-primary-color">모의 투자와 주식 튜토리얼</span>을 통해 더 가까운
            금융 지식
          </h3>
        </motion.div>

        <motion.div
          className="absolute bottom-8  flex -translate-x-1/2 flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{
            opacity: { delay: 1, duration: 1 },
            y: { delay: 1, duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <p className="mb-2 text-sm text-white/80">
            아래로 스크롤해서 차트와 뉴스를 확인해보세요!
          </p>
          <ChevronDown className="h-6 w-6 text-primary-color" />
        </motion.div>
      </div>
    </div>
  );
};
