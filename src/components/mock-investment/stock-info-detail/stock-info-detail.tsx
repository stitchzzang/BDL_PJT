import { useCompanyMainInfo } from '@/api/stock.api';
import { WaitOrderLoadingAnimation } from '@/components/common/chart-loading-animation';
import { StockInfoDetailList } from '@/components/mock-investment/stock-info-detail/stock-info-detail-list';

interface StockInfoDetailProps {
  companyId: number;
}

export const StockInfoDetail = ({ companyId }: StockInfoDetailProps) => {
  const { data: companyMainInfo, isLoading } = useCompanyMainInfo(companyId);
  if (isLoading) {
    return (
      <>
        <WaitOrderLoadingAnimation />
      </>
    );
  }
  return (
    <div className="h-full rounded-2xl bg-modal-background-color p-[20px]">
      <div>
        <h3 className="text-[14px] font-bold">종목 정보</h3>
      </div>
      <div className="mt-[20px]">
        {companyMainInfo ? (
          <StockInfoDetailList companyMainInfo={companyMainInfo} />
        ) : (
          <>
            <WaitOrderLoadingAnimation />
          </>
        )}
      </div>
    </div>
  );
};
