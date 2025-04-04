import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

export type TradeAction = 'buy' | 'sell' | 'wait';
import NextAnimation from '@/assets/lottie/next-animation.json';
import { TutorialOrderStatusBuy } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-buy';
import { TutorialOrderStatusCategory } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-category';
import { TutorialOrderStatusSell } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-sell';
import { TutorialOrderStatusWait } from '@/components/stock-tutorial/stock-tutorial-order/tutorial-order-status-wait';

export interface TutorialOrderStatusProps {
  onTrade: (action: TradeAction, price: number, quantity: number) => void;
  isSessionActive: boolean;
  companyId: number;
  latestPrice: number;
  ownedStockCount?: number; // 보유 주식 수량 (옵션)
  currentTurn: number; // 현재 턴 번호 추가
  isCurrentTurnCompleted: boolean; // 현재 턴 완료 여부 추가
  availableOrderAsset?: number; // 구매 가능 금액 추가
  isTutorialStarted: boolean; // 튜토리얼 시작 여부 추가
}

export const TutorialOrderStatus = ({
  onTrade,
  isSessionActive,
  companyId,
  latestPrice,
  ownedStockCount = 0, // 기본값 0
  currentTurn,
  isCurrentTurnCompleted,
  availableOrderAsset = 0, // 기본값 0
  isTutorialStarted = false, // 기본값 false
}: TutorialOrderStatusProps) => {
  // 허용된 탭 타입을 정의
  type TabType = '구매' | '판매' | '관망';
  // 랜더링 유무
  const [isActiveCategory, setIsActiveCategory] = useState<TabType>('구매');

  // 각 턴에서 이미 관망을 선택했는지 추적
  const [waitSelectedTurns, setWaitSelectedTurns] = useState<number[]>([]);

  // 현재 턴이 변경될 때 선택된 탭을 기본값으로 초기화
  useEffect(() => {
    setIsActiveCategory('구매');
  }, [currentTurn]);

  // 턴이 완료되면 구매 카테고리로 초기화
  useEffect(() => {
    if (isCurrentTurnCompleted) {
      setIsActiveCategory('구매');
    }
  }, [isCurrentTurnCompleted]);

  // 현재 턴에서 관망이 이미 선택되었는지 확인
  const isWaitDisabled = waitSelectedTurns.includes(currentTurn) || isCurrentTurnCompleted;

  // 거래 처리 함수
  const handleTrade = (action: 'buy' | 'sell', price: number, quantity: number) => {
    if (!isSessionActive) return;
    onTrade(action, price, quantity);
  };

  // 관망 처리 함수
  const handleWait = () => {
    if (!isSessionActive || isWaitDisabled) return;

    // 현재 턴을 관망 선택 턴 목록에 추가
    setWaitSelectedTurns((prev) => [...prev, currentTurn]);

    // 관망은 'wait' 액션으로 처리
    onTrade('wait', 0, 0);
  };

  return (
    <div className="h-full">
      <div className="relative flex h-full flex-col rounded-2xl bg-modal-background-color p-4">
        <div className="mb-2">
          <TutorialOrderStatusCategory
            isActiveCategory={isActiveCategory}
            setIsActiveCategory={setIsActiveCategory}
          />
        </div>
        <hr className="mb-2 border border-border-color border-opacity-20" />
        <div className="flex-1 overflow-y-auto">
          {isActiveCategory === '구매' && (
            <TutorialOrderStatusBuy
              onBuy={(price, quantity) => handleTrade('buy', price, quantity)}
              companyId={companyId}
              latestPrice={latestPrice}
              isActive={isSessionActive && !isCurrentTurnCompleted && currentTurn < 4}
              availableOrderAsset={availableOrderAsset}
              ownedStockCount={ownedStockCount}
            />
          )}
          {isActiveCategory === '판매' && (
            <TutorialOrderStatusSell
              onSell={(price, quantity) => handleTrade('sell', price, quantity)}
              companyId={companyId}
              latestPrice={latestPrice}
              isActive={isSessionActive && !isCurrentTurnCompleted}
              ownedStockCount={ownedStockCount}
            />
          )}
          {isActiveCategory === '관망' && (
            <TutorialOrderStatusWait
              isActive={isSessionActive && !isWaitDisabled}
              onWait={handleWait}
            />
          )}
        </div>

        {/* 튜토리얼 시작 전 오버레이 */}
        {!isTutorialStarted && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-modal-background-color bg-opacity-90">
            <p className="mb-3 text-2xl font-bold text-white">튜토리얼을 시작해주세요!</p>
            <p className="mb-4 text-center text-sm text-gray-400">
              상단의 '튜토리얼 시작하기' 버튼을 클릭하여
              <br />
              주식 매매 튜토리얼을 시작해보세요.
            </p>
            <div className="mb-2 h-32 w-32">
              <Lottie animationData={NextAnimation} loop={true} />
            </div>
          </div>
        )}

        {/* 턴 완료 후 오버레이 표시 */}
        {isCurrentTurnCompleted && currentTurn < 4 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-modal-background-color bg-opacity-90">
            <p className="mb-3 text-2xl font-bold text-white">거래 체결 성공!</p>
            <p className="mb-1 text-lg font-bold text-white">한 턴당 한 번만 거래할 수 있어요.</p>
            <div className="mb-2 h-32 w-32">
              <Lottie animationData={NextAnimation} loop={true} />
            </div>
          </div>
        )}

        {/* 4단계(마지막 턴)에서는 결과 확인하기 안내 */}
        {isCurrentTurnCompleted && currentTurn === 4 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-modal-background-color bg-opacity-90">
            <p className="mb-4 text-xl font-bold text-white">튜토리얼 결과를 확인해보세요!</p>
            <div className="mb-2 h-32 w-32">
              <Lottie animationData={NextAnimation} loop={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
