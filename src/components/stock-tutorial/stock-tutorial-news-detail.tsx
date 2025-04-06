import { NewsResponseWithThumbnail } from '@/api/types/tutorial';

export interface StockTutorialNewsDetailProps {
  news: NewsResponseWithThumbnail;
  companyId: number;
}

export const StockTutorialNewsDetail = ({ news }: StockTutorialNewsDetailProps) => {
  return (
    <div className="rounded-xl bg-modal-background-color py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[24px] font-bold ">{news.newsTitle}</h2>
        <p className="text-[16px] text-border-color">
          {new Date(news.newsDate).toLocaleDateString('ko-KR')}
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
