import { useLatestNews } from '@/api/home.api';
import { NewsChartMain } from '@/components/home-page/news/news-chart-main';
import { NewsChartSub } from '@/components/home-page/news/news-chart-sub';

export const NewsChart = () => {
  const { data: latestNews } = useLatestNews();
  return (
    <div>
      <div className="mb-[12px] inline-block rounded-xl bg-modal-background-color px-[12px] py-[8px]">
        <div className="rounded-xl bg-btn-blue-color bg-opacity-40 p-[12px]">
          <h3 className="text-[16px]">현재뉴스</h3>
        </div>
      </div>
      <div>
        <div className="mb-[10px]">
          <NewsChartMain newsMainInfo={latestNews?.[0]} />
        </div>
        <div>
          <NewsChartSub newsSubInfo={latestNews?.[1]} />
        </div>
      </div>
    </div>
  );
};
