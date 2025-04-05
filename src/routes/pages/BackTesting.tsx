import { useState } from 'react';

import { useBackTestAlgorithm } from '@/api/algorithm.api';
import { CompanyProfile } from '@/api/types/algorithm';
import { AlgorithmCompanyInfo } from '@/components/algorithm/algorithm-company-info';

export const BackTesting = () => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const backTestAlgorithm = useBackTestAlgorithm();
  const handleBackTest = () => {
    console.log('cool!!!');
    backTestAlgorithm.mutate(
      {
        algorithmId: 20, // 실제 알고리즘 ID로 변경
        companyId: 1, // 실제 회사 ID로 변경
        startDate: '2024-01-01',
        endDate: '2025-01-01',
      },
      {
        onSuccess: (res) => {
          setCompanyProfile(res.companyProfile);
          console.log(res);
        },
      },
    );
  };
  return (
    <div className="w-full px-6">
      <div className="">
        <AlgorithmCompanyInfo companyProfile={companyProfile} />
      </div>
      <div>
        <button onClick={() => handleBackTest()}>test</button>
      </div>
    </div>
  );
};
