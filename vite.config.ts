import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // 환경 변수 파일(.env.development 등)을 로드
  const env = loadEnv(mode, process.cwd(), '');

  // API URL 설정
  const API_LOCAL_URL = 'http://localhost:8080';
  const API_PROD_URL = 'https://j12d202.p.ssafy.io';
  // USE_LOCAL_API 환경변수에 따라 로컬/프로덕션 API 선택
  const API_TARGET = env.USE_PROD_API === 'true' ? API_PROD_URL : API_LOCAL_URL;

  return {
    // React 플러그인 사용
    plugins: [react()],

    // 경로 별칭 설정 (@는 src 폴더를 가리킴)
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // 전역 변수 정의
    define: {
      // API 요청 시 사용할 기본 경로 설정
      __API_URL__: JSON.stringify('/api'),
    },

    // 개발 서버 설정
    server: {
      proxy: {
        // /api로 시작하는 요청을 대상 서버로 프록시
        '/api': {
          target: API_TARGET, // 실제 API 서버 주소
          changeOrigin: true, // CORS 회피를 위한 호스트 헤더 변경
          rewrite: (path) => path.replace(/^\/api/, 'api'), // URL 경로 재작성
        },
      },
    },

    // .glb 파일을 에셋으로 처리
    assetsInclude: ['**/*.glb'],
  };
});
