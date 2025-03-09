import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import MainPage from '@/routes/pages/MainPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
