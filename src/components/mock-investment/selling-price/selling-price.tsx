import { useEffect, useState } from 'react';

import { CompanyInfo, OrderbookDatas } from '@/api/types/stock';
import { SellingPriceSell } from '@/components/mock-investment/selling-price/selling-price-sell';
import { SparklesCore } from '@/components/ui/sparkles';
import { useOrderbookConnection } from '@/services/SocketStockOrderbookDataService';
interface SellingPrice {
  stockCompanyInfo?: CompanyInfo;
}

export const SellingPrice = ({ stockCompanyInfo }: SellingPrice) => {
  // 소켓 연결
  const { IsConnected, connectOrderbook, disconnectOrderbook } = useOrderbookConnection();
  const [orderbooks, setOrderbooks] = useState<OrderbookDatas | null>(null);

  useEffect(() => {
    // 소켓 연결
    if (stockCompanyInfo) {
      connectOrderbook(stockCompanyInfo?.companyCode, setOrderbooks);
    }
    return () => {
      disconnectOrderbook();
    };
  }, [connectOrderbook, disconnectOrderbook]);
  return (
    <>
      {orderbooks ? (
        <div className="h-full rounded-2xl bg-modal-background-color p-[20px]">
          <div className="flex justify-between">
            <h3 className="text-[14px] font-bold">호가</h3>
            {/* 장시간 string */}
            <p className="text-[14px] font-light text-border-color">12:32</p>
          </div>
          <div className="mt-2 flex justify-between">
            <p className="text-[14px] text-btn-blue-color">매도잔량</p>
            <p className="text-[14px] text-btn-red-color">매수잔량</p>
          </div>
          <hr className="mt-2 border-border-color border-opacity-20" />
          <div>
            <SellingPriceSell orderbooks={orderbooks} />
          </div>
        </div>
      ) : (
        <div className="relative h-full overflow-hidden rounded-2xl border border-border-color border-opacity-20 p-[20px]">
          <div className="absolute inset-0 h-full w-full">
            <SparklesCore
              id="sparkles1"
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleColor="#ffffff"
              particleDensity={70}
              className="h-full w-full"
            />
          </div>
          {/* <div className="flex items-center justify-center gap-4">
            <Lottie
              animationData={walkMove}
              loop={true}
              autoplay={true}
              style={{ height: 150, width: 150 }}
              rendererSettings={{
                preserveAspectRatio: 'xMidYMid slice',
              }}
            />
            <p className="text-[18px] text-border-color">
              현재 <span className="font-bold text-btn-blue-color">거래시간</span>이 아닙니다.
            </p>
          </div> */}
        </div>
      )}
    </>
  );
};
