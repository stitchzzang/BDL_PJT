import { ArrowPathIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/button';

export const ErrorScreen = () => {
  return (
    <div className="my-5 flex h-full w-full flex-col items-center justify-center gap-4">
      <p className="text-text-main-color">정보를 불러오는데 실패했습니다.</p>
      <Button variant="blue" onClick={() => window.location.reload()}>
        <ArrowPathIcon className="h-4 w-4" />
        새로고침
      </Button>
    </div>
  );
};
