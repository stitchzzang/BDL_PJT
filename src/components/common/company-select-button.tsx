import { CompanyIdentifier } from '@/components/common/company-identifier';

export const CompanySelectButton = () => {
  return (
    <button className="min-h-[60px] min-w-[200px] rounded-[10px] border border-btn-primary-inactive-color bg-modal-background-color p-2 hover:bg-transparent active:bg-transparent sm:min-w-[600px]">
      <CompanyIdentifier />
    </button>
  );
};
