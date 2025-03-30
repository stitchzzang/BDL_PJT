import { useNavigate } from 'react-router-dom';
import { Company } from '@/api/types/category';

interface CompanySelectButtonProps {
  company: Company;
}

export const CompanySelectButton = ({ company }: CompanySelectButtonProps) => {
  const navigate = useNavigate();

  const handleCompanySelect = () => {
    navigate(`/tutorial/simulation/${company.companyId}`);
  };

  return (
    <button
      className="min-h-[60px] min-w-[200px] rounded-[20px] border border-btn-primary-inactive-color bg-modal-background-color p-5 hover:bg-transparent active:bg-transparent sm:min-w-[600px]"
      onClick={handleCompanySelect}
    >
      <div className="flex flex-row items-center gap-4">
        <img
          src={company.companyImage || 'https://placehold.co/50x50'}
          alt={`${company.companyName}-logo`}
          className="h-[50px] w-[50px] rounded-xl"
        />
        <p className="text-base">{company.companyName}</p>
      </div>
    </button>
  );
};
