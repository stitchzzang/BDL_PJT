import { useEffect, useState } from 'react';

import { TutorialOrderStatusWaitList } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-wait-list';

// test 객체의 타입 정의
export interface TestItem {
  name: string;
  price: number;
  quantity: number;
  status: string;
}

export const TutorialOrderStatusWait = () => {
  const h3Style = 'text-[16px] font-bold text-white';
  const testList: TestItem[] = [
    { name: '삼성전자', price: 32321, quantity: 3, status: '판매' },
    { name: '삼성전자', price: 12321, quantity: 3, status: '판매' },
    { name: '삼성전자', price: 12321, quantity: 3, status: '구매' },
  ];
  // 총 판매 금액 표시
  const [shellCost, setShellCost] = useState<number>(0);
  // 합산 공식
  useEffect(() => {
    const totalCost = testList
      .filter((item) => item.status === '판매')
      .reduce((acc, item) => acc + item.price * item.quantity, 0);
    setShellCost(totalCost);
  }, [testList]);
  return (
    <div>
      <h3 className={h3Style}>대기 주문</h3>
      {testList.map((test, index) => (
        <TutorialOrderStatusWaitList test={test} key={index} />
      ))}
      <hr className="mb-[20px] mt-[30px] border border-border-color border-opacity-20" />
      <div className="flex justify-between">
        <h3 className={h3Style}>총 판매 금액</h3>
        <h3 className={h3Style}>{shellCost} 원</h3>
      </div>
    </div>
  );
};
