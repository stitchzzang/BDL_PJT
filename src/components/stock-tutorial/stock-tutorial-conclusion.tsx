import { StockTutorialConclusionCard } from '@/components/stock-tutorial/stock-tutorial-conclusion-card';

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
}

export const StockTutorialConclusion = ({ trades, isCompleted }: StockTutorialConclusionProps) => {
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
