import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-point-color/30 [animation-duration:2s]',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
