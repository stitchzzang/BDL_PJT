import { InformationCircleIcon } from '@heroicons/react/24/solid';
import React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StockTutorialHelpProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  onClick?: () => void;
}

export const StockTutorialHelp = ({ className, onClick, ...props }: StockTutorialHelpProps) => {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        'inline-flex h-8 items-center justify-center gap-1 rounded-full bg-[#2D2D2D] px-3 py-0 text-white hover:bg-[#2D2D2D]/90',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <InformationCircleIcon className="h-4 w-4" />
      <span className="text-xs">도움말</span>
    </Button>
  );
};
