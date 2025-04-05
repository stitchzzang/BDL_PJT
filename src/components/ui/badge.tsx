import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md p-3 text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        yellow:
          'border-transparent bg-btn-yellow-color text-text-main-color shadow hover:bg-btn-yellow-color/80',
        outline: 'text-foreground',
        main: 'bg-modal-background-color text-primary-foreground',
        increase: 'bg-btn-red-color/10',
        decrease: 'bg-btn-blue-color/10',
        zero: 'bg-btn-primary-active-color/10',
        'increase-flash': 'bg-btn-red-color/50',
        'decrease-flash': 'bg-btn-blue-color/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
