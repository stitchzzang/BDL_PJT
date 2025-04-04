import { NewsResponse } from '@/api/types/tutorial';
import { DayHistoryCard } from '@/components/stock-tutorial/day-history-card';
import React, { useRef, useEffect } from 'react';

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

  if (news.length === 0) {
    return <p className="text-border-color">표시할 뉴스가 없습니다.</p>;
  }

  return (
    <div className="w-full">
      <div
        ref={scrollContainerRef}
        className="flex w-full gap-4 overflow-x-scroll pb-4 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {news.map((newsItem, index) => (
          <div key={`${newsItem.newsId}-${index}`} className="flex-shrink-0">
            <DayHistoryCard newsItem={newsItem} />
          </div>
        ))}
      </div>
    </div>
  );
};
