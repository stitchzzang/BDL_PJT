import { OrderStatusBuy } from '@/components/mockInvestment/orderStatus/order-status-buy';
import { OrderStatusCategory } from '@/components/mockInvestment/orderStatus/order-status-category';

export const OrderStatus = () => {
  return (
    <div>
      <div className="rounded-md bg-modal-background-color p-5">
        <div className="mb-[25px]">
          <OrderStatusCategory />
        </div>
        <hr className="mb-[25px] border border-border-color border-opacity-20" />
        <div>
          <OrderStatusBuy />
        </div>
      </div>
    </div>
  );
};
