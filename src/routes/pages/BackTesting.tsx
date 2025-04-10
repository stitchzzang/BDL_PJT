import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useBackTestAlgorithm } from '@/api/algorithm.api';
import { CompanyProfile, DailyData, StockDailyData, Summary } from '@/api/types/algorithm';
import { CandlestickAlgorithmChart } from '@/components/algorithm/algorithm-chart';
import { AlgorithmCompanyInfo } from '@/components/algorithm/algorithm-company-info';
import { AlgorithmSummary } from '@/components/algorithm/algorithm-summary';
import { BackTestResultList } from '@/components/algorithm/backtest-result-list';
import AssetComparisonChart from '@/components/algorithm/userCostChangeChart';
import { AirplaneAnimation } from '@/components/common/airplane-animation';
import { Button } from '@/components/ui/button';
import { Lanyard } from '@/components/ui/lanyard';

export const BackTesting = () => {
  // url 파라미터 값 가져오기
  const { algorithmId, companyId } = useParams();
  const navigate = useNavigate();

  // 모든 훅 호출을 최상단에 배치
  const [isValidParams, setIsValidParams] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true); // 로딩 상태 추가
  const didMount = useRef(false);

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
  const [dayChart, setDayChart] = useState<DailyData[] | null>(null);
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

  // API Hook 호출 - 모든 훅은 조건부 렌더링 이전에 호출되어야 함
  const backTestAlgorithm = useBackTestAlgorithm();

  // algorithmId와 companyId를 안전하게 숫자로 변환
  const algorithmIdNum = Number(algorithmId);
  const companyIdNum = Number(companyId);

  // 파라미터 유효성 검사 - mount 시에만 한 번 실행
  useEffect(() => {
    // didMount가 true이면 이미 실행된 것이므로 중복 실행 방지
    if (didMount.current) return;
    didMount.current = true;

    // 파라미터 유효성 검사
    if (
      isNaN(algorithmIdNum) ||
      !Number.isInteger(algorithmIdNum) ||
      algorithmIdNum <= 0 ||
      isNaN(companyIdNum) ||
      !Number.isInteger(companyIdNum) ||
      companyIdNum <= 0
    ) {
      setIsValidParams(false);
      // 즉시 리다이렉트
      navigate('/error/not-found');
    }
  }, [algorithmId, companyId, navigate, algorithmIdNum, companyIdNum]);

  // 백테스팅 자료 요청
  const handleBackTest = () => {
    // 유효성 검사 후 실행
    if (!isValidParams) return;

    setIsLoading(true); // 로딩 시작

    // 현재 날짜 가져오기
    const today = new Date();

    // 끝 날짜를 어제로 설정
    const endDate = new Date(today);
    endDate.setDate(today.getDate() - 1);

    // 시작 날짜를 끝 날짜의 1년 전으로 설정
    const startDate = new Date(endDate);
    startDate.setFullYear(endDate.getFullYear() - 1);

    // 날짜를 'YYYY-MM-DD' 형식으로 변환
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    backTestAlgorithm.mutate(
      {
        algorithmId: algorithmIdNum,
        companyId: companyIdNum,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      },
      {
        onSuccess: (res) => {
          // 하루 정보
          setDay(res.dailyData);
          setDayChart(res.dailyData);
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
          setIsLoading(false); // 로딩 완료
        },
        onError: (error: any) => {
          console.error('[BackTesting] API 요청 오류:', error);
          // API 오류 발생 시 404 페이지로 리다이렉트
          navigate('/error/not-found');
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
      setDayChart(saveDay.slice(0, newValue));
    }
  };

  // 모든 useEffect는 조건부 렌더링 이전에 호출되어야 함
  useEffect(() => {
    if (saveDailyData && saveDay) {
      setDailyData(saveDailyData.slice(0, clickNumber));
      setDayChart(saveDay.slice(0, clickNumber));
      // setDay(saveDay.slice(0, clickNumber));
    }
  }, [clickNumber, saveDailyData, saveDay]);

  // 컴포넌트 언마운트 시 애니메이션 정리
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 처음 마운트 시 백테스트 호출
  useEffect(() => {
    if (isValidParams) {
      handleBackTest();
    }
  }, [isValidParams]);

  // 애니메이션 시작 함수(마운트시 -> 10초동안 시뮬레이션 시작)
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
          setDayChart(saveDay.slice(0, newValue));
        }

        // 다음 프레임 요청
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // 애니메이션 완료
        setCurrentNumber(maxNumber);
        if (saveDailyData && saveDay) {
          setDailyData(saveDailyData.slice(0, maxNumber));
          setDay(saveDay.slice(0, maxNumber));
          setDayChart(saveDay.slice(0, maxNumber));
        }
        setProgress(100);
        setIsRunning(false);
        setShowSummary(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // 마이페이지 이동
  const handleMoveMypage = () => {
    navigate(`/member/algorithm`);
  };

  // 유효하지 않은 파라미터인 경우 아무것도 렌더링하지 않음 (모든 훅 호출 이후에 조건부 반환)
  if (!isValidParams || isLoading) {
    return null;
  }

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
                <div className="mt-2 flex w-full flex-col items-center gap-2 border-b border-border-color border-opacity-40 p-2 px-4">
                  <div className="mb-3 mt-3 flex flex-col rounded-xl bg-btn-yellow-color bg-opacity-20 p-6">
                    <div className="mb-2">
                      <h1 className="text-[22px] font-bold text-btn-yellow-color">제한 사항</h1>
                    </div>
                    <div>
                      <p>
                        <span className="opacity-60">1. 단순화된 가정: </span>
                        실제 거래와 달리 거래{' '}
                        <span className="text-btn-yellow-color">
                          {' '}
                          수수료, 세금, 슬리피지 등이 고려되지 않았습니다.
                        </span>
                      </p>
                      <p>
                        <span className="opacity-60">2. 이상적인 거래 환경: </span>
                        모든 거래가 원하는 가격에{' '}
                        <span className="text-btn-yellow-color">즉시 체결된다고</span> 가정합니다.
                      </p>
                      <p>
                        <span className="opacity-60">3. 제한된 매매 조건: </span>
                        실제 알고리즘 트레이딩에서 사용되는{' '}
                        <span className="text-btn-yellow-color">
                          복잡한 매매 조건(기술적 지표 등)이 포함되지 않았
                        </span>
                        습니다.
                      </p>
                    </div>
                  </div>
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
          <div className="mb-2 mt-4 flex animate-fadeIn justify-between gap-2 rounded-xl bg-modal-background-color p-2 duration-1000">
            <div className="flex w-[100%] items-center">
              <input
                type="range"
                min={1}
                max={saveDailyData ? saveDailyData.length : 100}
                value={maxNumber}
                onChange={handleSliderChange}
                className="h-2 w-full cursor-pointer"
              />
            </div>
            <div>
              <Button variant={'red'} size={'sm'} onClick={() => handleMoveMypage()}>
                테스트 종료
              </Button>
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
              {dayChart ? (
                <AssetComparisonChart
                  initialAsset={10000000}
                  changingAssets={dayChart}
                  isRunning={isRunning}
                />
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
      <style>
        {`
        /* 슬라이더 스타일 */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 25px;
          background: linear-gradient(to right, #3b82f6, #06b6d4);
          border-radius: 5px;
          outline: none;
        }

        /* 슬라이더 핸들(손잡이) 스타일 */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
        `}
      </style>
    </div>
  );
};
