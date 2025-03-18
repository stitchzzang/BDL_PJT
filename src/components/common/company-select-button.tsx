import { CompanyInfo } from '@/components/common/company-info';

export const CompanySelectButton = () => {
  return (
    <button className="min-h-[60px] min-w-[200px] rounded-[20px] border border-btn-primary-inactive-color bg-modal-background-color p-5 hover:bg-transparent active:bg-transparent sm:min-w-[600px]">
      <CompanyInfo />
    </button>
  );
};
