import { useNavigate } from 'react-router-dom';

import { useTutorialResults } from '@/api/tutorial.api';
import { ErrorScreen } from '@/components/common/error-screen';
import { StockTutorialResultItem } from '@/components/member-info/stock-tutorial-result-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/store/useAuthStore';
export const TutorialResultPage = () => {
  const { userData } = useAuthStore();
  const {
    data: tutorialResults,
    isLoading,
    isError,
  } = useTutorialResults({
    memberId: userData.memberId?.toString() ?? '',
  });
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center">
      <div className="flex w-full flex-row justify-between">
        <h1 className="text-2xl font-bold">주식 튜토리얼 결과</h1>
        <p className="text-text-inactive-2-color">{new Date().toISOString().split('T')[0]}</p>
      </div>
      <hr className="my-3 w-full border-t border-btn-primary-inactive-color" />
      {isError ? (
        <ErrorScreen />
      ) : isLoading ? (
        <div className="flex w-full flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full p-5" />
          ))}
        </div>
      ) : (
        <>
          {tutorialResults?.map((tutorialResult) => (
            <StockTutorialResultItem
              key={tutorialResult.tutorialResultId}
              result={tutorialResult}
            />
          ))}
        </>
      )}
      {tutorialResults?.length === 0 && (
        <div className="flex w-full flex-col items-center justify-center p-5">
          <div className="flex h-full w-full items-center justify-center rounded-[20px] border border-btn-primary-inactive-color bg-modal-background-color p-5">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p
                    className="cursor-pointer text-center text-lg text-[#718096] underline"
                    onClick={() => navigate('/tutorial')}
                  >
                    튜토리얼 결과가 없습니다.
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>주식 튜토리얼을 하러 가볼까요?</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </div>
  );
};
