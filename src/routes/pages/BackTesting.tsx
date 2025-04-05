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
  // 현재 슬라이더 값
  const [sliderValue, setSliderValue] = useState<number>(100);

  const backTestAlgorithm = useBackTestAlgorithm();

  // 시간 변수
  const [currentNumber, setCurrentNumber] = useState<number>(0); // 현재 표시되는 숫자
  const [isRunning, setIsRunning] = useState<boolean>(false); // 카운터 실행 상태
  const [isPaused, setIsPaused] = useState<boolean>(false); // 일시정지 상태
  const [progress, setProgress] = useState<number>(0); // 진행률 (0-100%)
  const [maxNumber, setMaxNumber] = useState<number>(0); // 전체 길이
  const [updateInterval, setUpdateInterval] = useState<number>(0); // 숫자 업데이트 간격
  const totalDuration = 10000; // 총 실행 시간 (10초, 밀리초 단위)

  useEffect(() => {
    // maxNumber가 변경될 때마다 updateInterval 업데이트
    if (maxNumber > 0) {
      setUpdateInterval(totalDuration / maxNumber);
    }
  }, [maxNumber, totalDuration]);

  // 백테스팅 자료 요청
  const handleBackTest = () => {
    backTestAlgorithm.mutate(
      {
        algorithmId: 20, // 파라미터로 전달
        companyId: 2, // 파라미터로 전달
        startDate: '2024-01-01',
        endDate: '2025-01-01',
      },
      {
        onSuccess: (res) => {
          setCompanyProfile(res.companyProfile);
          // 초기에는 전체 데이터 표시
          setDailyData(res.stockDaily.data);
          setSaveDailyData(res.stockDaily.data);
          setDailyCount(res.stockDaily.limit);
          // 초기 슬라이더 값을 데이터 길이로 설정
          setMaxNumber(res.stockDaily.data.length);
          console.log(res);
        },
      },
    );
  };

  // 슬라이더 변경 핸들러
  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    setMaxNumber(newValue);

    if (saveDailyData) {
      // 항상 원본 데이터(saveDailyData)에서 슬라이싱
      setDailyData(saveDailyData.slice(0, newValue));
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
        <div className="mb-4 flex items-center">
          <p>현재 표시: {maxNumber}일</p>
        </div>

        {/* 차트 영역 */}
        <CandlestickAlgorithmChart data={dailyData} />

        {/* 슬라이더 영역 */}
        <div className="mt-4">
          <div className="flex items-center">
            <span className="mr-2">0</span>
            <input
              type="range"
              min={1}
              max={saveDailyData ? saveDailyData.length : 100}
              value={maxNumber}
              onChange={handleSliderChange}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            />
            <span className="ml-2">{saveDailyData ? saveDailyData.length : 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
