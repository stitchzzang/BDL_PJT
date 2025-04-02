import { createBrowserRouter, Navigate } from 'react-router-dom';

import { ChartContainer } from '@/components/ui/chart-container';
import { AlgorithmLabLayout } from '@/layouts/AlgorithmLabLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { MemberLayout } from '@/layouts/MemberLayout';
import { ConfirmPage } from '@/routes/pages/algorithm-lab/ConfirmPage';
import { MarketPage } from '@/routes/pages/algorithm-lab/MarketPage';
import { MethodPage } from '@/routes/pages/algorithm-lab/MethodPage';
import { NamePage } from '@/routes/pages/algorithm-lab/NamePage';
import { StartPage } from '@/routes/pages/algorithm-lab/StartPage';
import { StylePage } from '@/routes/pages/algorithm-lab/StylePage';
import { BadGatewayPage } from '@/routes/pages/BadGatewayPage';
import { HomePage } from '@/routes/pages/HomePage';
import { LoginPage } from '@/routes/pages/LoginPage';
import { AlgorithmPage } from '@/routes/pages/member/AlgorithmPage';
import { EditPage } from '@/routes/pages/member/EditPage';
import { InvestmentResultPage } from '@/routes/pages/member/InvestmentResultPage';
import { PasswordEditPage } from '@/routes/pages/member/PasswordEditPage';
import { TutorialResultPage } from '@/routes/pages/member/TutorialResultPage';
import { NotFoundPage } from '@/routes/pages/NotFoundPage';
import { PermissionDeniedPage } from '@/routes/pages/PermissionDeniedPage';
import { SearchPage } from '@/routes/pages/SearchPage';
import { SignUpPage } from '@/routes/pages/SignUpPage';
import { SignUpSuccessPage } from '@/routes/pages/SignUpSuccessPage';
import { SimulatedInvestmentPage } from '@/routes/pages/SimulatedInvestmentPage';
import { SelectPage } from '@/routes/pages/tutorial/SelectPage';
import { SimulatePage } from '@/routes/pages/tutorial/SimulatePage';

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
        path: '/member',
        element: <MemberLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/member/stock-tutorial-result" replace />,
          },
          {
            path: 'edit',
            element: <EditPage />,
          },
          {
            path: 'edit/password',
            element: <PasswordEditPage />,
          },
          {
            path: 'stock-tutorial-result',
            element: <TutorialResultPage />,
          },
          {
            path: 'algorithm',
            element: <AlgorithmPage />,
          },
          {
            path: 'investment',
            element: <InvestmentResultPage />,
          },
        ],
      },
      {
        path: '/algorithm-lab',
        element: <AlgorithmLabLayout />,
        children: [
          {
            path: '',
            element: <StartPage />,
          },
          {
            path: 'name',
            element: <NamePage />,
          },
          {
            path: 'style',
            element: <StylePage />,
          },
          {
            path: 'method',
            element: <MethodPage />,
          },
          {
            path: 'market',
            element: <MarketPage />,
          },
          {
            path: 'confirm',
            element: <ConfirmPage />,
          },
        ],
      },
      {
        path: '/search',
        element: <SearchPage />,
      },
      {
        path: '/signup',
        children: [
          {
            index: true,
            element: <SignUpPage />,
          },
          {
            path: 'success',
            element: <SignUpSuccessPage />,
          },
        ],
      },
      {
        path: '/tutorial',
        children: [
          {
            index: true,
            element: <Navigate to="/tutorial/select" replace />,
          },
          {
            path: 'select',
            element: <SelectPage />,
          },
          {
            path: 'simulate/:companyId',
            element: <SimulatePage />,
          },
        ],
      },
      {
        path: '/investment/simulate/:companyId',
        element: <SimulatedInvestmentPage />,
      },
      {
        path: '/test',
        element: <ChartContainer />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
  {
    path: 'error/permission-denied',
    element: <PermissionDeniedPage />,
  },
  {
    path: 'error/not-found',
    element: <NotFoundPage />,
  },
  {
    path: 'error/bad-gateway',
    element: <BadGatewayPage />,
  },
]);
