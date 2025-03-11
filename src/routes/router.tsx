import { createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/routes/pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
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
