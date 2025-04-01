import { useMutation, useQuery } from '@tanstack/react-query';

import { _ky, _kyAuth } from '@/api/instance';
import {
  ApiResponse,
  AssetResponse,
  CurrentNewsRequest,
  InitSessionRequest,
  NewsRangeRequest,
  NewsResponse,
  NewsResponseWithThumbnail,
  Point,
  SaveTutorialResultRequest,
  TutorialResultResponse,
  TutorialStockResponse,
  UserActionRequest,
} from '@/api/types/tutorial';

/**
 * 세션 초기화 API
 */
export const useInitSession = () => {
  return useMutation({
    mutationFn: async (data: InitSessionRequest) => {
      const response = await _kyAuth.post('tutorial/init', { json: data });
      return response.json() as Promise<ApiResponse<Record<string, never>>>;
    },
  });
};

/**
 * 변곡점 탐색 API (프론트에서 직접 호출 불필요)
 */
export const useDetectPoints = () => {
  return useMutation({
    mutationFn: async (companyId: number) => {
      const response = await _ky.post(`tutorial/points/detect?companyId=${companyId}`);
      return response.json() as Promise<ApiResponse<Record<string, never>>>;
    },
  });
};

/**
 * 변곡점 TOP3 조회 API
 */
export const useGetTop3Points = (companyId: number) => {
  return useQuery({
    queryKey: ['tutorial', 'points', 'top3', companyId],
    queryFn: async () => {
      try {
        const response = await _ky.get(`tutorial/points/top3?companyId=${companyId}`);
        const responseData = (await response.json()) as ApiResponse<{
          PointResponseList: Point[];
        }>;

        // 응답 로그 추가
        console.log('[API] useGetTop3Points 응답:', responseData);

        // 결과 유효성 검증
        if (!responseData.isSuccess) {
          console.error('[API] useGetTop3Points 응답 실패:', responseData.message);
          throw new Error(`API 응답 실패: ${responseData.message}`);
        }

        if (!responseData.result) {
          console.error('[API] useGetTop3Points result가 없음');
          throw new Error('API 응답에 result가 없습니다');
        }

        // 응답 구조 확인
        if (!responseData.result.PointResponseList) {
          console.error('[API] useGetTop3Points PointResponseList가 없음:', responseData.result);

          // 서버에서 다른 형태로 응답하는 경우를 처리 (result가 직접 배열인 경우)
          if (Array.isArray(responseData.result)) {
            console.log(
              '[API] result가 직접 배열로 응답됨, 변환 처리:',
              responseData.result.length,
            );
            // 결과를 예상 형식으로 변환
            return {
              ...responseData,
              result: {
                PointResponseList: responseData.result as unknown as Point[],
              },
            };
          }

          throw new Error('API 응답에 PointResponseList가 없습니다');
        }

        // 배열 확인
        if (!Array.isArray(responseData.result.PointResponseList)) {
          console.error(
            '[API] PointResponseList가 배열이 아님:',
            typeof responseData.result.PointResponseList,
          );
          throw new Error('PointResponseList가 배열이 아닙니다');
        }

        return responseData;
      } catch (error) {
        console.error('[API] useGetTop3Points 예외 발생:', error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * 변곡점 날짜 조회 API
 *
 * @param stockCandleId 일봉 ID
 */
export const useGetPointDate = (stockCandleId: number) => {
  return useQuery({
    queryKey: ['tutorial', 'points', 'date', stockCandleId],
    queryFn: async () => {
      if (!stockCandleId) {
        throw new Error('유효하지 않은 파라미터입니다.');
      }
      const response = await _ky.get(`tutorial/points/date?stockCandleId=${stockCandleId}`);
      return response.json() as Promise<ApiResponse<string>>;
    },
    enabled: !!stockCandleId && stockCandleId > 0,
    retry: 3,
  });
};

/**
 * 튜토리얼 일봉 데이터 조회 API
 *
 * @param companyId 회사 ID
 * @param startDate 시작 날짜 (YYMMDD)
 * @param endDate 종료 날짜 (YYMMDD)
 */
export const useGetTutorialStockData = (companyId: number, startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ['tutorial', 'stocks', companyId, startDate, endDate],
    queryFn: async () => {
      if (!companyId || !startDate || !endDate) {
        throw new Error('유효하지 않은 파라미터입니다.');
      }

      const apiUrl = `stocks/${companyId}/tutorial?startDate=${startDate}&endDate=${endDate}`;

      const response = await _ky.get(apiUrl);
      return response.json() as Promise<ApiResponse<TutorialStockResponse>>;
    },
    enabled: !!companyId && !!startDate && !!endDate,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 60 * 1000,
  });
};

/**
 * 구간별 튜토리얼 일봉 데이터 조회 API
 * 시작점~변곡점1, 변곡점1~변곡점2, 변곡점2~변곡점3, 변곡점3~최근점 등의 구간 데이터를 조회
 *
 * @param companyId 회사 ID
 * @param sectionNumber 구간 번호 (0: 시작점~변곡점1, 1: 변곡점1~변곡점2, 2: 변곡점2~변곡점3, 3: 변곡점3~최근점)
 * @param inflectionPoints 변곡점 배열 (상위 3개 변곡점)
 * @param startDate 전체 기간 시작 날짜 (YYMMDD)
 * @param endDate 전체 기간 종료 날짜 (YYMMDD)
 */
export const useGetSectionTutorialStockData = (
  companyId: number,
  sectionNumber: number,
  inflectionPoints: Point[],
  startDate: string,
  endDate: string,
) => {
  // 구간의 시작과 끝 날짜 계산
  const getStartAndEndDate = () => {
    // 전체 기간 날짜가 설정되지 않은 경우
    if (!startDate || !endDate) {
      return null;
    }

    // 변곡점이 없거나 충분하지 않은 경우
    if (!inflectionPoints || inflectionPoints.length === 0) {
      return { startDate, endDate };
    }

    // 변곡점 날짜 가져오기 필요 (API 호출 필요)
    // 실제 구현에서는 inflectionPoints의 stockCandleId를 이용해
    // useGetPointDate API를 호출하여 각 변곡점의 날짜를 가져와야 함

    // 여기서는 임시로 날짜를 계산 (실제 구현 필요)
    const getDateForPoint = (index: number) => {
      if (index < 0 || index >= inflectionPoints.length) {
        return index < 0 ? startDate : endDate;
      }

      // 실제로는 API를 통해 날짜를 가져와야 함
      // 현재는 임시 구현: 전체 기간을 4등분하여 날짜 배치
      const startTime = new Date(
        `20${startDate.slice(0, 2)}-${startDate.slice(2, 4)}-${startDate.slice(4, 6)}`,
      ).getTime();
      const endTime = new Date(
        `20${endDate.slice(0, 2)}-${endDate.slice(2, 4)}-${endDate.slice(4, 6)}`,
      ).getTime();
      const interval = (endTime - startTime) / 4;

      const pointTime = startTime + interval * (index + 1);
      const pointDate = new Date(pointTime);

      // YYMMDD 형식으로 변환
      const yy = pointDate.getFullYear().toString().slice(2);
      const mm = (pointDate.getMonth() + 1).toString().padStart(2, '0');
      const dd = pointDate.getDate().toString().padStart(2, '0');

      return `${yy}${mm}${dd}`;
    };

    // 구간에 따른 시작점과 끝점 계산
    switch (sectionNumber) {
      case 0: // 시작점 ~ 변곡점1
        return { startDate, endDate: getDateForPoint(0) };
      case 1: // 변곡점1 ~ 변곡점2
        return { startDate: getDateForPoint(0), endDate: getDateForPoint(1) };
      case 2: // 변곡점2 ~ 변곡점3
        return { startDate: getDateForPoint(1), endDate: getDateForPoint(2) };
      case 3: // 변곡점3 ~ 최근점
        return { startDate: getDateForPoint(2), endDate };
      default:
        return { startDate, endDate };
    }
  };

  const range = getStartAndEndDate();

  return useQuery({
    queryKey: ['tutorial', 'stocks', 'section', companyId, sectionNumber, startDate, endDate],
    queryFn: async () => {
      if (!range) {
        throw new Error('날짜 범위를 계산할 수 없습니다.');
      }
      const response = await _ky.get(
        `stocks/${companyId}/tutorial?startDate=${range.startDate}&endDate=${range.endDate}`,
      );
      return response.json() as Promise<ApiResponse<TutorialStockResponse>>;
    },
    enabled: !!companyId && !!range && !!startDate && !!endDate,
  });
};

/**
 * 과거 뉴스 리스트(변곡점) 조회 API
 */
export const useGetPastNews = () => {
  return useMutation({
    mutationFn: async (data: NewsRangeRequest) => {
      const response = await _kyAuth.post('tutorial/news/past', { json: data });
      return response.json() as Promise<ApiResponse<{ NewsResponse: NewsResponse[] }>>;
    },
  });
};

/**
 * 뉴스 코멘트(변곡점) 조회 API
 */
export const useGetNewsComment = () => {
  return useMutation({
    mutationFn: async (data: NewsRangeRequest) => {
      const response = await _kyAuth.post('tutorial/news/comment', { json: data });
      return response.json() as Promise<ApiResponse<string>>;
    },
  });
};

/**
 * 교육용 현재 뉴스 조회 API
 */
export const useGetCurrentNews = () => {
  return useMutation({
    mutationFn: async (data: CurrentNewsRequest) => {
      const response = await _kyAuth.post('tutorial/news/current', { json: data });
      return response.json() as Promise<ApiResponse<NewsResponseWithThumbnail>>;
    },
  });
};

/**
 * 사용자 행동에 따른 자산 계산 결과 조회 API
 */
export const useProcessUserAction = () => {
  return useMutation({
    mutationFn: async ({ memberId, ...data }: UserActionRequest & { memberId: number }) => {
      const response = await _kyAuth.post(`tutorial/${memberId}/action`, { json: data });
      return response.json() as Promise<ApiResponse<{ AssetResponse: AssetResponse[] }>>;
    },
  });
};

/**
 * 튜토리얼 피드백 조회 API
 */
export const useGetTutorialFeedback = (memberId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['tutorial', 'result', 'feedback', memberId],
    queryFn: async () => {
      try {
        const response = await _kyAuth.get(`tutorial/result/feedback/${memberId}`);
        return response.json() as Promise<ApiResponse<string>>;
      } catch {
        return {
          isSuccess: true,
          code: 200,
          message: '기본 피드백 제공',
          result: '튜토리얼을 완료하셨습니다. 실제 투자 시에는 더 신중하게 결정해보세요.',
        } as ApiResponse<string>;
      }
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!memberId,
    retry: 3,
  });
};

/**
 * 튜토리얼 결과 저장 API
 */
export const useSaveTutorialResult = () => {
  return useMutation({
    mutationFn: async (data: SaveTutorialResultRequest) => {
      const response = await _kyAuth.post('tutorial/result/save', { json: data });
      return response.json() as Promise<ApiResponse<Record<string, never>>>;
    },
  });
};

/**
 * 튜토리얼 세션 삭제 API
 */
export const useDeleteTutorialSession = () => {
  return useMutation({
    mutationFn: async (memberId: number) => {
      const response = await _kyAuth.get(`tutorial/session/delete/${memberId}`);
      return response.json() as Promise<ApiResponse<Record<string, never>>>;
    },
  });
};

/**
 * 튜토리얼 결과 리스트 조회 API
 */
export const useGetTutorialResults = (memberId: number) => {
  return useQuery({
    queryKey: ['tutorial', 'result', memberId],
    queryFn: async () => {
      const response = await _kyAuth.get(`tutorial/result/${memberId}`);
      return response.json() as Promise<
        ApiResponse<{ TutorialResultResponse: TutorialResultResponse[] }>
      >;
    },
    enabled: !!memberId,
  });
};

/**
 * 멤버별 튜토리얼 결과 리스트 조회 API
 */
export const useTutorialResults = ({ memberId }: { memberId: string }) => {
  return useQuery({
    queryKey: ['tutorialResults', memberId],
    queryFn: async () => {
      const response = await _kyAuth.get(`tutorial/result/${memberId}`);
      return response.json() as Promise<
        ApiResponse<{ TutorialResultResponse: TutorialResultResponse[] }>
      >;
    },
    enabled: !!memberId,
  });
};

// 직접 호출용 API 객체
export const tutorialApi = {
  getTutorialResults: ({ memberId }: { memberId: string }) =>
    _kyAuth
      .get(`tutorial/result/${memberId}`)
      .json<ApiResponse<{ TutorialResultResponse: TutorialResultResponse[] }>>(),
};
