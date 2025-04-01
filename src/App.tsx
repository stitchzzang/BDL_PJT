import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { LoadingAnimation } from '@/components/common/loading-animation';
import { useAuthInitialize } from '@/hooks/useAuthInitialize';
import { queryClient } from '@/lib/queryClient';
import AppRouter from '@/routes';

function App() {
  const isInitialized = useAuthInitialize();

  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      {isInitialized && <LoadingAnimation />}
      <Toaster position="bottom-center" />
    </QueryClientProvider>
  );
}

export default App;
