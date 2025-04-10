import { NewsResponseWithThumbnail } from '@/api/types/tutorial';
import { StockTutorialNewsDetail } from '@/components/stock-tutorial/stock-tutorial-news-detail';
import { SparklesCore } from '@/components/ui/sparkles';
import { Skeleton } from '@/components/ui/skeleton';

export interface StockTutorialNewsProps {
  currentNews: NewsResponseWithThumbnail | null;
  companyId: number;
  currentTurn?: number;
  isLoading?: boolean;
}

export const StockTutorialNews = ({
  currentNews,
  companyId,
  currentTurn,
  isLoading = false,
}: StockTutorialNewsProps) => {
  // 로딩 중이거나 4단계에서 뉴스가 없는 경우에도 로딩 스피너 표시
  if (isLoading || (currentTurn === 4 && !currentNews)) {
    return (
      <div className="h-full">
        <div className="h-full rounded-xl bg-modal-background-color p-5">
          <Skeleton className="mb-[15px] h-7 w-[140px]" style={{ backgroundColor: '#0D192B' }} />
          <Skeleton className="mb-[20px] h-6 w-full" style={{ backgroundColor: '#0D192B' }} />
          <div className="mt-4 flex flex-col gap-5 md:flex-row">
            <Skeleton
              className="h-[240px] w-full md:w-2/5"
              style={{ backgroundColor: '#0D192B' }}
            />
            <div className="mt-4 w-full md:mt-0 md:w-3/5">
              <Skeleton className="h-[20px] w-full" style={{ backgroundColor: '#0D192B' }} />
              <Skeleton className="mt-2 h-[20px] w-full" style={{ backgroundColor: '#0D192B' }} />
              <Skeleton className="mt-2 h-[20px] w-full" style={{ backgroundColor: '#0D192B' }} />
              <Skeleton className="mt-2 h-[20px] w-3/4" style={{ backgroundColor: '#0D192B' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4단계에서의 특별 메시지 표시 제거 (로딩 스피너로 대체)

  // 뉴스가 없는 경우 (4턴이 아닌 경우)
  if (!currentNews) {
    return (
      <div className="h-full">
        <div className="flex h-full flex-col justify-center rounded-xl bg-modal-background-color p-[20px]">
          <h1 className="mb-[15px] text-[20px] font-bold">교육용 뉴스</h1>
          <p className="text-border-color">
            세 개의 변곡점마다 중요한 교육용 뉴스가 이 곳에 표시됩니다.
            <br />
            튜토리얼을 진행하시면 뉴스를 볼 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // 뉴스가 있는 경우
  return (
    <div className="h-full">
      <div className="h-full rounded-xl bg-modal-background-color p-5">
        <h1 className="mb-[15px] text-[20px] font-bold">교육용 뉴스</h1>
        <StockTutorialNewsDetail news={currentNews} companyId={companyId} />
      </div>
    </div>
  );
};
