import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HTTPError } from 'ky';
import { toast } from 'react-toastify';

import { _ky, _kyAuth } from '@/api/instance';
import { handleKyError } from '@/api/instance/errorHandler';
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
    onError: (error: unknown) =>
      handleKyError(error as HTTPError, '세션 초기화 중 오류가 발생했습니다.'),
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
    onError: (error: unknown) =>
      handleKyError(error as HTTPError, '변곡점 탐색 중 오류가 발생했습니다.'),
  });
};

/**
 * 변곡점 TOP3 조회 API
 */
export const useGetTop3Points = (companyId: number) => {
  const result = useQuery({
    queryKey: ['tutorial', 'points', 'top3', companyId],
    queryFn: async () => {
      try {
        const response = await _ky.get(`tutorial/points/top3?companyId=${companyId}`);
        const responseData = (await response.json()) as ApiResponse<{ PointResponseList: Point[] }>;
        return responseData;
      } catch (error) {
        handleKyError(error as HTTPError, '변곡점 정보를 불러오는 중 오류가 발생했습니다.');
        throw error;
      }
    },
  });

  return result;
};

/**
 * 변곡점 날짜 조회 API
 *
 * @param stockCandleId 일봉 ID
 */
export const useGetPointDate = (stockCandleId: number) => {
  const result = useQuery({
    queryKey: ['tutorial', 'points', 'date', stockCandleId],
    queryFn: async () => {
      try {
        if (!stockCandleId) {
          throw new Error('유효하지 않은 파라미터입니다.');
        }
        const response = await _ky.get(`tutorial/points/date?stockCandleId=${stockCandleId}`);
        return response.json() as Promise<ApiResponse<string>>;
      } catch (error) {
        handleKyError(error as HTTPError, '변곡점 날짜 정보를 불러오는 중 오류가 발생했습니다.');
        throw error;
      }
    },
    enabled: !!stockCandleId && stockCandleId > 0,
    retry: 3,
  });

  return result;
};

/**
 * 튜토리얼 일봉 데이터 조회 API
 *
 * @param companyId 회사 ID
 * @param startDate 시작 날짜 (YYMMDD)
 * @param endDate 종료 날짜 (YYMMDD)
 */
export const useGetTutorialStockData = (companyId: number, startDate: string, endDate: string) => {
  const result = useQuery({
    queryKey: ['tutorial', 'stocks', companyId, startDate, endDate],
    queryFn: async () => {
      try {
        if (!companyId || !startDate || !endDate) {
          throw new Error('유효하지 않은 파라미터입니다.');
        }

        const apiUrl = `stocks/${companyId}/tutorial?startDate=${startDate}&endDate=${endDate}`;

        const response = await _ky.get(apiUrl);
        return response.json() as Promise<ApiResponse<TutorialStockResponse>>;
      } catch (error) {
        handleKyError(error as HTTPError, '주식 데이터를 불러오는 중 오류가 발생했습니다.');
        throw error;
      }
    },
    enabled: !!companyId && !!startDate && !!endDate,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 60 * 1000,
  });

  return result;
};

/**
 * 구간별 튜토리얼 일봉 데이터 조회 API
 * 시작점~변곡점1, 변곡점1 ~ 변곡점2-1, 변곡점2 ~ 변곡점3-1, 변곡점3 ~ 최근점 등의 구간 데이터를 조회
 *
 * @param companyId 회사 ID
 * @param sectionNumber 구간 번호 (0: 시작점~변곡점1, 1: 변곡점1~변곡점2-1, 2: 변곡점2~변곡점3-1, 3: 변곡점3~최근점)
 * @param inflectionPoints 변곡점 배열 (상위 3개 변곡점)
 * @param startDate 전체 기간 시작 날짜 (YYMMDD)
 * @param endDate 전체 기간 종료 날짜 (YYMMDD)
 * @param pointDates 변곡점 날짜 배열 (YYMMDD 형식, 최대 3개)
 */
export const useGetSectionTutorialStockData = (
  companyId: number,
  sectionNumber: number,
  inflectionPoints: Point[],
  startDate: string,
  endDate: string,
  pointDates: string[] = [],
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

    // 각 변곡점의 1일 전 날짜 계산 함수
    const calculatePreviousDay = (dateStr: string): string => {
      if (!dateStr) return '';

      // YYMMDD 형식 날짜를 Date 객체로 변환
      const year = parseInt(`20${dateStr.substring(0, 2)}`, 10);
      const month = parseInt(dateStr.substring(2, 4), 10) - 1; // 0-indexed month
      const day = parseInt(dateStr.substring(4, 6), 10);

      const date = new Date(year, month, day);

      // 하루 전 날짜 계산
      date.setDate(date.getDate() - 1);

      // YYMMDD 형식으로 변환
      const yy = date.getFullYear().toString().substring(2);
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      const dd = date.getDate().toString().padStart(2, '0');

      return `${yy}${mm}${dd}`;
    };

    // 변곡점 이전 날짜 배열 생성
    const prevPointDates = pointDates.map(calculatePreviousDay);

    // 구간에 따른 시작점과 끝점 계산
    switch (sectionNumber) {
      case 0: // 시작점 ~ 변곡점1
        return {
          startDate,
          endDate: pointDates[0] || endDate,
        };
      case 1: // 변곡점1 ~ 변곡점2-1
        return {
          startDate: pointDates[0] || startDate,
          endDate: prevPointDates[1] || pointDates[1] || endDate,
        };
      case 2: // 변곡점2 ~ 변곡점3-1
        return {
          startDate: pointDates[1] || pointDates[0] || startDate,
          endDate: prevPointDates[2] || pointDates[2] || endDate,
        };
      case 3: // 변곡점3 ~ 최근점
        return {
          startDate: pointDates[2] || pointDates[1] || pointDates[0] || startDate,
          endDate,
        };
      default:
        return { startDate, endDate };
    }
  };

  const range = getStartAndEndDate();

  const result = useQuery({
    queryKey: [
      'tutorial',
      'stocks',
      'section',
      companyId,
      sectionNumber,
      startDate,
      endDate,
      ...pointDates,
    ],
    queryFn: async () => {
      try {
        if (!range) {
          throw new Error('날짜 범위를 계산할 수 없습니다.');
        }
        const response = await _ky.get(
          `stocks/${companyId}/tutorial?startDate=${range.startDate}&endDate=${range.endDate}`,
        );
        return response.json() as Promise<ApiResponse<TutorialStockResponse>>;
      } catch (error) {
        handleKyError(error as HTTPError, '구간별 주식 데이터를 불러오는 중 오류가 발생했습니다.');
        throw error;
      }
    },
    enabled: !!companyId && !!range && !!startDate && !!endDate,
  });

  return result;
};

/**
 * 변곡점 날짜 배열을 가져오는 API
 * 최대 3개의 변곡점에 대한 날짜 정보를 배열로 반환
 *
 * @param inflectionPoints 변곡점 배열 (Point 타입)
 */
export const useGetPointDates = (inflectionPoints: Point[]) => {
  // 첫 번째 변곡점 날짜 쿼리
  const point1Id = inflectionPoints[0]?.stockCandleId || 0;
  const point1Query = useGetPointDate(point1Id);

  // 두 번째 변곡점 날짜 쿼리
  const point2Id = inflectionPoints[1]?.stockCandleId || 0;
  const point2Query = useGetPointDate(point2Id);

  // 세 번째 변곡점 날짜 쿼리
  const point3Id = inflectionPoints[2]?.stockCandleId || 0;
  const point3Query = useGetPointDate(point3Id);

  // 데이터 로딩 상태 및 결과 배열 생성
  const isLoading = point1Query.isLoading || point2Query.isLoading || point3Query.isLoading;
  const isError = point1Query.isError || point2Query.isError || point3Query.isError;

  // 결과 배열 생성
  const pointDates: string[] = [];
  if (point1Query.data?.result) pointDates[0] = point1Query.data.result;
  if (point2Query.data?.result) pointDates[1] = point2Query.data.result;
  if (point3Query.data?.result) pointDates[2] = point3Query.data.result;

  return {
    pointDates,
    isLoading,
    isError,
    queries: [point1Query, point2Query, point3Query],
  };
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
    onError: (error: unknown) =>
      handleKyError(error as HTTPError, '과거 뉴스를 불러오는 중 오류가 발생했습니다.'),
  });
};

/**
 * 뉴스 코멘트(변곡점) 조회 API
 */
export const useGetNewsComment = () => {
  return useMutation({
    mutationFn: async (data: NewsRangeRequest) => {
      // 인증된 요청 사용 (_kyAuth)
      const response = await _kyAuth.post('tutorial/news/comment', {
        json: data,
        timeout: 15000, // 타임아웃 15초로 설정
      });

      const responseData = (await response.json()) as ApiResponse<string>;
      return responseData;
    },
    retry: 1, // 1번만 재시도
    onError: (error: unknown) =>
      handleKyError(error as HTTPError, '뉴스 분석 코멘트를 불러오는 중 오류가 발생했습니다.'),
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
    onError: (error: unknown) =>
      handleKyError(error as HTTPError, '현재 뉴스를 불러오는 중 오류가 발생했습니다.'),
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
    onError: (error: unknown) =>
      handleKyError(error as HTTPError, '거래 처리 중 오류가 발생했습니다.'),
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
    onError: (error: unknown) =>
      handleKyError(error as HTTPError, '튜토리얼 결과 저장 중 오류가 발생했습니다.'),
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
    onError: (error: unknown) =>
      handleKyError(error as HTTPError, '튜토리얼 세션 삭제 중 오류가 발생했습니다.'),
  });
};

/**
 * 튜토리얼 결과 리스트 조회 API
 */
export const tutorialApi = {
  getTutorialResults: ({ memberId }: { memberId: string }) =>
    _kyAuth
      .get<
        ApiResponse<{ TutorialResultResponse: TutorialResultResponse[] }>
      >(`tutorial/result/${memberId}`)
      .json(),

  deleteTutorialResult: ({ tutorialResultId }: { tutorialResultId: string }) =>
    _kyAuth.delete(`tutorial/result/delete/${tutorialResultId}`).json(),
};

export const useTutorialResults = ({ memberId }: { memberId: string }) => {
  return useQuery({
    queryKey: ['tutorialResults', memberId],
    queryFn: async () => {
      try {
        const response = await tutorialApi.getTutorialResults({ memberId });
        // API 응답 구조 처리: result.TutorialResultResponse 배열 반환
        if (response.result && response.result.TutorialResultResponse) {
          return response.result.TutorialResultResponse;
        }

        // 응답 구조가 다른 경우 (배열이 직접 반환되는 경우도 처리)
        if (Array.isArray(response.result)) {
          return response.result;
        }

        // 빈 배열 반환
        return [];
      } catch (error) {
        handleKyError(error as HTTPError, '튜토리얼 결과를 불러오는 중 오류가 발생했습니다.');
        return [];
      }
    },
    enabled: !!memberId,
  });
};

export const useDeleteTutorialResult = (onSuccess?: () => void, onError?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tutorialResultId }: { tutorialResultId: string }) =>
      tutorialApi.deleteTutorialResult({ tutorialResultId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorialResults'] });
      toast.success('튜토리얼 결과가 성공적으로 삭제되었습니다.');
      onSuccess?.();
    },
    onError: (error: HTTPError) => {
      handleKyError(error, '튜토리얼 결과 삭제에 실패했습니다. 다시 시도해주세요.');
      onError?.();
    },
  });
};
