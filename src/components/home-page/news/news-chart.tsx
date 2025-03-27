import { useLatestNews } from '@/api/home.api';
import { ErrorScreen } from '@/components/common/error-screen';
import { LoadingAnimation } from '@/components/common/loading-animation';
import { NewsChartMain } from '@/components/home-page/news/news-chart-main';
import { NewsChartSub } from '@/components/home-page/news/news-chart-sub';

export const NewsChart = () => {
  const { data: latestNews, isLoading, isError } = useLatestNews();
  return (
    <div className="flex items-center justify-center">
      {isLoading ? (
        <div>
          <LoadingAnimation />
        </div>
      ) : isError ? (
        <div>
          <ErrorScreen />
        </div>
      ) : (
        <div>
          <div className="flex flex-col gap-3">
            {latestNews && latestNews.length > 0 ? (
              <>
                <div className="mb-[12px] inline-block rounded-xl bg-modal-background-color px-[12px] py-[8px]">
                  <div className="rounded-xl bg-btn-blue-color bg-opacity-40 p-[12px]">
                    <h3 className="text-[16px]">현재뉴스</h3>
                  </div>
                </div>
                <NewsChartMain newsMainInfo={latestNews[0]} />
                <NewsChartSub newsSubInfo={latestNews[1]} />
              </>
            ) : (
              <div className="p-5 text-center text-text-inactive-2-color">
                뉴스 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
