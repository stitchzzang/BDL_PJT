import { StockTutorialConclusionCard } from '@/components/stock-tutorial/stock-tutorial-conclusion-card';
import { Skeleton } from '@/components/ui/skeleton';

// TradeRecord 인터페이스 정의
interface TradeRecord {
  action: 'buy' | 'sell' | 'wait';
  price: number;
  quantity: number;
  timestamp: Date;
  stockCandleId: number;
  turnNumber: number;
}

// 컴포넌트 props 인터페이스 정의
export interface StockTutorialConclusionProps {
  trades: TradeRecord[];
  isCompleted: boolean;
  isLoading?: boolean;
}

export const StockTutorialConclusion = ({
  trades,
  isCompleted,
  isLoading = false,
}: StockTutorialConclusionProps) => {
  if (isLoading) {
    return (
      <div className="h-full rounded-xl bg-modal-background-color p-[20px]">
        <div className="mb-[15px] flex items-center gap-3">
          <Skeleton className="h-7 w-[100px]" style={{ backgroundColor: '#0D192B' }} />
        </div>
        <div>
          {[1, 2, 3].map((index) => (
            <div key={index} className="mb-5">
              <Skeleton className="mb-2 h-6 w-[80px]" style={{ backgroundColor: '#0D192B' }} />
              {[1, 2].map((subIndex) => (
                <Skeleton
                  key={`${index}-${subIndex}`}
                  className="mb-2 h-[60px] w-full rounded-xl"
                  style={{ backgroundColor: '#0D192B' }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full rounded-xl bg-modal-background-color p-[20px]">
      <div className="mb-[15px] flex items-center gap-3">
        <h1 className="text-[18px] font-bold">체결내역</h1>
      </div>
      <div>
        <StockTutorialConclusionCard trades={trades} isCompleted={isCompleted} />
      </div>
    </div>
  );
};
