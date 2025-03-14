export const OrderStatusBuy = () => {
  // 폰트 동일 스타일링 함수
  const h3Style = 'text-[18px] font-bold';
  return (
    <div>
      <h3 className={h3Style}>구매하기</h3>
      <div>
        <div className="flex w-full gap-4">
          <div className="min-w-[74px]">
            <h3 className={h3Style}>주문 유형</h3>
          </div>
          <div className="flex w-full flex-col gap-2">
            {/* 지정가 */}
            <div className="flex w-full justify-between gap-3 rounded-md bg-btn-primary-active-color px-[10px] py-[7px]">
              <div className="w-full text-center">
                <p>지정가</p>
              </div>
              <div className="w-full text-center">
                <p>시장가</p>
              </div>
            </div>
            <div className="w-full">
              <input type="text" className="w-full" />
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
  );
};
