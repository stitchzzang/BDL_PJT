import { createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '@/layouts/MainLayout';
import { MemberLayout } from '@/layouts/MemberLayout';
import { AlgorithmLabPage } from '@/routes/pages/AlgorithmLabPage';
import { HomePage } from '@/routes/pages/HomePage';
import { LoginPage } from '@/routes/pages/LoginPage';
import { MemberEditPage } from '@/routes/pages/MemberEditPage';
import { MemberPasswordEditPage } from '@/routes/pages/MemberPasswordEditPage';
import { NotFoundPage } from '@/routes/pages/NotFoundPage';
import { SearchPage } from '@/routes/pages/SearchPage';
import { SimulatedEducationPage } from '@/routes/pages/SimulatedEducationPage';
import { SimulatedInvestmentPage } from '@/routes/pages/SimulatedInvestmentPage';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        element: <MemberLayout />,
        children: [
          {
            path: '/member/edit',
            element: <MemberEditPage />,
          },
          {
            path: '/member/edit/password',
            element: <MemberPasswordEditPage />,
          },
        ],
      },
      {
        path: '/algorithm-lab',
        element: <AlgorithmLabPage />,
      },
      {
        path: '/simulated-education',
        element: <SimulatedEducationPage />,
      },
      {
        path: '/simulated-investment',
        element: <SimulatedInvestmentPage />,
      },
      {
        path: '/search',
        element: <SearchPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
