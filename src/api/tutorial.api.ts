import { useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';
import { TutorialResultResponse } from '@/api/types/tutorial';

// 튜토리얼 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)
export const tutorialApi = {
  getTutorialResults: ({ memberId }: { memberId: string }) =>
    _ky.get<ApiResponse<TutorialResultResponse>>(`tutorial/result/${memberId}`).json(),
};

export const useTutorialResults = ({ memberId }: { memberId: string }) => {
  return useQuery({
    queryKey: ['tutorialResults', memberId],
    queryFn: () => tutorialApi.getTutorialResults({ memberId }).then((res) => res.result),
  });
};
