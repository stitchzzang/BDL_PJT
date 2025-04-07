import { useEffect, useRef, useState } from 'react';

import { useBackTestAlgorithm } from '@/api/algorithm.api';
import { CompanyProfile, DailyData, StockDailyData, Summary } from '@/api/types/algorithm';
import { CandlestickAlgorithmChart } from '@/components/algorithm/algorithm-chart';
import { AlgorithmCompanyInfo } from '@/components/algorithm/algorithm-company-info';
import { AlgorithmSummary } from '@/components/algorithm/algorithm-summary';
import { BackTestResultList } from '@/components/algorithm/backtest-result-list';
import AssetComparisonChart from '@/components/algorithm/userCostChangeChart';
import { AirplaneAnimation } from '@/components/common/airplane-animation';
import { Lanyard } from '@/components/ui/lanyard';

export const BackTesting = () => {
  // 스크롤 기능 랜더링 유무 변수
  const [showInfo, setShowInfo] = useState<boolean>(false);
  // 결과 렌더링 유무
  const [showSummary, setShowSummary] = useState<boolean>(true);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  // 출력 봉
  const [dailyData, setDailyData] = useState<StockDailyData[] | null>(null);
  // 전체 봉 저장
  const [saveDailyData, setSaveDailyData] = useState<StockDailyData[] | null>(null);
  // 전체 봉 개수
  const [dailyCount, setDailyCount] = useState<number>(0);
  // 하루 정보
  const [saveDay, setSaveDay] = useState<DailyData[] | null>(null);
  const [day, setDay] = useState<DailyData[] | null>(null);
  // 결과 정보
  const [summary, setSummary] = useState<Summary | null>(null);

  // 시간 관련 변수
  const [currentNumber, setCurrentNumber] = useState<number>(0); // 현재 표시되는 숫자
  const [maxNumber, setMaxNumber] = useState<number>(0); // 전체 길이
  const [clickNumber, setClickNumber] = useState<number>(0);
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
          // 하루 정보
          setDay(res.dailyData);
          setSaveDay(res.dailyData);
          setCompanyProfile(res.companyProfile);
          // 결과 정보
          setSummary(res.summary);
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

    if (saveDailyData && saveDay) {
      // 항상 원본 데이터(saveDailyData)에서 슬라이싱
      setDailyData(saveDailyData.slice(0, newValue));
      setDay(saveDay.slice(0, newValue));
    }
  };
  useEffect(() => {
    if (saveDailyData && saveDay) {
      setDailyData(saveDailyData.slice(0, clickNumber));
      // setDay(saveDay.slice(0, clickNumber));
    }
  }, [clickNumber]);

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
      setShowInfo(true);

      if (elapsedTime < totalDuration) {
        // 진행률 계산 (0-100%)
        const progressPercent = Math.min((elapsedTime / totalDuration) * 100, 100);
        setProgress(progressPercent);

        // 현재 값 계산 (0부터 maxNumber까지)
        const newValue = Math.floor((maxNumber * elapsedTime) / totalDuration);
        setCurrentNumber(newValue);

        // 데이터 업데이트
        if (saveDailyData && saveDay) {
          setDailyData(saveDailyData.slice(0, newValue));
          setDay(saveDay.slice(0, newValue));
        }

        // 다음 프레임 요청
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // 애니메이션 완료
        setCurrentNumber(maxNumber);
        if (saveDailyData && saveDay) {
          setDailyData(saveDailyData.slice(0, maxNumber));
          setDay(saveDay.slice(0, maxNumber));
        }
        setProgress(100);
        setIsRunning(false);
        setShowSummary(false);
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
      <div className="">
        <div className="mb-4 flex items-center justify-center">
          <div className="mt-2 w-full">
            {!isRunning && !showInfo ? (
              <>
                <div className="mt-2 flex w-full flex-col items-center gap-2 rounded-xl border border-border-color border-opacity-40 p-2 px-4">
                  <button
                    onClick={startAnimation}
                    className="rounded bg-blue-500 px-4 py-2 text-white"
                  >
                    테스트 시작
                  </button>
                  <p className="text-[14px] text-border-color">
                    테스트 시작 버튼을 클릭하여 알고리즘을 테스트 해보세요!
                  </p>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        {/* 슬라이더 영역 */}
        {showSummary ? (
          <></>
        ) : (
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
        )}
      </div>
      {/* 차트 영역 */}
      {showInfo ? (
        <div className="animate-fadeIn duration-1000 ease-in-out">
          <div className="grid grid-cols-14 gap-1">
            <div className="col-span-9">
              <CandlestickAlgorithmChart data={dailyData} />
            </div>

            {/* 일자 히스토리 */}
            <div className="col-span-5">
              <BackTestResultList dailyData={day} setClickNumber={setClickNumber} />
            </div>
          </div>
          <div className="mt-1 grid grid-cols-14 gap-1">
            <div className="col-span-9">
              {day ? (
                <AssetComparisonChart initialAsset={10000000} changingAssets={day} />
              ) : (
                <div>no data</div>
              )}
            </div>
            <div className="col-span-5">
              {showSummary ? (
                <>
                  <div className="flex h-full flex-col items-center justify-center rounded-xl bg-modal-background-color">
                    <AirplaneAnimation />
                    <p className="animate-pulse text-btn-blue-color">결과를 기다리고 있습니다.</p>
                  </div>
                </>
              ) : (
                <div className="animate-fadeIn duration-1000 ease-in-out">
                  <AlgorithmSummary summary={summary} />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center justify-center">
            <Lanyard />
            <p className="animate-pulse text-btn-blue-color">테스트를 기다리고 있습니다.</p>
          </div>
        </>
      )}
    </div>
  );
};
