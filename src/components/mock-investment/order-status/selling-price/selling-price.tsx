export const SellingPrice = () => {
  return (
    <div className="bg-modal-background-color">
      <div className="flex justify-between">
        <h3 className="text-[18px] font-bold">호가</h3>
        {/* 장시간 string */}
        <p className="text-[14px] font-light text-border-color">12:32</p>
      </div>
      <hr className="border-border-color border-opacity-20" />
      <div className="flex justify-between">
        <p className="text-[18px] text-btn-blue-color">매도잔량</p>
        <p className="text-[18px] text-btn-red-color">매수잔량</p>
      </div>
      <div>{/* 매도,매수 정리  */}</div>
    </div>
  );
};
