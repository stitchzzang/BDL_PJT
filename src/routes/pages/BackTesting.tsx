import { useEffect, useRef, useState } from 'react';

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

  // 시간 관련 변수
  const [currentNumber, setCurrentNumber] = useState<number>(0); // 현재 표시되는 숫자
  const [maxNumber, setMaxNumber] = useState<number>(0); // 전체 길이
  const [isRunning, setIsRunning] = useState<boolean>(false); // 애니메이션 실행 상태
  const [progress, setProgress] = useState<number>(0); // 진행률 (0-100%)

  const totalDuration = 10000; // 총 실행 시간 (10초, 밀리초 단위)
  const animationRef = useRef<number | null>(null); // requestAnimationFrame의 ID 저장

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
          // 초기에는 전체 데이터 표시
          setDailyData(res.stockDaily.data);
          setSaveDailyData(res.stockDaily.data);
          setDailyCount(res.stockDaily.limit);
          // 초기 슬라이더 값을 데이터 길이로 설정
          setMaxNumber(res.stockDaily.data.length);
          // 현재 숫자를 0으로 초기화
          setCurrentNumber(0);
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

  // 애니메이션 시작 함수 - 간단한 버전
  const startAnimation = () => {
    if (isRunning) return; // 이미 실행 중이면 중복 실행 방지

    setIsRunning(true);
    setCurrentNumber(0); // 항상 0부터 시작
    setProgress(0);

    const startTime = Date.now();

    // 애니메이션 프레임 함수
    const animate = () => {
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime < totalDuration) {
        // 진행률 계산 (0-100%)
        const progressPercent = Math.min((elapsedTime / totalDuration) * 100, 100);
        setProgress(progressPercent);

        // 현재 값 계산 (0부터 maxNumber까지)
        const newValue = Math.floor((maxNumber * elapsedTime) / totalDuration);
        setCurrentNumber(newValue);

        // 데이터 업데이트
        if (saveDailyData) {
          setDailyData(saveDailyData.slice(0, newValue));
        }

        // 다음 프레임 요청
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // 애니메이션 완료
        setCurrentNumber(maxNumber);
        if (saveDailyData) {
          setDailyData(saveDailyData.slice(0, maxNumber));
        }
        setProgress(100);
        setIsRunning(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // 컴포넌트 언마운트 시 애니메이션 정리
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    handleBackTest();
  }, []);

  return (
    <div className="w-full px-6">
      <div className="">
        <AlgorithmCompanyInfo companyProfile={companyProfile} />
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p>
            현재 표시: {currentNumber}일 / {maxNumber}일
          </p>
          {!isRunning && (
            <button onClick={startAnimation} className="rounded bg-blue-500 px-4 py-2 text-white">
              10초 재생
            </button>
          )}
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
