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
      const response = await _ky.get(`tutorial/points/top3?companyId=${companyId}`);
      return response.json() as Promise<ApiResponse<{ PointResponseList: Point[] }>>;
    },
  });
};

/**
 * 1년전 시작 일봉 ID 조회 API
 */
export const useGetStartPointId = (companyId: number) => {
  return useQuery({
    queryKey: ['tutorial', 'points', 'start', companyId],
    queryFn: async () => {
      const response = await _ky.get(`tutorial/points/start?companyId=${companyId}`);
      return response.json() as Promise<ApiResponse<number>>;
    },
    retry: 3,
    enabled: !!companyId,
  });
};

/**
 * 가장 최근 일봉 ID 조회 API
 */
export const useGetEndPointId = (companyId: number) => {
  return useQuery({
    queryKey: ['tutorial', 'points', 'end', companyId],
    queryFn: async () => {
      const response = await _ky.get(`tutorial/points/end?companyId=${companyId}`);
      return response.json() as Promise<ApiResponse<number>>;
    },
    retry: 3,
    enabled: !!companyId,
  });
};

/**
 * 튜토리얼 일봉 데이터 조회 API
 *
 * @param companyId 회사 ID
 * @param startStockCandleId 시작 일봉 ID
 * @param endStockCandleId 종료 일봉 ID
 */
export const useGetTutorialStockData = (
  companyId: number,
  startStockCandleId: number,
  endStockCandleId: number,
) => {
  return useQuery({
    queryKey: ['tutorial', 'stocks', companyId, startStockCandleId, endStockCandleId],
    queryFn: async () => {
      const response = await _ky.get(
        `stocks/${companyId}/tutorial?startStockCandleId=${startStockCandleId}&endStockCandleId=${endStockCandleId}`,
      );

      return response.json() as Promise<ApiResponse<TutorialStockResponse>>;
    },
    enabled: !!companyId && !!startStockCandleId && !!endStockCandleId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * 구간별 튜토리얼 일봉 데이터 조회 API
 * 시작점~변곡점1, 변곡점1~변곡점2, 변곡점2~변곡점3, 변곡점3~최근점 등의 구간 데이터를 조회
 *
 * @param companyId 회사 ID
 * @param sectionNumber 구간 번호 (0: 시작점~변곡점1, 1: 변곡점1~변곡점2, 2: 변곡점2~변곡점3, 3: 변곡점3~최근점)
 * @param inflectionPoints 변곡점 배열 (상위 3개 변곡점)
 */
export const useGetSectionTutorialStockData = (
  companyId: number,
  sectionNumber: number,
  inflectionPoints: Point[],
) => {
  // 시작점과 종료점 데이터 가져오기
  const startPointQuery = useGetStartPointId(companyId);
  const endPointQuery = useGetEndPointId(companyId);

  const startPointId = startPointQuery.data?.result;
  const endPointId = endPointQuery.data?.result;

  // 구간의 시작과 끝 ID 계산
  const getStartAndEndId = () => {
    // 시작점이나 종료점 데이터가 아직 로드되지 않은 경우
    if (!startPointId || !endPointId) {
      return null;
    }

    // 변곡점이 없거나 충분하지 않은 경우
    if (!inflectionPoints || inflectionPoints.length === 0) {
      return { startId: startPointId, endId: endPointId };
    }

    // 구간에 따른 시작점과 끝점 계산
    switch (sectionNumber) {
      case 0: // 시작점 ~ 변곡점1
        return { startId: startPointId, endId: inflectionPoints[0]?.stockCandleId || endPointId };
      case 1: // 변곡점1 ~ 변곡점2
        return inflectionPoints.length > 1
          ? { startId: inflectionPoints[0].stockCandleId, endId: inflectionPoints[1].stockCandleId }
          : { startId: inflectionPoints[0]?.stockCandleId || startPointId, endId: endPointId };
      case 2: // 변곡점2 ~ 변곡점3
        return inflectionPoints.length > 2
          ? { startId: inflectionPoints[1].stockCandleId, endId: inflectionPoints[2].stockCandleId }
          : { startId: inflectionPoints[1]?.stockCandleId || startPointId, endId: endPointId };
      case 3: // 변곡점3 ~ 최근점
        return { startId: inflectionPoints[2]?.stockCandleId || startPointId, endId: endPointId };
      default:
        return { startId: startPointId, endId: endPointId };
    }
  };

  const range = getStartAndEndId();

  return useQuery({
    queryKey: ['tutorial', 'stocks', 'section', companyId, sectionNumber],
    queryFn: async () => {
      if (!range) {
        throw new Error('Range is not available yet');
      }
      const response = await _ky.get(
        `stocks/${companyId}/tutorial?startStockCandleId=${range.startId}&endStockCandleId=${range.endId}`,
      );
      return response.json() as Promise<ApiResponse<TutorialStockResponse>>;
    },
    enabled: !!companyId && !!range && startPointQuery.isSuccess && endPointQuery.isSuccess,
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
      } catch (error) {
        console.error('튜토리얼 피드백 조회 실패:', error);
        return {
          isSuccess: true,
          code: 200,
          message: '기본 피드백 제공',
          result: '튜토리얼을 완료하셨습니다. 실제 투자 시에는 더 신중하게 결정해보세요.', // 기본 피드백 메시지
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
