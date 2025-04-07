import { addCommasToThousand } from '@/utils/numberFormatter';
import { Skeleton } from '@/components/ui/skeleton';

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
  feedback?: string;
  isCompleted: boolean;
  isLoading?: boolean;
}

export const StockTutorialConclusionCard = ({
  trades,
  isLoading = false,
}: StockTutorialConclusionCardProps) => {
  if (isLoading) {
    return (
      <div>
        {[1, 2, 3].map((turnNumber) => (
          <div key={turnNumber} className="mb-5">
            <Skeleton className="mb-2 h-6 w-[80px]" style={{ backgroundColor: '#0D192B' }} />
            {[1, 2].map((index) => (
              <Skeleton
                key={`${turnNumber}-${index}`}
                className="mb-2 h-[52px] w-full rounded-xl"
                style={{ backgroundColor: '#0D192B' }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {trades.length === 0 ? (
        <p className="text-border-color">아직 거래 내역이 없습니다.</p>
      ) : (
        <div>
          {/* 단계별로 그룹화하여 표시 */}
          {[...new Set(trades.map((trade) => trade.turnNumber))].map((turnNumber) => (
            <div key={turnNumber} className="mb-5">
              <div className="mb-2 text-[16px] text-white opacity-80">{turnNumber}단계</div>

              {trades
                .filter((trade) => trade.turnNumber === turnNumber)
                .map((trade, index) => (
                  <div
                    key={index}
                    className={`mb-2 rounded-xl px-[20px] py-[10px] ${
                      trade.action === 'buy'
                        ? 'bg-[#3A1D24]' // 구매 - 어두운 빨간색 배경
                        : trade.action === 'sell'
                          ? 'bg-[#1D2B3A]' // 판매 - 어두운 파란색 배경
                          : 'bg-[#222738]' // 관망 - 기본 어두운 배경
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {/* 금액과 수량 정보 */}
                      <div>
                        {trade.action === 'wait' ? (
                          <span className="text-white">관망</span>
                        ) : (
                          <span className="text-[18px] font-medium text-white">
                            {addCommasToThousand(trade.price)}원 | {trade.quantity}주
                          </span>
                        )}
                      </div>

                      {/* 매수/매도 표시 */}
                      <div>
                        <span
                          className={`font-medium ${
                            trade.action === 'buy'
                              ? 'text-btn-red-color'
                              : trade.action === 'sell'
                                ? 'text-btn-blue-color'
                                : 'text-border-color'
                          }`}
                        >
                          {trade.action === 'buy'
                            ? '구매'
                            : trade.action === 'sell'
                              ? '판매'
                              : '관망'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
