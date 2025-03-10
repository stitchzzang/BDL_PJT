import { RouterProvider } from 'react-router-dom';

import { router } from '@/routes/router';

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
