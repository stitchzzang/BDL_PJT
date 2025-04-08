import { NewsResponseWithThumbnail } from '@/api/types/tutorial';
import { Skeleton } from '@/components/ui/skeleton';

export interface StockTutorialNewsDetailProps {
  news: NewsResponseWithThumbnail;
  companyId: number;
  isLoading?: boolean;
}

export const StockTutorialNewsDetail = ({
  news,
  isLoading = false,
}: StockTutorialNewsDetailProps) => {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-modal-background-color py-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-2/3" style={{ backgroundColor: '#0D192B' }} />
          <Skeleton className="h-6 w-[100px]" style={{ backgroundColor: '#0D192B' }} />
        </div>

        <div className="mt-4 flex flex-col gap-5 md:flex-row">
          <Skeleton
            className="h-[100px] w-[100px] md:h-[240px] md:w-2/5"
            style={{ backgroundColor: '#0D192B' }}
          />
          <div className="mt-4 w-full md:mt-0 md:w-3/5">
            <Skeleton className="h-6 w-full" style={{ backgroundColor: '#0D192B' }} />
            <Skeleton className="mt-2 h-6 w-full" style={{ backgroundColor: '#0D192B' }} />
            <Skeleton className="mt-2 h-6 w-full" style={{ backgroundColor: '#0D192B' }} />
            <Skeleton className="mt-2 h-6 w-2/3" style={{ backgroundColor: '#0D192B' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-modal-background-color py-2">
      <div className="flex flex-col">
        <h2 className="line-clamp-1 text-[21px] font-bold">{news.newsTitle}</h2>
        <p className="ml-2 mt-1 text-[16px] text-border-color">
          {new Date(news.newsDate)
            .toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
            .replace('일', '일')
            .replace('월', '월')
            .replace('년', '년')}
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-5 md:flex-row">
        {news.newsThumbnailUrl ? (
          <div className="object-fit:cover h-[100px] w-[100px] overflow-hidden rounded-lg md:h-[240px] md:w-2/5">
            <img
              src={news.newsThumbnailUrl}
              alt={news.newsTitle}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-[200px] w-full items-center justify-center rounded-lg bg-background-color md:h-[240px] md:w-2/5">
            <p className="text-center text-border-color">이미지 없음</p>
          </div>
        )}

        <div className="mt-4 w-full md:mt-0 md:w-3/5">
          <p className="text-[17px] leading-relaxed text-white">{news.newsContent}</p>
        </div>
      </div>
    </div>
  );
};
