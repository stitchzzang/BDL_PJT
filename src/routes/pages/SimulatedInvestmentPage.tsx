import { OrderStatus } from '@/components/mock-investment/order-status/order-status';
import { SellingPrice } from '@/components/mock-investment/selling-price/selling-price';
import { StockCostHistory } from '@/components/mock-investment/stock-cost-history/stock-cost-history';
import { StockInfo } from '@/components/mock-investment/stock-info/stock-info';
import { StockInfoDetail } from '@/components/mock-investment/stock-info-detail/stock-info-detail';
import ChartComponent from '@/components/ui/chart';
import { dummyChartData } from '@/lib/dummy-data';
import { getTodayFormatted } from '@/utils/getTodayFormatted';

export const SimulatedInvestmentPage = () => {
  return (
    <div className="flex h-full w-full flex-col px-6">
      <div>
        <div>
          <StockInfo />
        </div>
        <div className="mb-[16px] mt-[30px] flex items-center justify-between">
          <div className="rounded-2xl bg-modal-background-color px-[24px] py-[20px]">
            <p className="font-bold">차트</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-border-color">오늘 날짜</p>
            <div className="rounded-xl bg-modal-background-color px-[20px] py-[16px]">
              <p>{getTodayFormatted()}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mb-[20px] grid grid-cols-1 gap-5 lg:grid-cols-10">
        <div className="col-span-1 lg:col-span-8">
          <ChartComponent data={dummyChartData} height={600} />
        </div>
        <div className="col-span-1 lg:col-span-2">
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
