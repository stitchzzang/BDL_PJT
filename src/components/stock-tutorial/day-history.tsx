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
        scrollContainer.scrollTop += e.deltaY;
      }
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="h-full rounded-xl bg-modal-background-color p-5">
      <h1 className="mb-2 text-[20px] font-bold">뉴스 히스토리</h1>
      {news.length === 0 ? (
        <p className="text-border-color">각 변곡점 구간의 뉴스 리스트를 누적 제공해드립니다.</p>
      ) : (
        <div
          ref={scrollContainerRef}
          className="no-scrollbar h-[calc(100%-40px)] overflow-y-auto pr-2"
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
