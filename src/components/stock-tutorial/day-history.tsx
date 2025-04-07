import Lottie from 'lottie-react';
import React, { useEffect, useRef, useState } from 'react';

import { NewsResponse } from '@/api/types/tutorial';
import historyAnimation from '@/assets/lottie/history-animation.json';
import { DayHistoryCard } from '@/components/stock-tutorial/day-history-card';

export interface DayHistoryProps {
  news: NewsResponse[];
  height?: number; // AI 코멘트 높이와 동기화하기 위한 prop
  isTutorialStarted?: boolean; // 튜토리얼 시작 여부 프로퍼티 추가
}

export const DayHistory = ({ news, height, isTutorialStarted = false }: DayHistoryProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [prevNewsLength, setPrevNewsLength] = useState(0);
  // 뉴스 카드 3개 정도 표시할 수 있는 기본 높이 (카드 하나당 약 90px + 간격 + 패딩 고려)
  const MIN_HEIGHT = 320;

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        scrollContainer.scrollTop += e.deltaY;
      }
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // 새로운 뉴스가 추가되면 스크롤을 맨 위로 이동
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // 뉴스 항목이 새로 추가된 경우에만 스크롤 맨 위로 이동
    if (news.length > prevNewsLength) {
      scrollContainer.scrollTop = 0;
      setPrevNewsLength(news.length);
    }
  }, [news, prevNewsLength]);

  // AI 코멘트 높이와 최소 높이 중 더 큰 값을 사용
  const finalHeight = height && height > MIN_HEIGHT ? height : MIN_HEIGHT;

  return (
    <div
      className="flex w-full flex-col rounded-xl bg-modal-background-color p-5"
      style={{ height: `${finalHeight}px` }} // 최소 높이 또는 AI 코멘트 높이 중 큰 값 사용
    >
      <div className="mb-2 flex items-center">
        <div className="mr-2 h-8 w-8">
          <Lottie animationData={historyAnimation} loop={true} />
        </div>
        <h1 className="text-[20px] font-bold">뉴스 히스토리</h1>
      </div>
      {!isTutorialStarted ? (
        <p className="text-[16px] text-border-color">
          각 변곡점 구간의 뉴스 리스트를 누적 제공해드립니다.
        </p>
      ) : news.length === 0 ? (
        <p className="text-[16px] text-border-color">
          이 구간에서는 눈에 띄는 뉴스 데이터가 없네요😂. 교육용 뉴스를 참고해주세요!
        </p>
      ) : (
        <div
          ref={scrollContainerRef}
          className="no-scrollbar flex-1 overflow-y-auto pr-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="flex flex-col gap-4">
            {news.map((newsItem, index) => (
              <div key={`${newsItem.newsId}-${index}`}>
                <DayHistoryCard newsItem={newsItem} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
