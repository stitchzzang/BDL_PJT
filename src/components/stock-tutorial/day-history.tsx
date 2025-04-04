import React, { useEffect, useRef } from 'react';

import { NewsResponse } from '@/api/types/tutorial';
import { DayHistoryCard } from '@/components/stock-tutorial/day-history-card';

export interface DayHistoryProps {
  news: NewsResponse[];
}

export const DayHistory = ({ news }: DayHistoryProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="h-full rounded-xl bg-modal-background-color p-[20px]">
      <div className="mb-[15px] flex items-center gap-3">
        <h1 className="text-[18px] font-bold">뉴스 히스토리</h1>
      </div>
      <div className="w-full">
        {news.length === 0 ? (
          <p className="text-border-color">각 변곡점 구간의 뉴스 리스트를 누적 제공해드립니다.</p>
        ) : (
          <div
            ref={scrollContainerRef}
            className="no-scrollbar flex w-full gap-4 overflow-x-scroll pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {news.map((newsItem, index) => (
              <div key={`${newsItem.newsId}-${index}`} className="flex-shrink-0">
                <DayHistoryCard newsItem={newsItem} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
