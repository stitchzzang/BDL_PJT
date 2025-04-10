import Lottie from 'lottie-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

export type TradeAction = 'buy' | 'sell' | 'hold';
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
  // 버튼 관련 props 추가
  onTutorialStart?: () => void;
  onMoveToNextTurn?: () => void;
  initSessionPending?: boolean;
  companyInfoExists?: boolean;
  isLoading?: boolean; // 로딩 상태 추가
  isPending?: boolean; // isPending 추가
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
  onTutorialStart,
  onMoveToNextTurn,
  initSessionPending = false,
  companyInfoExists = true,
  isLoading = false, // 기본값 false
  isPending = false, // 기본값 false
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

    // 관망은 'hold' 액션으로 처리
    onTrade('hold', 0, 0);
  };

  // 버튼 클릭 처리 함수
  const handleButtonClick = () => {
    if (!isTutorialStarted) {
      // 튜토리얼이 시작되지 않은 경우 시작
      onTutorialStart?.();
    } else if (isCurrentTurnCompleted) {
      // 현재 턴이 완료된 경우 다음 턴으로 이동
      onMoveToNextTurn?.();
    }
  };

  // 버튼 텍스트 결정 로직
  const buttonTextContent = !isTutorialStarted
    ? initSessionPending
      ? '초기화 중...'
      : '튜토리얼 시작하기'
    : currentTurn === 4
      ? '튜토리얼 완료'
      : currentTurn > 0
        ? '다음 턴으로'
        : '튜토리얼 진행중';

  return (
    <div className="h-full">
      <div className="relative flex h-full flex-col rounded-2xl bg-modal-background-color p-4">
        <div className="mb-2">
          <TutorialOrderStatusCategory
            isActiveCategory={isActiveCategory}
            setIsActiveCategory={setIsActiveCategory}
            isLoading={isLoading}
          />
        </div>
        <hr className="mb-2 border border-border-color border-opacity-20" />
        <div className="min-h-[450px] flex-1 overflow-y-auto">
          {isActiveCategory === '구매' && (
            <TutorialOrderStatusBuy
              onBuy={(price, quantity) => handleTrade('buy', price, quantity)}
              companyId={companyId}
              latestPrice={latestPrice}
              isActive={isSessionActive && !isCurrentTurnCompleted && currentTurn < 4}
              availableOrderAsset={availableOrderAsset}
              ownedStockCount={ownedStockCount}
              isLoading={isLoading}
            />
          )}
          {isActiveCategory === '판매' && (
            <TutorialOrderStatusSell
              onSell={(price, quantity) => handleTrade('sell', price, quantity)}
              companyId={companyId}
              latestPrice={latestPrice}
              isActive={isSessionActive && !isCurrentTurnCompleted}
              ownedStockCount={ownedStockCount}
              isLoading={isLoading}
            />
          )}
          {isActiveCategory === '관망' && (
            <TutorialOrderStatusWait
              isActive={isSessionActive && !isWaitDisabled}
              onWait={handleWait}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* 튜토리얼 시작 전 오버레이 */}
        {!isTutorialStarted && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-modal-background-color bg-opacity-95">
            <p className="mb-3 text-2xl font-bold text-white">튜토리얼을 시작해주세요!</p>
            <p className="mb-4 text-center text-sm text-gray-400">
              주식 매매 튜토리얼을 시작하려면
              <br />
              아래 버튼을 클릭해주세요.
            </p>
            <div className="mb-4 h-32 w-32">
              <Lottie animationData={NextAnimation} loop={true} />
            </div>
            <Button
              className="max-h-[45px] w-[225px]"
              variant={'green'}
              size={'lg'}
              onClick={handleButtonClick}
              disabled={initSessionPending || !companyInfoExists || isPending}
            >
              {buttonTextContent}
            </Button>
          </div>
        )}

        {/* 턴 완료 후 오버레이 표시 */}
        {isCurrentTurnCompleted && currentTurn < 4 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-modal-background-color bg-opacity-95">
            <p className="mb-3 text-2xl font-bold text-white">거래 체결 성공!</p>
            <p className="mb-1 text-lg font-bold text-white">한 턴당 한 번만 거래할 수 있어요.</p>
            <div className="mb-4 h-32 w-32">
              <Lottie animationData={NextAnimation} loop={true} />
            </div>
            <Button
              className="max-h-[45px] w-[225px]"
              variant={'green'}
              size={'lg'}
              onClick={handleButtonClick}
              disabled={!isCurrentTurnCompleted || isPending}
            >
              다음 턴으로
            </Button>
          </div>
        )}

        {/* 4단계(마지막 턴)에서는 결과 확인하기 안내 */}
        {isCurrentTurnCompleted && currentTurn === 4 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-modal-background-color bg-opacity-95">
            <p className="mb-4 text-xl font-bold text-white">튜토리얼 결과를 확인해보세요!</p>
            <div className="mb-4 h-32 w-32">
              <Lottie animationData={NextAnimation} loop={true} />
            </div>
            <Button
              className="max-h-[45px] w-[225px]"
              variant={'green'}
              size={'lg'}
              onClick={handleButtonClick}
              disabled={!isCurrentTurnCompleted || isPending}
            >
              튜토리얼 완료
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
