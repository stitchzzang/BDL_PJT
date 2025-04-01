import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/button';

interface StockTutorialHelpProps {
  onClick: () => void;
}

export const StockTutorialHelp = ({ onClick }: StockTutorialHelpProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="flex h-8 w-8 items-center justify-center rounded-full bg-background-color hover:bg-gray-700"
      onClick={onClick}
    >
      <QuestionMarkCircleIcon className="h-5 w-5 text-text-main-color" />
    </Button>
  );
};
