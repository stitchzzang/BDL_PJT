import { SellingPrice } from '@/components/mock-investment/selling-price/selling-price';
import { StockCostHistory } from '@/components/mock-investment/stock-cost-history/stock-cost-history';
import { StockInfo } from '@/components/mock-investment/stock-info/stock-info';
import { StockInfoDetail } from '@/components/mock-investment/stock-info-detail/stock-info-detail';
import ChartComponent from '@/components/ui/chart';
import { dummyChartData } from '@/lib/dummy-data';
import { OrderStatus } from '@/components/mock-investment/order-status/order-status';

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
      <div className="flex-1">
        <div>
          <ChartComponent data={dummyChartData} height={600} />
        </div>
        <div>
          <OrderStatus />
        </div>
      </div>
      <div>
        <div>
          <StockCostHistory />
        </div>
        <div>
          <StockInfoDetail />
        </div>
        <div>
          <SellingPrice />
        </div>
      </div>
    </div>
  );
};
