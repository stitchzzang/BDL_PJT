import { SearchedCompanyResponse } from '@/api/types/home';

export const CompanySelectButton = ({ company }: { company: SearchedCompanyResponse }) => {
  return (
    <button className="min-h-[60px] min-w-[200px] rounded-[20px] border border-btn-primary-inactive-color bg-modal-background-color p-5 hover:bg-transparent active:bg-transparent sm:min-w-[600px]">
      <div className="flex flex-row items-center gap-4">
        <img
          src={company.companyImage}
          alt="company-identifier"
          className="h-[50px] w-[50px] rounded-xl"
        />
        <p className="text-base">{company.companyName}</p>
      </div>
    </button>
  );
};
