'use client';

import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { NewsResponseWithThumbnail } from '@/api/types/tutorial';
import { StockTutorialNewsDetail } from '@/components/stock-tutorial/stock-tutorial-news-detail';
import { SparklesCore } from '@/components/ui/sparkles';

export interface TutorialNewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  news: NewsResponseWithThumbnail | null;
  companyId: number;
  currentTurn?: number;
}

export const TutorialNewsModal = ({
  isOpen,
  onClose,
  news,
  companyId,
  currentTurn = 1,
}: TutorialNewsModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // 외부 클릭 시 모달 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // 모달이 열려있을 때만 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백그라운드 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* 모달 컨테이너 */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
              className="group relative flex w-full max-w-3xl items-center justify-center transition-all duration-500 ease-in-out hover:-translate-y-4"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* 레이어드 카드 디자인 (after) - 가장 뒤 레이어 */}
              <div
                className="absolute h-[80%] w-[80%] origin-bottom rounded-xl bg-[#e7ecff] transition-all duration-500 ease-in-out"
                style={{
                  zIndex: 0,
                  top: isHovered ? '0' : '-8%',
                  left: '50%',
                  transform: `translateX(-50%) ${isHovered ? 'rotate(8deg)' : 'rotate(0deg)'}`,
                  width: isHovered ? '100%' : '80%',
                  height: isHovered ? '100%' : '80%',
                }}
              />

              {/* 레이어드 카드 디자인 (before) - 중간 레이어 */}
              <div
                className="absolute h-[90%] w-[90%] origin-bottom rounded-xl bg-[#ced8ff] transition-all duration-500 ease-in-out"
                style={{
                  zIndex: 10,
                  top: isHovered ? '0' : '-4%',
                  left: '50%',
                  transform: `translateX(-50%) ${isHovered ? 'rotate(-8deg)' : 'rotate(0deg)'}`,
                  width: isHovered ? '100%' : '90%',
                  height: isHovered ? '100%' : '90%',
                }}
              />

              {/* 퍼지는 그라데이션 효과를 위한 배경 레이어 */}
              <div
                className="absolute rounded-xl bg-transparent transition-all duration-500 ease-in-out"
                style={{
                  zIndex: 15,
                  width: '100%',
                  height: '100%',
                  boxShadow: isHovered
                    ? '0 0 15px 2px rgba(206, 216, 255, 0.7), 0 0 30px 5px rgba(10, 60, 255, 0.5), 0 0 45px 10px rgba(64, 43, 226, 0.2)'
                    : '0 0 10px 1px rgba(206, 216, 255, 0.5), 0 0 20px 2px rgba(10, 60, 255, 0.3)',
                  opacity: isHovered ? 1 : 0.7,
                }}
              />

              {/* 메인 카드 콘텐츠 - 회전하지 않음 */}
              <div
                className="relative z-20 flex w-full flex-col overflow-hidden rounded-xl bg-[#121729] p-6 shadow-lg transition-all duration-500 ease-in-out"
                style={{
                  position: 'relative',
                  // 테두리 효과를 위한 가상의 그라데이션 border
                  boxShadow: isHovered
                    ? '0 0 0 1px rgba(206, 216, 255, 0.5), 0 0 0 2px rgba(10, 60, 255, 0.3), 0 0 0 3px rgba(64, 43, 226, 0.2)'
                    : '0 0 0 1px rgba(206, 216, 255, 0.3)',
                }}
              >
                {/* 스파클 애니메이션 배경 */}
                <div className="absolute inset-0 h-full w-full">
                  <SparklesCore
                    id="tutorial-sparkles"
                    background="transparent"
                    minSize={1}
                    maxSize={2}
                    particleColor="#ffffff"
                    particleDensity={40}
                    className="h-full w-full"
                  />
                </div>

                {/* 모달 내용 */}
                <div className="relative z-10 flex flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-white">{currentTurn}단계 교육용 뉴스</h1>
                    <button
                      onClick={onClose}
                      className="rounded-full p-1 text-border-color transition-colors hover:bg-gray-700/50 hover:text-white"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {/* 뉴스 내용 */}
                  <div className="relative z-10">
                    {news ? (
                      <StockTutorialNewsDetail news={news} companyId={companyId} />
                    ) : (
                      <div className="flex h-[200px] flex-col items-center justify-center">
                        <p className="text-lg font-medium text-border-color">
                          {currentTurn}단계에는 교육용 뉴스가 없습니다.
                        </p>
                        <p className="mt-2 text-sm text-border-color">
                          튜토리얼을 계속 진행하여 다음 단계를 확인해보세요.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
