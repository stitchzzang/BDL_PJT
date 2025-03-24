export const StockTutorialMoneyInfo = () => {
  return (
    <div className="flex gap-3">
      <div className="flex gap-2 rounded-xl bg-modal-background-color px-[15px] py-[10px]">
        <p className="text-border-color">시드머니:</p>
        <span className="font-bold">5000000000원</span>
      </div>
      <div className="flex gap-2 rounded-xl bg-modal-background-color px-[15px] py-[10px]">
        <p className="text-border-color">주문가능능:</p>
        <span className="font-bold">5000000000원</span>
      </div>
      <div className="flex gap-2 rounded-xl bg-modal-background-color px-[15px] py-[10px]">
        <p className="text-border-color">현재자산:</p>
        <span className="font-bold">5000000000원</span>
      </div>
    </div>
  );
};
