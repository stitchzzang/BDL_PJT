import { Button } from '@/components/ui/button';

export interface TutorialOrderStatusWaitProps {
  isActive: boolean;
  onWait: () => void;
}

export const TutorialOrderStatusWait = ({ isActive, onWait }: TutorialOrderStatusWaitProps) => {
  const h3Style = 'text-[16px] font-bold text-btn-green-color';

  const handleWait = () => {
    if (isActive && onWait) {
      onWait();
    }
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      <h3 className={h3Style}>관망하기</h3>
      <div className="flex h-full flex-col justify-between">
        <div className="mb-3 flex flex-col gap-3">
          {/* 관망하기 설명 */}
          <div className="mb-2 rounded-lg bg-[#1A1D2D] p-4">
            <p className="mb-2 text-[16px] font-semibold text-white">관망은 무엇인가요?</p>
            <p className="text-[14px] text-gray-300">
              관망은 현재 턴에서 매매 결정을 보류하고 시장 상황을 지켜보는 것입니다.
              <br />
              관망을 선택하면 이번 턴에서는 매수/매도가 불가능하며, 다음 턴으로 넘어갑니다.
            </p>
          </div>

          {/* 주의사항 */}
          <div className="rounded-lg bg-[#2A2A3C] p-4">
            <p className="mb-2 text-[16px] font-semibold text-yellow-400">주의사항</p>
            <p className="text-[14px] text-gray-300">
              • 관망을 선택하면 이번 턴에서 추가 매수/매도가 불가능합니다.
              <br />• 한 턴당 한 번의 액션만 가능합니다.
            </p>
          </div>
        </div>

        <div className="mt-auto">
          <div className="mt-3">
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
    </div>
  );
};
