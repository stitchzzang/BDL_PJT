import { createBrowserRouter } from 'react-router-dom';

import { AlgorithmLabLayout } from '@/layouts/AlgorithmLabLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { MemberLayout } from '@/layouts/MemberLayout';
import { ConfirmPage } from '@/routes/pages/algorithm-lab/ConfirmPage';
import { MarketPage } from '@/routes/pages/algorithm-lab/MarketPage';
import { MethodPage } from '@/routes/pages/algorithm-lab/MethodPage';
import { NamePage } from '@/routes/pages/algorithm-lab/NamePage';
import { StartPage } from '@/routes/pages/algorithm-lab/StartPage';
import { StylePage } from '@/routes/pages/algorithm-lab/StylePage';
import { HomePage } from '@/routes/pages/HomePage';
import { LoginPage } from '@/routes/pages/LoginPage';
import { MemberAlgorithmPage } from '@/routes/pages/MemberAlgorithmPage';
import { MemberEditPage } from '@/routes/pages/MemberEditPage';
import { MemberInvestmentPage } from '@/routes/pages/MemberInvestmentPage';
import { MemberPasswordEditPage } from '@/routes/pages/MemberPasswordEditPage';
import { MemberStockResultPage } from '@/routes/pages/MemberStockResultPage';
import { NotFoundPage } from '@/routes/pages/NotFoundPage';
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
            element: <MemberStockResultPage />,
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
        element: <SignUpPage />,
      },
      {
        path: '/signup-success',
        element: <SignUpSuccessPage />,
      },
      {
        path: '/tutorial',
        children: [
          {
            path: 'select',
            element: <SelectPage />,
          },
          {
            path: 'simulate',
            element: <SimulatePage />,
          },
        ],
      },
      {
        path: '/simulated-investment',
        element: <SimulatedInvestmentPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
