import { router } from '@/routes/router';

export const navigate = (path: string) => {
  router.navigate(path);
};
