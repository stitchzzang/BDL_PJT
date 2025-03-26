import { MainLogoIcon } from '@/components/common/icons';

export const Footer = () => {
  return (
    <footer className="mt-20 flex flex-col items-center justify-center">
      <hr className="w-full border-t border-[#48576D]" />
      <div className="my-20 flex w-full flex-col items-center justify-center">
        <MainLogoIcon className="h-40 w-40" color="white" />
        <p className="text-[#7A7A7A]">© 2025 B.LAB. All rights reserved.</p>
      </div>
    </footer>
  );
};
