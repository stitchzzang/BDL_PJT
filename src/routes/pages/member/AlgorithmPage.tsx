import { useNavigate } from 'react-router-dom';

import { useGetAlgorithm } from '@/api/algorithm.api';
import { Algorithm } from '@/api/types/algorithm';
import { ErrorScreen } from '@/components/common/error-screen';
import { MyAlgorithmItem } from '@/components/member-info/my-algorithm-item';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/store/useAuthStore';
export const AlgorithmPage = () => {
  const { userData } = useAuthStore();
  const {
    data: algorithms,
    isLoading,
    isError,
  } = useGetAlgorithm(userData.memberId?.toString() ?? '');
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col items-center gap-4">
      <div className="w-full">
        <h1 className="text-2xl font-bold">알고리즘</h1>
        <hr className="my-3 w-full border-t border-btn-primary-inactive-color" />
        {isError ? (
          <ErrorScreen />
        ) : isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full p-5" />
            ))}
          </div>
        ) : (
          <>
            {algorithms && algorithms.length > 0 ? (
              <div className="flex flex-col gap-4">
                {algorithms.map((algorithm: Algorithm) => (
                  <MyAlgorithmItem key={algorithm.algorithmId} algorithm={algorithm} />
                ))}
              </div>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-5">
                <div className="flex h-full w-full items-center justify-center rounded-[20px] border border-btn-primary-inactive-color bg-modal-background-color p-5">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p
                          className="cursor-pointer text-center text-lg text-[#718096] underline"
                          onClick={() => navigate('/algorithm-lab')}
                        >
                          알고리즘이 없습니다.
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>알고리즘을 만들러 가볼까요?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
