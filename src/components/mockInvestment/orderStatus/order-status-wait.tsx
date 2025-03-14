export const OrderStatusWait = () => {
  const h3Style = 'text-[18px] font-bold text-white';
  const testList = [
    { name: '삼성전자', price: 12321, quantity: 3, status: '판매' },
    { name: '삼성전자', price: 12321, quantity: 3, status: '판매' },
  ];
  return (
    <div>
      <h3 className={h3Style}>대기 주문</h3>
    </div>
  );
};
