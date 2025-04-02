import ky, { KyRequest } from 'ky';

import { ERROR_CODES } from '@/api/instance/errorHandler';
import { navigate } from '@/lib/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface ExtendedKyRequest extends KyRequest {
  _retry?: boolean;
}

interface ErrorResponse {
  message?: string;
  [key: string]: any;
}

declare const __API_URL__: string;

// 기본 ky 인스턴스 생성
const _ky = ky.create({
  prefixUrl: __API_URL__,
  timeout: 5000,
  credentials: 'include',
  headers: {},
});

// 인증이 필요한 요청을 위한 ky 인스턴스
const _kyAuth = _ky.extend({
  hooks: {
    beforeRequest: [
      (request: ExtendedKyRequest) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      },
    ],
    beforeError: [
      async (error) => {
        const { response } = error;
        if (response) {
          try {
            const errorData = (await response.json()) as ErrorResponse;
            const errorMessage = errorData?.message;

            // 에러 메시지를 숫자로 변환하여 ERROR_CODES와 비교
            const errorCode = parseInt(errorMessage || '', 10);

            // Access Token 만료 (401 에러)
            if (!isNaN(errorCode) && errorCode === ERROR_CODES.EXPIRED_ACCESS_TOKEN) {
              try {
                const tokenResponse = await _kyAuth.post('auth/reissue');
                const BEARER_PREFIX = 'Bearer ';
                const newAccessToken = tokenResponse.headers
                  .get('Authorization')
                  ?.substring(BEARER_PREFIX.length);

                if (newAccessToken) {
                  useAuthStore.getState().loginAuth(newAccessToken, {
                    memberId: null,
                    nickname: null,
                    profile: null,
                  });
                  // 토큰 갱신 후 다시 시도하고 싶다면, _retry 플래그를 설정하고
                  // 원래 요청을 다시 보내는 로직을 구현해야 합니다.
                  // 그러나 ky의 beforeError 훅에서는 원래 요청을 다시 보낼 수 없으므로
                  // 호출자가 재시도해야 합니다.
                }
              } catch (refreshError) {
                useAuthStore.getState().logoutAuth();
                navigate('/login');
              }
            }

            // 모든 토큰 만료 및 유효하지 않은 토큰
            if (!isNaN(errorCode) && errorCode === ERROR_CODES.REFRESH_AUTHORIZATION_FAIL) {
              useAuthStore.getState().logoutAuth();
              navigate('/login');
            }
          } catch (jsonError) {
            // JSON 파싱 에러 발생 시 원래 에러를 그대로 처리
          }
        }
        return error;
      },
    ],
    afterResponse: [
      async (request: ExtendedKyRequest, options, response) => {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        const messageValue = data?.message;

        // message 값을 숫자로 변환하여 ERROR_CODES와 비교
        const customCode = parseInt(messageValue || '', 10);

        // Access Token 만료
        if (!isNaN(customCode) && customCode === ERROR_CODES.EXPIRED_ACCESS_TOKEN) {
          if (!request._retry) {
            request._retry = true;
            try {
              const tokenResponse = await _kyAuth.post('auth/reissue');
              const BEARER_PREFIX = 'Bearer ';
              const newAccessToken = tokenResponse.headers
                .get('Authorization')
                ?.substring(BEARER_PREFIX.length);

              if (newAccessToken) {
                useAuthStore.getState().loginAuth(newAccessToken, {
                  memberId: null,
                  nickname: null,
                  profile: null,
                });
                request.headers.set('Authorization', `Bearer ${newAccessToken}`);
              }

              return _kyAuth(request);
            } catch (error) {
              useAuthStore.getState().logoutAuth();
              navigate('/login');
              throw error;
            }
          }
        }

        // 모든 토큰 만료 및 유효하지 않은 토큰
        if (!isNaN(customCode) && customCode === ERROR_CODES.REFRESH_AUTHORIZATION_FAIL) {
          useAuthStore.getState().logoutAuth();
          navigate('/login');
          throw new Error('Authentication failed');
        }

        return response;
      },
    ],
  },
  retry: 0,
});

export { _ky, _kyAuth };
