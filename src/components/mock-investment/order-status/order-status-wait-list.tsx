import { UserSimulatedData } from '@/api/types/stock';
import { formatKoreanMoney } from '@/utils/numberFormatter';
interface OrderStatusWaitListProps {
  UserSimulatedData: UserSimulatedData; // test 객체를 prop으로 받기
}

export const OrderStatusWaitList = ({ UserSimulatedData }: OrderStatusWaitListProps) => {
  const h3Style = 'text-[16px] font-medium text-white';
  return (
    <div
      className={`mb-3 mt-[12px] flex justify-between rounded-xl p-3 ${UserSimulatedData.tradeType === 0 ? 'bg-btn-red-color bg-opacity-20' : 'bg-btn-blue-color bg-opacity-20'}`}
    >
      <div className="flex items-center gap-3">
        <h3 className={h3Style}>{UserSimulatedData.companyName}</h3>
        <p className="text-border-color">
          {formatKoreanMoney(UserSimulatedData.price)}원 <span>|</span> {UserSimulatedData.quantity}
          주
        </p>
      </div>
      <div>
        {UserSimulatedData.tradeType === 1 ? (
          <p className="text-btn-blue-color">판매</p>
        ) : (
          <p className="text-btn-red-color ">구매</p>
        )}
      </div>
    </div>
  );
};
