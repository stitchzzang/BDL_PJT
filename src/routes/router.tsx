import { createBrowserRouter } from 'react-router-dom';

import { MainLayout } from '@/layouts/MainLayout';
import { MemberLayout } from '@/layouts/MemberLayout';
import { AlgorithmLabPage } from '@/routes/pages/AlgorithmLabPage';
import { HomePage } from '@/routes/pages/HomePage';
import { LoginPage } from '@/routes/pages/LoginPage';
import { MemberAlgorithmPage } from '@/routes/pages/MemberAlgorithmPage';
import { MemberEditPage } from '@/routes/pages/MemberEditPage';
import { MemberInvestmentPage } from '@/routes/pages/MemberInvestmentPage';
import { MemberPasswordEditPage } from '@/routes/pages/MemberPasswordEditPage';
import { NotFoundPage } from '@/routes/pages/NotFoundPage';
import { SearchPage } from '@/routes/pages/SearchPage';
import { SignUpPage } from '@/routes/pages/SignUpPage';
import { SignUpSuccessPage } from '@/routes/pages/SignUpSuccessPage';
import { SimulatedEducationPage } from '@/routes/pages/SimulatedEducationPage';
import { SimulatedInvestmentPage } from '@/routes/pages/SimulatedInvestmentPage';
import { StockTutorialResultPage } from '@/routes/pages/StockTutorialResultPage';
import { StockTutorialSelection } from '@/routes/pages/StockTutorialSelection';

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
          {
            path: '/member/stock-tutorial-result',
            element: <StockTutorialResultPage />,
          },
          {
            path: '/member/algorithm',
            element: <MemberAlgorithmPage />,
          },
          {
            path: '/member/investment',
            element: <MemberInvestmentPage />,
          },
        ],
      },
      {
        path: '/algorithm-lab',
        element: <AlgorithmLabPage />,
      },
      {
        path: '/search',
        element: <SearchPage />,
      },
      {
        path: '/signup',
        element: <SignUpPage />,
      },
      {
        path: '/signup-success',
        element: <SignUpSuccessPage />,
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
        path: '/stock-tutorial-selection',
        element: <StockTutorialSelection />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
