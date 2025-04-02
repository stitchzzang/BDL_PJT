import { useEffect, useState } from 'react';

import { HomeCompanyRankData } from '@/api/types/home';
import { ChartLoadingAnimation } from '@/components/common/chart-loading-animation';
import { useRankRiseFallConnection } from '@/services/SocketHomeRankRiseFall';
export interface StockRise {
  stockName: string;
  currentPrice: number;
  changeRate: number;
  imageUrl: string | null;
}

type HomeCompanyRankDataList = HomeCompanyRankData[];

export const RealTimeChartRise = () => {
  // 랜더링 정보
  const [rankVolume, setRankVolume] = useState<HomeCompanyRankDataList | null>(null);
  const { IsConnected, connectRankRiseFall, disconnectRankRiseFall } =
    useRankRiseFallConnection('high');

  useEffect(() => {
    // 소켓 연결
    connectRankRiseFall(setRankVolume);
    return () => {
      disconnectRankRiseFall();
    };
  }, [connectRankRiseFall, disconnectRankRiseFall]);
  return (
    <div>
      <div className="w-full">
        <div className="!mt-0 flex flex-col">
          <div>{/* 실시간, 일별 */}</div>
          <div className="flex flex-col space-y-2">
            {/* 테이블 헤더 */}
            <div className="rounded-lgp-2 flex flex-row">
              <div className="w-[60%] text-[14px] text-border-color">종목</div>
              <div className="w-[20%] text-right text-[14px] text-border-color">현재가</div>
              <div className="w-[20%] text-right text-[14px]  text-btn-blue-color">
                등락률 높은 순
              </div>
            </div>

            {/* 테이블 로우들 - 배열의 각 항목을 매핑 */}
            {rankVolume ? (
              <>
                {rankVolume.map((rankVolumeData: HomeCompanyRankData, index: number) => (
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
                    {/* <div className="w-[20%] text-right">
                                {addCommasToThousand(rankVolumeData.currentPrice)} 원
                              </div>
                              <div className="w-[20%] text-right text-btn-red-color">
                                {rankVolumeData.changeRate}%
                              </div>
                              <div className="w-[20%] text-right font-light text-border-color">
                                {formatKoreanMoney(rankVolumeData.tradingValue)} 원
                              </div> */}
                  </div>
                ))}
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
