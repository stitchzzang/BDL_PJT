import { QueryClientProvider } from '@tanstack/react-query';
import { Slide, ToastContainer } from 'react-toastify';

import { queryClient } from '@/lib/queryClient';
import AppRouter from '@/routes';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ToastContainer
        position="bottom-center"
        hideProgressBar={true}
        transition={Slide}
        closeOnClick
        stacked
        limit={5}
      />
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
}

export default App;
