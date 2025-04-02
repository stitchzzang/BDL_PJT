import { NewsResponseWithThumbnail } from '@/api/types/tutorial';

export interface StockTutorialNewsDetailProps {
  news: NewsResponseWithThumbnail;
  companyId: number;
}

export const StockTutorialNewsDetail = ({ news }: StockTutorialNewsDetailProps) => {
  // 변동률에 따른 스타일 결정
  const changeStyle = news.changeRate >= 0 ? 'text-btn-red-color' : 'text-btn-blue-color';
  const changeSymbol = news.changeRate >= 0 ? '+' : '';

  // companyId 활용 (아래 주석 코드는 실제 API 호출 또는 추가 기능이 필요할 때 사용)
  // 참고: 현재는 UI에 표시하지 않고 있지만, 필요시 활용할 수 있음
  // const companyInfo = { id: companyId };

  return (
    <div className="rounded-xl bg-modal-background-color p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[23px] font-bold ">{news.newsTitle}</h2>
        <p className="text-[18px] text-border-color">
          {new Date(news.newsDate).toLocaleDateString('ko-KR')}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <span className="font-semibold text-border-color">변동률:</span>
        <span className={`font-semibold ${changeStyle}`}>
          {changeSymbol}
          {news.changeRate.toFixed(2)}%
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-5 md:flex-row">
        {news.newsThumbnailUrl ? (
          <div className="h-[200px] w-full overflow-hidden rounded-lg md:h-[240px] md:w-2/5">
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
          <p className="text-[18px] leading-relaxed text-white">{news.newsContent}</p>
        </div>
      </div>
    </div>
  );
};
