import { useEffect, useState } from 'react';

import { OrderbookData } from '@/api/types/stock';
import { ChartLoadingAnimation } from '@/components/common/chart-loading-animation';
import { SellingPriceSell } from '@/components/mock-investment/selling-price/selling-price-sell';
import { useOrderbookConnection } from '@/services/SocketStockOrderbookDataService';

export const SellingPrice = () => {
  // 소켓 연결
  const { IsConnected, connectOrderbook, disconnectOrderbook } = useOrderbookConnection();
  const [orderbooks, setOrderbooks] = useState<OrderbookData | null>(null);

  useEffect(() => {
    // 소켓 연결
    connectOrderbook('000660', setOrderbooks);
    return () => {
      disconnectOrderbook();
    };
  }, [connectOrderbook, disconnectOrderbook]);
  return (
    <div className="h-full rounded-2xl bg-modal-background-color p-[20px]">
      {orderbooks ? (
        <>
          <div className="flex justify-between">
            <h3 className="text-[18px] font-bold">호가</h3>
            {/* 장시간 string */}
            <p className="text-[14px] font-light text-border-color">12:32</p>
          </div>
          <div className="mt-[20px] flex justify-between">
            <p className="text-[18px] text-btn-blue-color">매도잔량</p>
            <p className="text-[18px] text-btn-red-color">매수잔량</p>
          </div>
          <hr className="mt-[16px] border-border-color border-opacity-20" />
          <div>
            <SellingPriceSell orderbooks={orderbooks} />
          </div>
        </>
      ) : (
        <ChartLoadingAnimation />
      )}
    </div>
  );
};
