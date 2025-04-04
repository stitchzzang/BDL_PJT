import { useEffect, useRef, useState } from 'react';

import { useRankingVolume } from '@/api/home.api';
import { HomeCompanyRankData, HomeCompanyRankTradeData } from '@/api/types/home';
import { ChartLoadingAnimation } from '@/components/common/chart-loading-animation';
import { LoadingAnimation } from '@/components/common/loading-animation';
import { useRankTradeDataConnection } from '@/services/SocketHomeRankTradeData';
import { useRankVolumeConnection } from '@/services/SocketHomeRankVolume';
import { formatKoreanMoney } from '@/utils/numberFormatter';

type HomeCompanyRankDataList = HomeCompanyRankData[];

// 종목별 틱데이터를 저장할 타입 정의
type StockTickDataMap = {
  [stockCode: string]: {
    stckPrpr: number;
    changeRate: number;
    tradingValue?: number; // acmlTrPbm 값을 표시하기 위해
    priceChanged?: boolean; // 가격 변경 여부
    isIncreased?: boolean; // 가격 상승 여부
  };
};

// 숫자에 천 단위 콤마 추가 함수
const addCommasToThousand = (num: number | undefined): string => {
  if (num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const RealTimeChartTransaction = () => {
  // 초기 데이터
  const { data: VolumeFirstData, isLoading, isError } = useRankingVolume();
  // 랜더링 정보
  const [rankVolume, setRankVolume] = useState<HomeCompanyRankDataList | null>(null);
  const [tickData, setTickData] = useState<HomeCompanyRankTradeData | null>(null);

  // 각 종목별 최신 틱데이터를 저장하는 상태
  const [stockTickDataMap, setStockTickDataMap] = useState<StockTickDataMap>({});

  // 이전 틱데이터를 저장하는 ref (렌더링 트리거 없이 값 보존)
  const prevTickDataMapRef = useRef<StockTickDataMap>({});

  // 하이라이트 타이머를 저장할 맵
  const highlightTimersRef = useRef<{ [stockCode: string]: NodeJS.Timeout }>({});

  const { IsConnected, connectRankVolume, disconnectRankVolume } = useRankVolumeConnection();
  const { connectionRankTradeData, disconnectRankTradeData } = useRankTradeDataConnection();

  // 틱데이터가 업데이트될 때마다 해당 종목의 데이터를 stockTickDataMap에 저장
  useEffect(() => {
    if (tickData && tickData.stockCode) {
      setStockTickDataMap((prevMap) => {
        // 이전 가격 데이터 가져오기
        const prevStockData = prevMap[tickData.stockCode];
        const prevPrice = prevStockData?.stckPrpr;

        // 이전 가격과 현재 가격 비교하여 변화 감지
        const priceChanged = prevPrice !== undefined && prevPrice !== tickData.stckPrpr;
        const isIncreased = prevPrice !== undefined && tickData.stckPrpr > prevPrice;

        // 이전 맵에 현재 데이터 저장 (다음 비교용)
        prevTickDataMapRef.current = {
          ...prevTickDataMapRef.current,
          [tickData.stockCode]: {
            stckPrpr: tickData.stckPrpr,
            changeRate: tickData.changeRate,
            tradingValue: tickData.acmlTrPbm,
          },
        };

        // 이전 하이라이트 타이머가 있으면 제거
        if (highlightTimersRef.current[tickData.stockCode]) {
          clearTimeout(highlightTimersRef.current[tickData.stockCode]);
        }

        // 새 하이라이트 타이머 설정 (1.5초 후 하이라이트 제거)
        highlightTimersRef.current[tickData.stockCode] = setTimeout(() => {
          setStockTickDataMap((currentMap) => ({
            ...currentMap,
            [tickData.stockCode]: {
              ...currentMap[tickData.stockCode],
              priceChanged: false,
            },
          }));
        }, 1500);

        // 새 데이터 반환
        return {
          ...prevMap,
          [tickData.stockCode]: {
            stckPrpr: tickData.stckPrpr,
            changeRate: tickData.changeRate,
            tradingValue: tickData.acmlTrPbm,
            priceChanged: priceChanged,
            isIncreased: isIncreased,
          },
        };
      });
    }
  }, [tickData]);

  // 컴포넌트 언마운트시 모든 타이머 제거
  useEffect(() => {
    return () => {
      Object.values(highlightTimersRef.current).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  useEffect(() => {
    // 소켓 연결
    connectRankVolume(setRankVolume);
    connectionRankTradeData(setTickData);
    return () => {
      disconnectRankVolume();
      disconnectRankTradeData();
    };
  }, [connectRankVolume, disconnectRankVolume, connectionRankTradeData, disconnectRankTradeData]);

  if (isLoading) {
    return (
      <>
        <LoadingAnimation />
      </>
    );
  }

  return (
    <div>
      <div className="w-full animate-fadeIn">
        <div className="!mt-0 flex flex-col">
          <div>{/* 실시간, 일별 */}</div>
          <div className="flex flex-col space-y-2">
            {/* 테이블 헤더 */}
            <div className="rounded-lgp-2 flex flex-row">
              <div className="w-[40%] text-[14px] text-border-color">종목</div>
              <div className="w-[20%] text-right text-[14px] text-border-color">현재가</div>
              <div className="w-[20%] text-right text-[14px] text-border-color">등락률</div>
              <div className="w-[20%] text-right text-[14px] text-btn-blue-color">
                거래대금 많은 순
              </div>
            </div>

            {/* 테이블 로우들 - 배열의 각 항목을 매핑 */}
            {rankVolume ? (
              <>
                {rankVolume.map((rankVolumeData: HomeCompanyRankData, index: number) => {
                  // 해당 종목의 저장된 틱데이터 가져오기
                  const stockTick = stockTickDataMap[rankVolumeData.stockCode];

                  // 가격 변화에 따른 텍스트 색상 지정
                  let priceColor =
                    stockTick?.changeRate > 0
                      ? 'text-btn-red-color'
                      : stockTick?.changeRate < 0
                        ? 'text-btn-blue-color'
                        : '';

                  // 가격이 방금 변경되었으면 변경 하이라이트 색상 적용
                  if (stockTick?.priceChanged) {
                    priceColor = stockTick.isIncreased
                      ? 'text-btn-red-color font-bold animate-pulse'
                      : 'text-btn-blue-color font-bold animate-pulse';
                  }

                  return (
                    <div
                      key={index}
                      className="flex flex-row items-center rounded-lg bg-[#102038] p-2 px-3 text-white hover:bg-modal-background-color"
                    >
                      <div className="flex w-[40%] items-center gap-3 font-medium">
                        <h3 className="text-[18px] font-bold">{index + 1}</h3>
                        <div className="max-h-[50px] max-w-[50px] overflow-hidden rounded-xl">
                          {rankVolumeData.companyImage === null ? (
                            <img src="/none-img/none_stock_img.png" alt="noneimage" />
                          ) : (
                            <img src={rankVolumeData.companyImage} alt="stockprofileimage" />
                          )}
                        </div>
                        <h3 className="text-[16px] font-medium">{rankVolumeData.companyName}</h3>
                      </div>

                      {/* 현재가 */}
                      <div
                        className={`w-[20%] text-right transition-all duration-300 ${priceColor}`}
                      >
                        {stockTick
                          ? `${addCommasToThousand(stockTick.stckPrpr)} 원`
                          : VolumeFirstData && VolumeFirstData[index]
                            ? `${addCommasToThousand(VolumeFirstData[index].stckPrpr)} 원`
                            : '0 원'}
                      </div>

                      {/* 등락률 */}
                      <div
                        className={`w-[20%] text-right transition-all duration-300 ${priceColor}`}
                      >
                        {stockTick
                          ? `${stockTick.changeRate > 0 ? '+' : ''}${stockTick.changeRate.toFixed(2)}%`
                          : VolumeFirstData && VolumeFirstData[index]
                            ? `${VolumeFirstData[index].changeRate > 0 ? '+' : ''}${VolumeFirstData[index].changeRate.toFixed(2)}%`
                            : '0%'}
                      </div>

                      {/* 거래대금 */}
                      <div className="w-[20%] text-right font-light text-border-color">
                        {stockTick
                          ? `${formatKoreanMoney(stockTick.tradingValue ?? 0)} 원`
                          : VolumeFirstData && VolumeFirstData[index]
                            ? `${formatKoreanMoney(VolumeFirstData[index].acmlTrPbm)} 원`
                            : '0 원'}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                <ChartLoadingAnimation />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
