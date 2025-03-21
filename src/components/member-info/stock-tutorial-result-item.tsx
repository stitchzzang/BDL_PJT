export const StockTutorialResultItem = () => {
  return (
    <div className="flex w-full flex-row items-center justify-between gap-2 rounded-[10px] bg-modal-background-color p-3">
      <div className="flex flex-row items-center gap-4">
        <img
          src="https://placehold.co/50x50"
          alt="company-identifier"
          className="h-[50px] w-[50px] rounded-xl"
        />
        <p className="text-base">회사명</p>
      </div>
      <div className="flex flex-row items-center gap-4 text-base">
        <div className="flex flex-row items-center gap-1">
          <span className="text-border-color">시작 금액</span>
          <p className="text-text-main-color">100,000원</p>
        </div>
        <div className="flex flex-row items-center gap-1">
          <span className="text-border-color">최종 금액</span>
          <p className="text-text-main-color">100,000</p>
          <span className="text-border-color">원</span>
        </div>
        <div className="flex flex-row items-center gap-1">
          <span className="text-border-color">최종 수익률</span>
          <p className="rounded-lg border border-btn-red-color px-2 py-1 text-btn-red-color">
            +34.2%
          </p>
        </div>
      </div>
    </div>
  );
};
