import { OrderbookData, OrderbookDatas } from '@/api/types/stock';
interface SellingPriceSellProps {
  orderbooks: OrderbookDatas;
}

export const SellingPriceSell = ({ orderbooks }: SellingPriceSellProps) => {
  return (
    <div>
      <div>
        {orderbooks.askLevels.map((data: OrderbookData, index) => {
          return (
            <div key={index} className="flex w-full justify-between">
              <div className="w-[50%] bg-btn-blue-color bg-opacity-20 p-[14px]">
                <p className="text-btn-blue-color">{data.quantity}</p>
              </div>
              <div className="w-[50%] p-[14px]">
                <p>{data.price} 원</p>
              </div>
            </div>
          );
        })}
      </div>
      <div>
        {orderbooks.bidLevels.map((data: OrderbookData, index) => {
          return (
            <div key={index} className="flex w-full justify-between">
              <div className="flex w-[50%] justify-end p-[14px]">
                <p>{data.price} 원</p>
              </div>
              <div className="flex w-[50%] justify-end bg-btn-red-color  bg-opacity-20 p-[14px]">
                <p className="text-btn-red-color">{data.quantity}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
