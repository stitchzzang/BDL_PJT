import React from 'react';

import { NewsResponse } from '@/api/types/tutorial';
import { DayHistoryCard } from '@/components/stock-tutorial/day-history-card';

export interface DayHistoryProps {
  news: NewsResponse[];
}

export const DayHistory = ({ news }: DayHistoryProps) => {
  return (
    <div className="h-full rounded-xl bg-modal-background-color p-[20px]">
      <div className="mb-[15px] flex items-center gap-3">
        <h1 className="text-[18px] font-bold">뉴스 히스토리</h1>
      </div>
      <div className="w-full h-[calc(100%-60px)]">
        {news.length === 0 ? (
          <p className="text-border-color">각 변곡점 구간의 뉴스 리스트를 누적 제공해드립니다.</p>
        ) : (
          <div className="flex flex-col w-full gap-4 overflow-y-auto max-h-full pr-2">
            {news.map((newsItem, index) => (
              <div key={`${newsItem.newsId}-${index}`}>
                <DayHistoryCard newsItem={newsItem} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
