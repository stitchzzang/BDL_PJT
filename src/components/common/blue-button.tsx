import { Button } from '@/components/ui/button';

export const BlueButton = ({ children }: { children: React.ReactNode }) => {
  return (
    <Button
      variant="outline"
      className="border-none bg-primary-color text-text-main-color hover:bg-primary-color/20 hover:text-primary-color active:bg-primary-color/20 active:text-primary-color"
    >
      {children}
    </Button>
  );
};
