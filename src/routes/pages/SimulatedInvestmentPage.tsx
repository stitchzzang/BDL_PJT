import { OrderStatus } from '@/components/mock-investment/order-status/order-status';
import { SellingPrice } from '@/components/mock-investment/selling-price/selling-price';
import { StockCostHistory } from '@/components/mock-investment/stock-cost-history/stock-cost-history';
import { StockInfo } from '@/components/mock-investment/stock-info/stock-info';
import { StockInfoDetail } from '@/components/mock-investment/stock-info-detail/stock-info-detail';
import ChartComponent from '@/components/ui/chart';
import { dummyChartData } from '@/lib/dummy-data';

export const SimulatedInvestmentPage = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <div>
        <div>
          <StockInfo />
        </div>
        <div>
          <div>
            <p>차트</p>
          </div>
          <div>
            <p>오늘 날짜</p>
            <div>
              <p>2023:02:12</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-[20px] grid grid-cols-10 gap-5">
        <div className="col-span-8">
          <ChartComponent data={dummyChartData} height={600} />
        </div>
        <div className="col-span-2">
          <OrderStatus />
        </div>
      </div>
      <div className="grid grid-cols-10 gap-5">
        <div className="col-span-4">
          <StockCostHistory />
        </div>
        <div className="col-span-4">
          <StockInfoDetail />
        </div>
        <div className="col-span-2">
          <SellingPrice />
        </div>
      </div>
    </div>
  );
};
