import { OrderStatusWaitList } from '@/components/mockInvestment/orderStatus/order-status-wait-list';

// test 객체의 타입 정의
export interface TestItem {
  name: string;
  price: number;
  quantity: number;
  status: string;
}

export const OrderStatusWait = () => {
  const h3Style = 'text-[18px] font-bold text-white';
  const testList: TestItem[] = [
    { name: '삼성전자', price: 12321, quantity: 3, status: '판매' },
    { name: '삼성전자', price: 12321, quantity: 3, status: '판매' },
  ];
  return (
    <div>
      <h3 className={h3Style}>대기 주문</h3>
      {testList.map((test, index) => (
        <OrderStatusWaitList test={test} key={index} />
      ))}
    </div>
  );
};
