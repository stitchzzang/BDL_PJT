import { useEffect, useRef, useState } from 'react';

import { OrderbookDatas } from '@/api/types/stock';

interface SellingPriceSellProps {
  orderbooks: OrderbookDatas;
}

// 애니메이션을 위한 인라인 스타일 정의
const flashingBlueStyle = {
  animation: 'flash-blue 1s ease',
};

const flashingRedStyle = {
  animation: 'flash-red 1s ease',
};

// 애니메이션을 위한 스타일 태그 수정 - 트랜지션 추가
const animationStyle = `
  @keyframes flash-blue {
    0% { background-color: rgba(0, 123, 255, 0.2); }
    50% { background-color: rgba(0, 123, 255, 0.8); }
    100% { background-color: rgba(0, 123, 255, 0.2); }
  }

  @keyframes flash-red {
    0% { background-color: rgba(255, 59, 48, 0.2); }
    50% { background-color: rgba(255, 59, 48, 0.8); }
    100% { background-color: rgba(255, 59, 48, 0.2); }
  }

  .bar-transition {
    transition: width 0.5s ease-out;
  }
`;

export const SellingPriceSell = ({ orderbooks }: SellingPriceSellProps) => {
  const [flashingItems, setFlashingItems] = useState<Record<string, boolean>>({});
  const prevPrices = useRef<Record<string, number>>({});

  // 최대 수량 찾기
  const maxAskQuantity = Math.max(...orderbooks.askLevels.map((item) => item.quantity), 1);
  const maxBidQuantity = Math.max(...orderbooks.bidLevels.map((item) => item.quantity), 1);

  // 총량을 위한 상태 추가
  const [totalAskQuantity, setTotalAskQuantity] = useState(0);
  const [totalBidQuantity, setTotalBidQuantity] = useState(0);

  // 총량 계산 및 업데이트
  useEffect(() => {
    const newTotalAskQuantity = orderbooks.askLevels.reduce(
      (total, item) => total + item.quantity,
      0,
    );
    const newTotalBidQuantity = orderbooks.bidLevels.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    setTotalAskQuantity(newTotalAskQuantity);
    setTotalBidQuantity(newTotalBidQuantity);
  }, [orderbooks]);

  useEffect(() => {
    const newFlashingItems: Record<string, boolean> = {};

    // ask 레벨 변경 검사
    orderbooks.askLevels.forEach((item) => {
      const prevQuantity = prevPrices.current[`ask-${item.price}`];
      if (prevQuantity !== undefined && prevQuantity !== item.quantity) {
        newFlashingItems[`ask-${item.price}`] = true;
      }
      prevPrices.current[`ask-${item.price}`] = item.quantity;
    });

    // bid 레벨 변경 검사
    orderbooks.bidLevels.forEach((item) => {
      const prevQuantity = prevPrices.current[`bid-${item.price}`];
      if (prevQuantity !== undefined && prevQuantity !== item.quantity) {
        newFlashingItems[`bid-${item.price}`] = true;
      }
      prevPrices.current[`bid-${item.price}`] = item.quantity;
    });

    if (Object.keys(newFlashingItems).length > 0) {
      setFlashingItems(newFlashingItems);

      // 1초 후에 플래시 효과 제거
      const timer = setTimeout(() => {
        setFlashingItems({});
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [orderbooks]);

  return (
    <div>
      {/* 애니메이션을 위한 스타일 태그 추가 */}
      <style>{animationStyle}</style>

      <div>
        {[...orderbooks.askLevels].reverse().map((data) => {
          const isFlashing = flashingItems[`ask-${data.price}`];
          const percentWidth = (data.quantity / maxAskQuantity) * 100;

          return (
            <div key={`ask-${data.price}`} className="relative my-1 flex w-full justify-between">
              <div className="relative w-[50%] overflow-hidden p-[14px]">
                <div
                  className="bar-transition absolute bottom-0 right-0 top-0 rounded-l-xl bg-btn-blue-color bg-opacity-20"
                  style={{
                    width: `${percentWidth}%`,
                    ...(isFlashing ? flashingBlueStyle : {}),
                  }}
                ></div>
                <p className="relative z-10 text-btn-blue-color">{data.quantity}</p>
              </div>
              <div className="w-[50%] p-[14px]">
                <p>{data.price} 원</p>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        {orderbooks.bidLevels.map((data) => {
          const isFlashing = flashingItems[`bid-${data.price}`];
          const percentWidth = (data.quantity / maxBidQuantity) * 100;

          return (
            <div key={`bid-${data.price}`} className="relative my-1 flex w-full justify-between">
              <div className="flex w-[50%] justify-end p-[14px]">
                <p>{data.price} 원</p>
              </div>
              <div className="relative flex w-[50%] justify-end overflow-hidden p-[14px]">
                <div
                  className="bar-transition absolute bottom-0 left-0 top-0 rounded-r-xl bg-btn-red-color bg-opacity-20"
                  style={{
                    width: `${percentWidth}%`,
                    ...(isFlashing ? flashingRedStyle : {}),
                  }}
                ></div>
                <p className="relative z-10 text-btn-red-color">{data.quantity}</p>
              </div>
            </div>
          );
        })}
        <div className="mt-8 flex justify-between border-t border-border-color border-opacity-20 pt-4">
          <p>
            <span className="text-btn-blue-color">매도대기 : </span>{' '}
            {totalAskQuantity.toLocaleString()}
          </p>
          <p>
            <span className="text-btn-red-color">매수대기 : </span>{' '}
            {totalBidQuantity.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
