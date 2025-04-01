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
 * 1년전 시작 분봉 ID 조회 API
 */
export const useGetStartPointId = () => {
  return useQuery({
    queryKey: ['tutorial', 'points', 'start'],
    queryFn: async () => {
      try {
        const response = await _ky.get('tutorial/points/start');
        return response.json() as Promise<ApiResponse<number>>;
      } catch (error) {
        console.error('시작 분봉 ID 조회 실패:', error);
        return {
          isSuccess: true,
          code: 200,
          message: '기본값 제공',
          result: 1, // 적절한 기본 시작 분봉 ID로 조정 필요
        } as ApiResponse<number>;
      }
    },
    retry: 3,
  });
};

/**
 * 가장 최근 분봉 ID 조회 API
 */
export const useGetEndPointId = () => {
  return useQuery({
    queryKey: ['tutorial', 'points', 'end'],
    queryFn: async () => {
      try {
        const response = await _ky.get('tutorial/points/end');
        return response.json() as Promise<ApiResponse<number>>;
      } catch (error) {
        console.error('최근 분봉 ID 조회 실패:', error);
        // 기본값 제공 - 실제 환경에 맞게 조정 필요
        return {
          isSuccess: true,
          code: 200,
          message: '기본값 제공',
          result: 10000, // 적절한 기본 분봉 ID로 조정 필요
        } as ApiResponse<number>;
      }
    },
    retry: 3,
  });
};

/**
 * 튜토리얼 일봉 데이터 조회 API
 */
export const useGetTutorialStockData = (
  companyId: number,
  startStockCandleId: number,
  endStockCandleId: number,
) => {
  return useQuery({
    queryKey: ['tutorial', 'stocks', companyId, startStockCandleId, endStockCandleId],
    queryFn: async () => {
      try {
        const response = await _ky.get(
          `stocks/${companyId}/tutorial?startStockCandleId=${startStockCandleId}&endStockCandleId=${endStockCandleId}`,
        );

        // 응답 헤더 확인
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('서버에서 HTML 응답을 반환했습니다. API 형식이 올바르지 않습니다.');
        }

        return response.json() as Promise<ApiResponse<TutorialStockResponse>>;
      } catch (error) {
        console.error('튜토리얼 일봉 데이터 조회 실패:', error);
        throw error;
      }
    },
    enabled: !!companyId && !!startStockCandleId && !!endStockCandleId,
    retry: 3, // 실패 시 최대 3번 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프 (최대 30초)
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
export const useGetTutorialFeedback = (memberId: number) => {
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
    enabled: !!memberId,
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
