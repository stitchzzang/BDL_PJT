// https://tanstack.com/query/latest/docs/framework/react/overview

import { QueryClient } from '@tanstack/react-query';

// QueryClient 인스턴스 생성
// 모든 쿼리에 대한 기본 설정을 여기서 관리합니다.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 쿼리 실패시 재시도 횟수
      // false: 재시도 안함, true: 무한 재시도, number: 지정된 횟수만큼 재시도
      // 기본값: 3
      retry: false,

      // 데이터가 'fresh'에서 'stale'로 전환되는 시간 (밀리초)
      // 0: 항상 새로운 데이터로 취급
      // Infinity: 영구적으로 fresh 상태 유지
      // 기본값: 0
      staleTime: 0,

      // 백그라운드에서 데이터를 자동으로 다시 가져오는 주기 (밀리초)
      // false: 자동 갱신 비활성화
      // number: 설정된 시간마다 데이터 갱신
      // 기본값: false (자동 갱신 안함)
      refetchInterval: false,

      // 윈도우가 다시 포커스될 때 데이터 자동 갱신 여부
      // 기본값: true
      // refetchOnWindowFocus: true,

      // 네트워크가 다시 연결될 때 데이터 자동 갱신 여부
      // 기본값: true
      // refetchOnReconnect: true,

      // 컴포넌트가 마운트될 때 데이터 자동 갱신 여부
      // 기본값: true
      // refetchOnMount: true,

      // 캐시된 데이터의 유효 시간 (밀리초)
      // 기본값: 5 * 60 * 1000 (5분)
      // cacheTime: 5 * 60 * 1000,

      // 쿼리 실패 시 에러 발생 전까지 대기 시간 (밀리초)
      // 기본값: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
      // retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

      // 쿼리 성공/실패 시 자동으로 데이터 갱신 여부
      // 기본값: false
      // suspense: false,

      // 캐시된 데이터 사용 여부
      // 기본값: true
      // enabled: true,

      // 쿼리 키가 변경될 때 이전 데이터 유지 여부
      // 기본값: false
      // keepPreviousData: false,

      // 쿼리가 비활성화될 때 데이터 초기화 여부
      // 기본값: true
      // resetOnDisable: true,
    },
    // mutations에 대한 기본 설정
    // mutations: {
    //   // 실패한 mutation 재시도 횟수
    //   // 기본값: 0
    //   retry: 1,
    //   // 재시도 대기 시간
    //   // 기본값: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    //   retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    // },
  },
});
