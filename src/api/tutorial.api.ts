// 튜토리얼 관련 api (https://www.notion.so/otterbit/API-1a42f79c753081d38d42cf8c22a01fa3?pvs=4)
import { useMutation, useQuery } from '@tanstack/react-query';

import { _ky } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';
import {
  AssetResponse,
  NewsRequest,
  NewsResponse,
  NewsResponseWithThumbnail,
  Point,
  TutorialActionRequest,
  TutorialInitRequest,
  TutorialResultResponse,
  TutorialResultSaveRequest,
} from '@/api/types/tutorial';

// API 기본 URL 설정
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const tutorialAPI = {
  // 변곡점 탐색
  detectPoints: (companyId: number) =>
    _ky
      .post(`${API_BASE_URL}/tutorial/points/detect?companyId=${companyId}`)
      .json<ApiResponse<void>>(),

  // 변곡점 TOP 3 조회
  getTop3Points: (companyId: number) =>
    _ky
      .get(`${API_BASE_URL}/tutorial/points/top3?companyId=${companyId}`)
      .json<ApiResponse<{ PointResponseList: Point[] }>>(),

  // 모든 변곡점 조회 (테스트용)
  getAllPoints: () => _ky.get(`${API_BASE_URL}/tutorial/points`).json<ApiResponse<Point[]>>(),

  // 튜토리얼 세션 초기화
  initTutorial: (data: TutorialInitRequest) =>
    _ky.post(`${API_BASE_URL}/tutorial/init`, { json: data }).json<ApiResponse<void>>(),

  // 튜토리얼 세션 끊기
  deleteSession: (memberId: number) =>
    _ky.get(`${API_BASE_URL}/tutorial/session/delete/${memberId}`).json<ApiResponse<void>>(),

  // 사용자 행동, 일봉 계산 결과 리스트
  postAction: (memberId: number, data: TutorialActionRequest) =>
    _ky
      .post(`${API_BASE_URL}/tutorial/${memberId}/action`, { json: data })
      .json<ApiResponse<AssetResponse[]>>(),

  // 뉴스 (교육용)
  getCurrentNews: (data: NewsRequest) =>
    _ky
      .post(`${API_BASE_URL}/tutorial/news/current`, { json: data })
      .json<ApiResponse<NewsResponseWithThumbnail>>(),

  // 뉴스 리스트 (변곡점 사이)
  getPastNews: (data: NewsRequest) =>
    _ky
      .post(`${API_BASE_URL}/tutorial/news/past`, { json: data })
      .json<ApiResponse<{ NewsResponse: NewsResponse[] }>>(),

  // 뉴스 코멘트
  getNewsComment: (data: NewsRequest) =>
    _ky.post(`${API_BASE_URL}/tutorial/news/comment`, { json: data }).json<ApiResponse<string>>(),

  // 튜토리얼 피드백
  getTutorialFeedback: (memberId: number) =>
    _ky.get(`${API_BASE_URL}/tutorial/result/feedback/${memberId}`).json<ApiResponse<string>>(),

  // 튜토리얼 결과 저장
  saveTutorialResult: (data: TutorialResultSaveRequest) =>
    _ky.post(`${API_BASE_URL}/tutorial/result/save`, { json: data }).json<ApiResponse<void>>(),

  // 멤버별 튜토리얼 결과 리스트
  getTutorialResults: (memberId: number) =>
    _ky
      .get(`${API_BASE_URL}/tutorial/result/${memberId}`)
      .json<ApiResponse<{ TutorialResultResponse: TutorialResultResponse[] }>>(),
};

// 변곡점 탐색
export const useDetectPoints = () => {
  return useMutation({
    mutationFn: (companyId: number) =>
      tutorialAPI.detectPoints(companyId).then((res) => res.result),
  });
};

// 변곡점 TOP 3 조회
export const useGetTop3Points = (companyId: number) => {
  return useQuery<{ PointResponseList: Point[] }>({
    queryKey: ['points', 'top3', companyId],
    queryFn: () => tutorialAPI.getTop3Points(companyId).then((res) => res.result),
  });
};

// 모든 변곡점 조회 (테스트용)
export const useGetAllPoints = () => {
  return useQuery<Point[]>({
    queryKey: ['points', 'all'],
    queryFn: () => tutorialAPI.getAllPoints().then((res) => res.result),
  });
};

// 튜토리얼 세션 초기화
export const useInitTutorial = () => {
  return useMutation({
    mutationFn: (data: TutorialInitRequest) =>
      tutorialAPI.initTutorial(data).then((res) => res.result),
  });
};

// 튜토리얼 세션 끊기
export const useDeleteSession = () => {
  return useMutation({
    mutationFn: (memberId: number) => tutorialAPI.deleteSession(memberId).then((res) => res.result),
  });
};

// 사용자 행동, 일봉 계산 결과 리스트
export const usePostAction = () => {
  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: number; data: TutorialActionRequest }) =>
      tutorialAPI.postAction(memberId, data).then((res) => res.result),
  });
};

// 뉴스 (교육용)
export const useGetCurrentNews = () => {
  return useMutation({
    mutationFn: (data: NewsRequest) => tutorialAPI.getCurrentNews(data).then((res) => res.result),
  });
};

// 뉴스 리스트 (변곡점 사이)
export const useGetPastNews = () => {
  return useMutation({
    mutationFn: (data: NewsRequest) => tutorialAPI.getPastNews(data).then((res) => res.result),
  });
};

// 뉴스 코멘트
export const useGetNewsComment = () => {
  return useMutation({
    mutationFn: (data: NewsRequest) => tutorialAPI.getNewsComment(data).then((res) => res.result),
  });
};

// 튜토리얼 피드백
export const useGetTutorialFeedback = (memberId: number) => {
  return useQuery<string>({
    queryKey: ['tutorial', 'feedback', memberId],
    queryFn: () => tutorialAPI.getTutorialFeedback(memberId).then((res) => res.result),
  });
};

// 튜토리얼 결과 저장
export const useSaveTutorialResult = () => {
  return useMutation({
    mutationFn: (data: TutorialResultSaveRequest) =>
      tutorialAPI.saveTutorialResult(data).then((res) => res.result),
  });
};

// 멤버별 튜토리얼 결과 리스트
export const useGetTutorialResults = (memberId: number) => {
  return useQuery<{ TutorialResultResponse: TutorialResultResponse[] }>({
    queryKey: ['tutorial', 'results', memberId],
    queryFn: () => tutorialAPI.getTutorialResults(memberId).then((res) => res.result),
  });
};
