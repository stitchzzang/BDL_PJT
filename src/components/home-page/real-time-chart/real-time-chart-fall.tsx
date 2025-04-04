import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useRankingChangeRate } from '@/api/home.api';
import { HomeCompanyRankData, HomeCompanyRankTradeData } from '@/api/types/home';
import { ChartLoadingAnimation } from '@/components/common/chart-loading-animation';
import { useRankRiseFallConnection } from '@/services/SocketHomeRankRiseFall';
import { useRankRiseTradeDataConnection } from '@/services/SocketHomeRankRiseTradeData';

type HomeCompanyRankDataList = HomeCompanyRankData[];

// 종목별 틱데이터를 저장할 타입 정의
type StockTickDataMap = {
  [stockCode: string]: {
    stckPrpr: number;
    changeRate: number;
    tradingValue?: number; // acmlTrPbm 값을 표시하기 위해
  };
};

// 숫자에 천 단위 콤마 추가 함수
const addCommasToThousand = (num: number | undefined): string => {
  if (num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const RealTimeChartFall = () => {
  const navigate = useNavigate();
  // 초기 데이터
  const { data: ChangeRateFirstData, isLoading, isError } = useRankingChangeRate('low');
  // 랜더링 정보
  const [rankVolume, setRankVolume] = useState<HomeCompanyRankDataList | null>(null);
  const [tickData, setTickData] = useState<HomeCompanyRankTradeData | null>(null);

  // 각 종목별 최신 틱데이터를 저장하는 상태
  const [stockTickDataMap, setStockTickDataMap] = useState<StockTickDataMap>({});

  const { IsConnected, connectRankRiseFall, disconnectRankRiseFall } =
    useRankRiseFallConnection('low');
  const { connectionRankRiseTradeData, disconnectRankRiseTradeData } =
    useRankRiseTradeDataConnection('low');

  // 틱데이터가 업데이트될 때마다 해당 종목의 데이터를 stockTickDataMap에 저장
  useEffect(() => {
    if (tickData && tickData.stockCode) {
      setStockTickDataMap((prevMap) => ({
        ...prevMap,
        [tickData.stockCode]: {
          stckPrpr: tickData.stckPrpr,
          changeRate: tickData.changeRate,
          tradingValue: tickData.acmlTrPbm,
        },
      }));
    }
  }, [tickData]);

  useEffect(() => {
    // 소켓 연결
    connectRankRiseFall(setRankVolume);
    connectionRankRiseTradeData(setTickData);
    return () => {
      disconnectRankRiseFall();
      disconnectRankRiseTradeData();
    };
  }, [
    connectRankRiseFall,
    disconnectRankRiseFall,
    connectionRankRiseTradeData,
    disconnectRankRiseTradeData,
  ]);

  return (
    <div>
      <div className="w-full animate-fadeIn">
        <div className="!mt-0 flex flex-col">
          <div>{/* 실시간, 일별 */}</div>
          <div className="flex flex-col space-y-2">
            {/* 테이블 헤더 */}
            <div className="rounded-lgp-2 flex flex-row">
              <div className="w-[60%] text-[14px] text-border-color">종목</div>
              <div className="w-[20%] text-right text-[14px] text-border-color">현재가</div>
              <div className="w-[20%] text-right text-[14px] text-btn-blue-color">
                등락률 낮은 순
              </div>
            </div>

            {/* 테이블 로우들 - 배열의 각 항목을 매핑 */}
            {rankVolume ? (
              <>
                {rankVolume.map((rankVolumeData: HomeCompanyRankData, index: number) => {
                  // 해당 종목의 저장된 틱데이터 가져오기
                  const stockTick = stockTickDataMap[rankVolumeData.stockCode];

                  // 가격 변화에 따른 텍스트 색상 지정
                  const priceColor =
                    stockTick?.changeRate > 0
                      ? 'text-btn-red-color'
                      : stockTick?.changeRate < 0
                        ? 'text-btn-blue-color'
                        : 'text-btn-blue-color';

                  return (
                    <div
                      key={index}
                      className="flex flex-row items-center rounded-lg bg-[#102038] p-2 px-3 text-white hover:bg-modal-background-color"
                    >
                      <div className="flex w-[60%] items-center gap-3 font-medium">
                        <h3 className="text-[18px] font-bold">{index + 1}</h3>
                        <button
                          className="flex flex-row items-center gap-2"
                          onClick={() => {
                            navigate(`/investment/simulate/${rankVolumeData.companyId}`);
                          }}
                        >
                          <div className="max-h-[50px] max-w-[50px] overflow-hidden rounded-xl">
                            {rankVolumeData.companyImage === null ? (
                              <img src="/none-img/none_stock_img.png" alt="noneimage" />
                            ) : (
                              <img src={rankVolumeData.companyImage} alt="stockprofileimage" />
                            )}
                          </div>
                          <h3
                            className="text-[16px] font-medium hover:underline"
                            onClick={() => {
                              navigate(`investment/simulate/${rankVolumeData.companyId}`);
                            }}
                          >
                            {rankVolumeData.companyName}
                          </h3>
                        </button>
                      </div>

                      {/* 현재가 */}
                      <div className={`w-[20%] text-right ${priceColor}`}>
                        {stockTick
                          ? `${addCommasToThousand(stockTick.stckPrpr)} 원`
                          : ChangeRateFirstData && ChangeRateFirstData[index]
                            ? `${addCommasToThousand(ChangeRateFirstData[index].stckPrpr)} 원`
                            : '0 원'}
                      </div>

                      {/* 등락률 */}
                      <div className={`w-[20%] text-right ${priceColor}`}>
                        {stockTick
                          ? `${stockTick.changeRate.toFixed(2)}%`
                          : ChangeRateFirstData && ChangeRateFirstData[index]
                            ? `${ChangeRateFirstData[index].changeRate.toFixed(2)}%`
                            : '0%'}
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
