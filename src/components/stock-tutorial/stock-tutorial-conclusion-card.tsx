import { addCommasToThousand } from '@/utils/numberFormatter';

// TradeRecord 인터페이스 정의
interface TradeRecord {
  action: 'buy' | 'sell';
  price: number;
  quantity: number;
  timestamp: Date;
  stockCandleId: number;
}

export interface StockTutorialConclusionCardProps {
  trades: TradeRecord[];
  feedback: string;
  isCompleted: boolean;
}

export const StockTutorialConclusionCard = ({
  trades,
  feedback,
  isCompleted,
}: StockTutorialConclusionCardProps) => {
  return (
    <div>
      {trades.length === 0 ? (
        <p className="text-border-color">아직 거래 내역이 없습니다.</p>
      ) : (
        trades.map((trade, index) => (
          <div
            key={index}
            className="mb-2 rounded-xl bg-btn-blue-color bg-opacity-20 px-[20px] py-[10px]"
          >
            <div className="flex justify-between">
              <h3>
                {addCommasToThousand(trade.price)}원 | {trade.quantity}주
              </h3>
              <p className={trade.action === 'buy' ? 'text-btn-red-color' : 'text-btn-blue-color'}>
                {trade.action === 'buy' ? '구매' : '판매'}
              </p>
            </div>
          </div>
        ))
      )}

      {isCompleted && feedback && (
        <div className="mt-4">
          <h3 className="mb-2 text-[16px] font-bold">튜토리얼 피드백</h3>
          <p className="text-border-color">{feedback}</p>
        </div>
      )}
    </div>
  );
};
