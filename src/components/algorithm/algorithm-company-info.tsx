import { CompanyProfile } from '@/api/types/algorithm';

interface AlgorithmCompanyInfoProps {
  companyProfile: CompanyProfile | null;
}

export const AlgorithmCompanyInfo = ({ companyProfile }: AlgorithmCompanyInfoProps) => {
  return (
    <div className="border">
      <div>{companyProfile ? <p>{companyProfile.companyName}</p> : <p>no Data</p>}</div>
    </div>
  );
};
