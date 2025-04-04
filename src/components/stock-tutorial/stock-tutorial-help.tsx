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
      variant="ghost"
      className={cn(
        'flex h-8 w-auto items-center justify-center gap-1.5 rounded-full bg-[#2D2D2D] px-3 py-0 text-xs font-medium text-white hover:bg-[#2D2D2D]/80',
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <InformationCircleIcon className="h-4 w-4" />
      <span>도움말</span>
    </Button>
  );
};
