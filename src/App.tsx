import { QueryClientProvider } from '@tanstack/react-query';
import { Slide, ToastContainer } from 'react-toastify';

import { useAuthInitialize } from '@/hooks/useAuthInitialize';
import { queryClient } from '@/lib/queryClient';
import AppRouter from '@/routes';

function App() {
  // 앱 시작 시 인증 상태 초기화 (토큰 만료 확인 포함)
  useAuthInitialize();

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ToastContainer
        autoClose={3000}
        position="bottom-center"
        hideProgressBar={true}
        transition={Slide}
        closeOnClick
        stacked
        limit={5}
        style={{ width: '350px' }}
      />
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

export default App;
