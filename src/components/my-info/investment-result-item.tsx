import { CompanyInfo } from '@/components/common/company-info';

export const InvestmentResultItem = () => {
  return (
    <div className="flex flex-row items-center justify-between gap-2 rounded-[10px] bg-modal-background-color p-3">
      <CompanyInfo />
      <div className="flex flex-row items-center gap-4 text-base">
        <div className="flex flex-row items-center gap-1">
          <span className="text-text-border-color">시작 금액</span>
          <p className="text-text-main-color">100,000원</p>
        </div>
        <div className="flex flex-row items-center gap-1">
          <span className="text-text-border-color">최종 금액</span>
          <p className="text-text-main-color">100,000원</p>
        </div>
        <div className="flex flex-row items-center gap-1">
          <span className="text-text-border-color">최종 수익률</span>
          <p className="rounded-lg border border-btn-red-color px-2 py-1 text-btn-red-color">
            +34.2%
          </p>
        </div>
      </div>
    </div>
  );
};
