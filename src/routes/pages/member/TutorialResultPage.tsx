import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useTutorialResults } from '@/api/tutorial.api';
import { ErrorScreen } from '@/components/common/error-screen';
import { RocketAnimation } from '@/components/common/rocket-animation';
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
    refetch,
  } = useTutorialResults({
    memberId: userData.memberId?.toString() ?? '',
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  // 페이지 로드 시 튜토리얼에서 전달된 상태가 있는지 확인
  useEffect(() => {
    // location.state에서 튜토리얼 데이터 확인
    const fromTutorial = location.state?.fromTutorial;

    if (fromTutorial) {
      // 최신 결과를 가져오기 위해 데이터 리프레시
      refetch().then(() => {
        // 데이터 로드 후 가장 최근 결과가 있으면 해당 ID를 저장
        if (tutorialResults && tutorialResults.length > 0) {
          // 일반적으로 배열의 첫 번째 항목이 가장 최근 결과
          setHighlightedId(tutorialResults[0].tutorialResultId);

          // 스크롤을 최상단으로 이동
          window.scrollTo(0, 0);
        }
      });
    }
  }, [location.state, refetch, tutorialResults]);

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
            <div
              key={tutorialResult.tutorialResultId}
              className={`w-full ${
                tutorialResult.tutorialResultId === highlightedId
                  ? 'animate-pulse border-2 border-blue-500 bg-blue-900/20 transition-all duration-300'
                  : ''
              }`}
            >
              <StockTutorialResultItem result={tutorialResult} />
            </div>
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
                  <div className="flex flex-row items-center gap-1">
                    <RocketAnimation />
                    <p>주식 튜토리얼을 하러 가볼까요?</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
    </div>
  );
};
