import { useEffect, useState } from 'react';

import { useBackTestAlgorithm } from '@/api/algorithm.api';
import { CompanyProfile, StockDailyData } from '@/api/types/algorithm';
import { CandlestickAlgorithmChart } from '@/components/algorithm/algorithm-chart';
import { AlgorithmCompanyInfo } from '@/components/algorithm/algorithm-company-info';

export const BackTesting = () => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  // 출력 봉
  const [dailyData, setDailyData] = useState<StockDailyData[] | null>(null);
  // 전체 봉 저장
  const [saveDailyData, setSaveDailyData] = useState<StockDailyData[] | null>(null);
  // 전체 봉 개수
  const [dailyCount, setDailyCount] = useState<number>(0);
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
          setDailyData(res.stockDaily.data);
          setSaveDailyData(res.stockDaily.data);
          setDailyCount(res.stockDaily.limit);
          console.log(res);
        },
      },
    );
  };

  const handlerDay = (now: number) => {
    if (dailyData) {
      setDailyData(dailyData.slice(0, now));
    }
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
        <div>
          <p>전체 일자 : {dailyCount}</p>
        </div>
        <CandlestickAlgorithmChart data={dailyData} />
      </div>
      <div>
        <button onClick={() => handlerDay(100)}>클릭</button>
      </div>
    </div>
  );
};
