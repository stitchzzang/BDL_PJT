import { createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '@/layouts/MainLayout';
import { AlgorithmLabPage } from '@/routes/pages/AlgorithmLabPage';
import { HomePage } from '@/routes/pages/HomePage';
import { LoginPage } from '@/routes/pages/LoginPage';
import { NotFoundPage } from '@/routes/pages/NotFoundPage';
import { SimulatedEducationPage } from '@/routes/pages/SimulatedEducationPage';
import { SimulatedInvestmentPage } from '@/routes/pages/SimulatedInvestmentPage';

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
        element: <LoginPage />,
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
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
