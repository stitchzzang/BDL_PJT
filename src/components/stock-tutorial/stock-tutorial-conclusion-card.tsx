import { addCommasToThousand } from '@/utils/numberFormatter';

// TradeRecord 인터페이스 정의
interface TradeRecord {
  action: 'buy' | 'sell' | 'wait';
  price: number;
  quantity: number;
  timestamp: Date;
  stockCandleId: number;
  turnNumber: number; // 턴 번호 추가 (1~4)
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
            <div className="flex flex-col gap-1">
              {/* 단계 표시 */}
              <p className="text-[14px] font-medium text-border-color">{trade.turnNumber}단계</p>
              <div className="flex justify-between">
                <h3>
                  {trade.action === 'wait'
                    ? '관망'
                    : `${addCommasToThousand(trade.price)}원 | ${trade.quantity}주`}
                </h3>
                <p
                  className={
                    trade.action === 'buy'
                      ? 'text-btn-red-color'
                      : trade.action === 'sell'
                        ? 'text-btn-blue-color'
                        : 'text-border-color'
                  }
                >
                  {trade.action === 'buy' ? '구매' : trade.action === 'sell' ? '판매' : '관망'}
                </p>
              </div>
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
