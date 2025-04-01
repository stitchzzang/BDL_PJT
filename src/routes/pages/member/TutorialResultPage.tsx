import { useNavigate } from 'react-router-dom';

import { useTutorialResults } from '@/api/tutorial.api';
import { StockTutorialResultItem } from '@/components/member-info/stock-tutorial-result-item';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
export const TutorialResultPage = () => {
  const { userData } = useAuthStore();
  const { data: tutorialResults } = useTutorialResults({
    memberId: userData.memberId?.toString() ?? '',
  });
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-4">
      <div className="flex w-full flex-row justify-between">
        <h1 className="text-2xl font-bold">주식 튜토리얼 결과</h1>
        <p className="text-text-inactive-2-color">{new Date().toISOString().split('T')[0]}</p>
      </div>
      <hr className="my-3 w-full border-t border-btn-primary-inactive-color" />
      {tutorialResults?.map((tutorialResult) => (
        <StockTutorialResultItem key={tutorialResult.tutorialResultId} result={tutorialResult} />
      ))}
      {tutorialResults?.length === 0 && (
        <div className="flex w-full flex-col items-center justify-center">
          <p className="text-text-inactive-2-color">튜토리얼 결과가 없습니다.</p>
          <Button variant="blue" className="mt-4" onClick={() => navigate('/tutorial')}>
            주식 튜토리얼 하러 가볼까요?
          </Button>
        </div>
      )}
    </div>
  );
};
