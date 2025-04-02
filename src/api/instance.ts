import ky from 'ky';

const DEFAULT_TIMEOUT = 10000; // 10초

export const _ky = ky.create({
  prefixUrl: '/api', // API 경로 프리픽스 설정
  timeout: DEFAULT_TIMEOUT,
  hooks: {
    beforeRequest: [
      (request) => {
        console.log(`API 요청: ${request.method} ${request.url}`);
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        console.log(`API 응답: ${response.status} ${response.url}`);
        return response;
      },
    ],
  },
});

// 인증 필요한 API용 인스턴스
export const _kyAuth = ky.create({
  prefixUrl: '/api', // API 경로 프리픽스 설정
  timeout: DEFAULT_TIMEOUT,
  hooks: {
    beforeRequest: [
      (request) => {
        // 실제 환경에서는 토큰 설정
        // const token = localStorage.getItem('token');
        // if (token) {
        //   request.headers.set('Authorization', `Bearer ${token}`);
        // }
        console.log(`인증 API 요청: ${request.method} ${request.url}`);
      },
    ],
    afterResponse: [
      (_request, _options, response) => {
        console.log(`인증 API 응답: ${response.status} ${response.url}`);
        return response;
      },
    ],
  },
});
