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
