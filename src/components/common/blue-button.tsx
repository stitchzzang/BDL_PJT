import { Button } from '@/components/ui/button';

export const BlueButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <Button
      variant="outline"
      className="border-none bg-primary-color text-text-main-color hover:bg-primary-color/20 hover:text-primary-color active:bg-primary-color/20 active:text-primary-color"
      onClick={onClick}
    >
      {children}
    </Button>
  );
};
