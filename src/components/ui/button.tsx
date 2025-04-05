import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        blue: 'hover:text-blue-color active:bg-blue-color/20 active:text-blue-color border-none bg-btn-blue-color text-text-main-color hover:bg-btn-blue-color/20',
        green:
          'border-none bg-btn-green-color text-text-main-color hover:bg-btn-green-color/20 hover:text-btn-green-color active:bg-btn-green-color/20 active:text-btn-green-color',
        yellow:
          'border-none bg-btn-yellow-color text-text-main-color hover:bg-btn-yellow-color/20 hover:text-btn-yellow-color active:bg-btn-yellow-color/20 active:text-btn-yellow-color',
        red: 'border-none bg-btn-red-color text-text-main-color hover:bg-btn-red-color/20 hover:text-btn-red-color active:bg-btn-red-color/20 active:text-btn-red-color',
        gray: 'border-none bg-btn-primary-active-color text-text-main-color hover:bg-btn-primary-inactive-color hover:text-text-inactive-3-color active:bg-btn-primary-inactive-color active:text-text-inactive-3-color',
        black:
          'border-none bg-background-color text-text-main-color hover:bg-primary-color active:bg-primary-color',
      },
      size: {
        default: 'min-h-9 px-4 py-2',
        sm: 'min-h-8 rounded-md px-3 text-xs',
        lg: 'min-h-10 rounded-md px-8 py-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
