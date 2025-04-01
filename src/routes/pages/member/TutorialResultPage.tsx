import { useGetTutorialResults } from '@/api/tutorial.api';
import { TutorialResultResponse } from '@/api/types/tutorial';
import { StockTutorialResultItem } from '@/components/member-info/stock-tutorial-result-item';

export const TutorialResultPage = () => {
  const { data: tutorialResults } = useGetTutorialResults(1);

  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-4">
      <div className="flex w-full flex-row justify-between">
        <h1 className="text-2xl font-bold">주식 튜토리얼 결과</h1>
        <p className="text-text-inactive-2-color">{new Date().toISOString().split('T')[0]}</p>
      </div>
      <hr className="my-3 w-full border-t border-btn-primary-inactive-color" />
      {tutorialResults?.TutorialResultResponse?.map((tutorialResult: TutorialResultResponse) => (
        <StockTutorialResultItem key={tutorialResult.tutorialResultId} result={tutorialResult} />
      ))}
    </div>
  );
};
