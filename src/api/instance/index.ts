import ky, { KyRequest } from 'ky';

import { ERROR_CODES } from '@/api/instance/errorHandler';
import { navigate } from '@/lib/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface ExtendedKyRequest extends KyRequest {
  _retry?: boolean;
}

declare const __API_URL__: string;

// 기본 ky 인스턴스 생성
const _ky = ky.create({
  prefixUrl: __API_URL__,
  timeout: 5000,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
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
    afterResponse: [
      async (request: ExtendedKyRequest, options, response) => {
        const clonedResponse = response.clone();
        const data = await clonedResponse.json();
        const customCode = data?.body?.code;

        // Access Token 만료
        if (customCode === ERROR_CODES.EXPIRED_ACCESS_TOKEN) {
          if (!request._retry) {
            request._retry = true;
            try {
              const tokenResponse = await _ky.post('auth/reissue');
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
        if (
          customCode === ERROR_CODES.EXPIRED_ACCESS_TOKEN ||
          customCode === ERROR_CODES.EXPIRED_REFRESH_TOKEN ||
          customCode === ERROR_CODES.INVALID_REFRESH_TOKEN ||
          customCode === ERROR_CODES.NOT_FOUND_REFRESH_TOKEN
        ) {
          useAuthStore.getState().logoutAuth();
          navigate('/login');
          throw new Error('Authentication failed');
        }

        return response;
      },
    ],
  },
});

export { _ky, _kyAuth };
