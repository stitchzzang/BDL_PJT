export const OrderStatusCategory = () => {
  const orderButtonStyle = 'w-[30%] cursor-pointer text-center rounded-md py-[10px]';
  return (
    <div className="rounded-md border border-border-color p-3">
      <div className="flex w-full justify-between gap-1">
        <div className={`${orderButtonStyle} bg-btn-red-color bg-opacity-20`}>
          <button className="font-bold text-btn-red-color">구매</button>
        </div>
        <div className={orderButtonStyle}>
          <button>판매</button>
        </div>
        <div className={orderButtonStyle}>
          <button>대기</button>
        </div>
      </div>
    </div>
  );
};
