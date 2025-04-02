import { useEffect, useState } from 'react';

import { CompanyInfo, OrderbookDatas } from '@/api/types/stock';
import { ChartLoadingAnimation } from '@/components/common/chart-loading-animation';
import { SellingPriceSell } from '@/components/mock-investment/selling-price/selling-price-sell';
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
        <div className="flex flex-col items-center justify-center">
          <ChartLoadingAnimation />
          <p className="text-[16px] text-border-color">현재 장 시간이 아닙니다.</p>
        </div>
      )}
    </div>
  );
};
