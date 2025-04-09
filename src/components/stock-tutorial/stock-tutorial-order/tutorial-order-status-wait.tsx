import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export interface TutorialOrderStatusWaitProps {
  isActive: boolean;
  onWait: () => void;
  isLoading?: boolean;
}

export const TutorialOrderStatusWait = ({
  isActive,
  onWait,
  isLoading = false,
}: TutorialOrderStatusWaitProps) => {
  if (isLoading) {
    return (
      <div className="flex h-full animate-fadeIn flex-col">
        <div className="flex h-full flex-col justify-between">
          <div className="mb-3 flex w-full flex-col gap-3">
            <Skeleton
              className="h-[180px] w-full rounded-lg"
              style={{ backgroundColor: '#0D192B' }}
            />
          </div>
          <div className="mt-auto">
            <Skeleton
              className="h-[48px] w-full rounded-lg"
              style={{ backgroundColor: '#0D192B' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full animate-fadeIn flex-col">
      <div className="flex h-full flex-col justify-between">
        <div className="mb-3 flex w-full flex-col gap-3">
          <div className="rounded-lg bg-[#1A1D2D] p-3">
            <p className="mb-1 text-[16px] font-semibold text-white">관망은 무엇인가요?</p>
            <p className="mb-1 text-[14px] text-gray-300">
              • 매매 결정을 보류하고 시장 상황을 지켜보는 것
            </p>
            <br />
            <p className="mb-1 text-[16px] font-semibold text-yellow-400">주의사항</p>
            <p className="text-[14px] text-gray-300">
              • 관망을 선택하면 이번 턴에서 추가 매수/매도 불가능
              <br />• 한 턴당 한 번의 액션만 가능
            </p>
          </div>
        </div>
        <div className="mt-auto">
          <Button
            variant="green"
            className="w-full"
            size="lg"
            onClick={onWait}
            disabled={!isActive}
          >
            <p className="text-[16px] font-medium text-white">관망하기</p>
          </Button>
        </div>
      </div>
    </div>
  );
};
