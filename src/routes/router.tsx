import { createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '@/layouts/MainLayout';
import MainPage from '@/routes/pages/MainPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <MainPage />,
      },
      {
        path: '/login',
        element: <div>로그인</div>,
      },
      {
        path: '/notfound',
        element: <div>Not Found</div>,
      },
    ],
  },
]);
