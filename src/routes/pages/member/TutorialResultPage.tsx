import { useEffect, useRef, useState } from 'react';
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
  const memberId = userData.memberId?.toString() ?? '';
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const initialLoadDone = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const fromTutorial = location.state?.fromTutorial;

  const {
    data: tutorialResults,
    isLoading,
    isError,
    refetch,
  } = useTutorialResults({
    memberId,
  });

  // 튜토리얼에서 넘어왔을 때 결과를 즉시 로드
  useEffect(() => {
    if (fromTutorial && !initialLoadDone.current) {
      initialLoadDone.current = true;

      const loadResults = async () => {
        try {
          // 데이터 리프레시 (결과가 최신 상태인지 확인)
          await refetch();

          // 데이터가 로드된 후 처리
          if (tutorialResults && tutorialResults.length > 0) {
            // 가장 최근 결과 하이라이트 (일반적으로 첫 번째 항목)
            setHighlightedId(tutorialResults[0].tutorialResultId);

            // 하이라이트 효과는 3초 후에 제거
            setTimeout(() => {
              setHighlightedId(null);
            }, 3000);
          }
        } catch (error) {
          console.error('Failed to load tutorial results:', error);
        }
      };

      // 약간의 지연 후 결과 로드 (페이지 전환 후 데이터가 준비되도록)
      setTimeout(loadResults, 300);
    }
  }, [fromTutorial, refetch, tutorialResults]);

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
      ) : tutorialResults && tutorialResults.length > 0 ? (
        <>
          {tutorialResults.map((tutorialResult) => (
            <div
              key={tutorialResult.tutorialResultId}
              id={`tutorial-result-${tutorialResult.tutorialResultId}`}
              className="mb-3 w-full"
            >
              <StockTutorialResultItem
                result={tutorialResult}
                isHighlighted={tutorialResult.tutorialResultId === highlightedId}
              />
            </div>
          ))}
        </>
      ) : (
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
