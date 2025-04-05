import { useEffect, useState } from 'react';

import { useBackTestAlgorithm } from '@/api/algorithm.api';
import { CompanyProfile } from '@/api/types/algorithm';
import { AlgorithmCompanyInfo } from '@/components/algorithm/algorithm-company-info';

export const BackTesting = () => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const backTestAlgorithm = useBackTestAlgorithm();
  // 백테스팅 자료 요청
  const handleBackTest = () => {
    backTestAlgorithm.mutate(
      {
        algorithmId: 20, // 파라미터로 전달
        companyId: 1, // 파라미터로 전달
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
  useEffect(() => {
    handleBackTest();
  }, []);
  return (
    <div className="w-full px-6">
      <div className="">
        <AlgorithmCompanyInfo companyProfile={companyProfile} />
      </div>
      <div>
        <p>hello</p>
      </div>
    </div>
  );
};
