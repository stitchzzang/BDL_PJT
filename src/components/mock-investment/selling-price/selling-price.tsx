import { useEffect, useState } from 'react';

import { OrderbookData } from '@/api/types/stock';
import { ChartLoadingAnimation } from '@/components/common/chart-loading-animation';
import { SellingPriceSell } from '@/components/mock-investment/selling-price/selling-price-sell';
import { useOrderbookConnection } from '@/services/SocketStockOrderbookDataService';

export interface orderBook {
  price: number;
  quantity: number;
}
export interface orderBookData {
  ask: orderBook[];
  bid: orderBook[];
}
// 더미데이터
const orderBookDummy: orderBookData = {
  ask: [
    { price: 50200, quantity: 15 },
    { price: 50150, quantity: 32 },
    { price: 50100, quantity: 21 },
    { price: 50050, quantity: 40 },
    { price: 50000, quantity: 10 },
  ],
  bid: [
    { price: 49950, quantity: 12 },
    { price: 49900, quantity: 25 },
    { price: 49850, quantity: 18 },
    { price: 49800, quantity: 30 },
    { price: 49750, quantity: 20 },
  ],
};
export const SellingPrice = () => {
  // 소켓 연결
  const { IsConnected, connectOrderbook, disconnectOrderbook } = useOrderbookConnection();
  const [orderbookData, setOrderbookData] = useState<OrderbookData | null>(null);

  useEffect(() => {
    // 소켓 연결
    connectOrderbook('000660', setOrderbookData);
    return () => {
      disconnectOrderbook();
    };
  }, [connectOrderbook, disconnectOrderbook]);
  return (
    <div className="h-full rounded-2xl bg-modal-background-color p-[20px]">
      {orderbookData ? (
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
            <SellingPriceSell orderBookDummy={orderBookDummy} />
          </div>
        </>
      ) : (
        <ChartLoadingAnimation />
      )}
    </div>
  );
};
