import { OrderStatusCategory } from '@/components/mockInvestment/orderStatus/order-status-category';

export const OrderStatus = () => {
  return (
    <div>
      <div className="rounded-md bg-modal-background-color p-5">
        <div>
          <OrderStatusCategory />
        </div>
        <hr />
        <h3>구매하기</h3>
        <div>
          {/* 구매하기 컴포넌트 -> div 2개로 일단 진행 */}
          <div>
            <div>
              <h3>주문 유형</h3>
            </div>
            <div>
              {/* 지정가 */}
              <div>
                <input type="text" />
              </div>
            </div>
          </div>
          <div>
            <div>
              <h3>수량</h3>
            </div>
            <div>
              <div>
                <input type="text" />
              </div>
            </div>
          </div>
          <hr />
          <div>
            <div>
              <h3>구매가능 금액</h3>
              <h3>41,323,323원</h3>
            </div>
            <div>
              <h3>총 주문 금액</h3>
              <h3>0원</h3>
            </div>
          </div>
          <div>
            <button>구매하기</button>
            <p>결제 수수료는 결제 금액의 0.004% 입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
