import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';

import graphMove from '@/assets/lottie/graph-animation.json';
import { HelpBadge } from '@/components/common/help-badge';
import { Button } from '@/components/ui/button';
import { TermTooltip } from '@/components/ui/term-tooltip';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import { InvalidAccessPage } from '@/routes/pages/algorithm-lab/InvalidAccessPage';
import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';
import { addCommasToThousand } from '@/utils/numberFormatter';

export const MethodPage = () => {
  const isValidAccess = useAlgorithmLabGuard('method');
  const navigate = useNavigate();

  const {
    entryMethod,
    entryInvestmentMethod,
    entryFixedAmount,
    entryFixedPercentage,
    exitMethod,
    exitInvestmentMethod,
    exitFixedAmount,
    exitFixedPercentage,
    isFee,
    setEntryMethod,
    setEntryInvestmentMethod,
    setEntryFixedAmount,
    setEntryFixedPercentage,
    setExitMethod,
    setExitInvestmentMethod,
    setExitFixedAmount,
    setExitFixedPercentage,
    setIsFee,
  } = useAlgorithmLabStore();

  if (!isValidAccess) {
    return <InvalidAccessPage />;
  }

  // 금액 빠른 선택 버튼 핸들러
  const handleEntryAmountSelect = (amount: number) => {
    setEntryInvestmentMethod('FIXED_AMOUNT');
    setEntryFixedAmount(amount);
    setEntryFixedPercentage(null);
    setEntryMethod('DIVIDE'); // 금액 선택 시 항상 DIVIDE로 설정
  };

  // 비율 빠른 선택 버튼 핸들러
  const handleEntryPercentageSelect = (percentage: number) => {
    setEntryInvestmentMethod('FIXED_PERCENTAGE');
    setEntryFixedPercentage(percentage);
    setEntryFixedAmount(null);

    // 100%일 때만 ONCE, 나머지는 DIVIDE로 설정
    setEntryMethod(percentage === 100 ? 'ONCE' : 'DIVIDE');
  };

  // 금액 증가 핸들러
  const handleEntryAmountIncrease = () => {
    if (!entryFixedAmount) {
      handleEntryAmountSelect(10000);
      return;
    }

    const newAmount = entryFixedAmount + 10000;
    if (newAmount <= 1000000) {
      handleEntryAmountSelect(newAmount);
    }
  };

  // 금액 감소 핸들러
  const handleEntryAmountDecrease = () => {
    if (!entryFixedAmount || entryFixedAmount <= 10000) {
      handleEntryAmountSelect(10000);
      return;
    }

    handleEntryAmountSelect(entryFixedAmount - 10000);
  };

  // 비율 증가 핸들러
  const handleEntryPercentageIncrease = () => {
    if (!entryFixedPercentage) {
      handleEntryPercentageSelect(10);
      return;
    }

    const newPercentage = entryFixedPercentage + 10;
    if (newPercentage <= 100) {
      handleEntryPercentageSelect(newPercentage);
    }
  };

  // 비율 감소 핸들러
  const handleEntryPercentageDecrease = () => {
    if (!entryFixedPercentage || entryFixedPercentage <= 10) {
      handleEntryPercentageSelect(10);
      return;
    }

    handleEntryPercentageSelect(entryFixedPercentage - 10);
  };

  // 청산 금액 빠른 선택 버튼 핸들러
  const handleExitAmountSelect = (amount: number) => {
    setExitInvestmentMethod('FIXED_AMOUNT');
    setExitFixedAmount(amount);
    setExitFixedPercentage(null);
    setExitMethod('DIVIDE'); // 금액 선택 시 항상 DIVIDE로 설정
  };

  // 청산 금액 증가 핸들러
  const handleExitAmountIncrease = () => {
    if (!exitFixedAmount) {
      handleExitAmountSelect(10000);
      return;
    }

    const newAmount = exitFixedAmount + 10000;
    if (newAmount <= 1000000) {
      handleExitAmountSelect(newAmount);
    }
  };

  // 청산 금액 감소 핸들러
  const handleExitAmountDecrease = () => {
    if (!exitFixedAmount || exitFixedAmount <= 10000) {
      handleExitAmountSelect(10000);
      return;
    }

    handleExitAmountSelect(exitFixedAmount - 10000);
  };

  // 청산 비율 빠른 선택 버튼 핸들러
  const handleExitPercentageSelect = (percentage: number) => {
    setExitInvestmentMethod('FIXED_PERCENTAGE');
    setExitFixedPercentage(percentage);
    setExitFixedAmount(null);

    // 100%일 때만 ONCE, 나머지는 DIVIDE로 설정
    setExitMethod(percentage === 100 ? 'ONCE' : 'DIVIDE');
  };

  // 청산 비율 증가 핸들러
  const handleExitPercentageIncrease = () => {
    if (!exitFixedPercentage) {
      handleExitPercentageSelect(10);
      return;
    }

    const newPercentage = exitFixedPercentage + 10;
    if (newPercentage <= 100) {
      handleExitPercentageSelect(newPercentage);
    }
  };

  // 청산 비율 감소 핸들러
  const handleExitPercentageDecrease = () => {
    if (!exitFixedPercentage || exitFixedPercentage <= 10) {
      handleExitPercentageSelect(10);
      return;
    }

    handleExitPercentageSelect(exitFixedPercentage - 10);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <h2 className="text-3xl font-bold">투자 방식 설정</h2>
      <Lottie
        animationData={graphMove}
        loop={true}
        autoplay={true}
        style={{ height: 170, width: 170 }}
        rendererSettings={{
          preserveAspectRatio: 'xMidYMid slice',
        }}
      />
      <HelpBadge
        title="투자는 어떤 방식으로 설정할까요?"
        description={
          <>
            구매 판매 방식을 설정해주세요.
            <br />
            선택하신 방법에 따라 알고리즘이 투자를 진행합니다.
          </>
        }
      />

      {/* 구매 방식 설정 */}
      <div className="w-full space-y-4">
        <p className="text-lg font-bold">
          <TermTooltip term="구매 방식 설정">구매 방식 설정</TermTooltip>
        </p>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant="blue"
              onClick={() => {
                setEntryInvestmentMethod('FIXED_AMOUNT');
                setEntryFixedAmount(10000);
                setEntryFixedPercentage(null);
                setEntryMethod('DIVIDE');
              }}
              className={`flex-1 ${
                entryInvestmentMethod === 'FIXED_AMOUNT'
                  ? 'bg-btn-blue-color'
                  : 'bg-btn-blue-color/10'
              }`}
            >
              고정 금액
            </Button>
            <Button
              variant="blue"
              onClick={() => {
                setEntryInvestmentMethod('FIXED_PERCENTAGE');
                setEntryFixedPercentage(10);
                setEntryFixedAmount(null);
                setEntryMethod('DIVIDE');
              }}
              className={`flex-1 ${
                entryInvestmentMethod === 'FIXED_PERCENTAGE'
                  ? 'bg-btn-blue-color'
                  : 'bg-btn-blue-color/10'
              }`}
            >
              고정 비율
            </Button>
          </div>

          {entryInvestmentMethod === 'FIXED_AMOUNT' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md bg-modal-background-color p-2">
                <Button
                  variant="blue"
                  size="icon"
                  onClick={handleEntryAmountDecrease}
                  disabled={entryFixedAmount ? entryFixedAmount <= 10000 : false}
                  className="h-8 w-8"
                >
                  -
                </Button>
                <div className="flex-1 text-center font-medium">
                  {entryFixedAmount ? addCommasToThousand(entryFixedAmount) : '10,000'}원
                  <div className="text-xs text-gray-500">단위: 10,000원</div>
                </div>
                <Button
                  variant="blue"
                  size="icon"
                  onClick={handleEntryAmountIncrease}
                  disabled={entryFixedAmount ? entryFixedAmount >= 1000000 : false}
                  className="h-8 w-8"
                >
                  +
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="blue"
                  onClick={() => handleEntryAmountSelect(100000)}
                  className={`flex-1 ${entryFixedAmount === 100000 ? 'opacity-100' : 'opacity-50'}`}
                >
                  100,000원
                </Button>
                <Button
                  variant="blue"
                  onClick={() => handleEntryAmountSelect(1000000)}
                  className={`flex-1 ${entryFixedAmount === 1000000 ? 'opacity-100' : 'opacity-50'}`}
                >
                  1,000,000원
                </Button>
              </div>
            </div>
          )}

          {entryInvestmentMethod === 'FIXED_PERCENTAGE' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md bg-modal-background-color p-2">
                <Button
                  variant="blue"
                  size="icon"
                  onClick={handleEntryPercentageDecrease}
                  disabled={entryFixedPercentage ? entryFixedPercentage <= 10 : false}
                  className="h-8 w-8"
                >
                  -
                </Button>
                <div className="flex-1 text-center font-medium">
                  {entryFixedPercentage ? entryFixedPercentage : '10'}%
                  <div className="text-xs text-gray-500">단위: 10%</div>
                </div>
                <Button
                  variant="blue"
                  size="icon"
                  onClick={handleEntryPercentageIncrease}
                  disabled={entryFixedPercentage ? entryFixedPercentage >= 100 : false}
                  className="h-8 w-8"
                >
                  +
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="blue"
                  onClick={() => handleEntryPercentageSelect(50)}
                  className={`flex-1 ${entryFixedPercentage === 50 ? 'opacity-100' : 'opacity-50'}`}
                >
                  50%
                </Button>
                <Button
                  variant="blue"
                  onClick={() => handleEntryPercentageSelect(100)}
                  className={`flex-1 ${entryFixedPercentage === 100 ? 'opacity-100' : 'opacity-50'}`}
                >
                  100%
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 판매 방식 설정 */}
      <div className="w-full space-y-4">
        <p className="text-lg font-bold">
          <TermTooltip term="판매 방식 설정">판매 방식 설정</TermTooltip>
        </p>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant="blue"
              onClick={() => {
                setExitInvestmentMethod('FIXED_AMOUNT');
                setExitFixedAmount(10000);
                setExitFixedPercentage(null);
                setExitMethod('DIVIDE');
              }}
              className={`flex-1 ${
                exitInvestmentMethod === 'FIXED_AMOUNT'
                  ? 'bg-btn-blue-color'
                  : 'bg-btn-blue-color/10'
              }`}
            >
              고정 금액
            </Button>
            <Button
              variant="blue"
              onClick={() => {
                setExitInvestmentMethod('FIXED_PERCENTAGE');
                setExitFixedPercentage(10);
                setExitFixedAmount(null);
                setExitMethod('DIVIDE');
              }}
              className={`flex-1 ${
                exitInvestmentMethod === 'FIXED_PERCENTAGE'
                  ? 'bg-btn-blue-color'
                  : 'bg-btn-blue-color/10'
              }`}
            >
              고정 비율
            </Button>
          </div>

          {exitInvestmentMethod === 'FIXED_AMOUNT' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md bg-modal-background-color p-2">
                <Button
                  variant="blue"
                  size="icon"
                  onClick={handleExitAmountDecrease}
                  disabled={exitFixedAmount ? exitFixedAmount <= 10000 : false}
                  className="h-8 w-8"
                >
                  -
                </Button>
                <div className="flex-1 text-center font-medium">
                  {exitFixedAmount ? addCommasToThousand(exitFixedAmount) : '10,000'}원
                  <div className="text-xs text-gray-500">단위: 10,000원</div>
                </div>
                <Button
                  variant="blue"
                  size="icon"
                  onClick={handleExitAmountIncrease}
                  disabled={exitFixedAmount ? exitFixedAmount >= 1000000 : false}
                  className="h-8 w-8"
                >
                  +
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="blue"
                  onClick={() => handleExitAmountSelect(100000)}
                  className={`flex-1 ${exitFixedAmount === 100000 ? 'opacity-100' : 'opacity-50'}`}
                >
                  100,000원
                </Button>
                <Button
                  variant="blue"
                  onClick={() => handleExitAmountSelect(1000000)}
                  className={`flex-1 ${exitFixedAmount === 1000000 ? 'opacity-100' : 'opacity-50'}`}
                >
                  1,000,000원
                </Button>
              </div>
            </div>
          )}

          {exitInvestmentMethod === 'FIXED_PERCENTAGE' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 rounded-md bg-modal-background-color p-2">
                <Button
                  variant="blue"
                  size="icon"
                  onClick={handleExitPercentageDecrease}
                  disabled={exitFixedPercentage ? exitFixedPercentage <= 10 : false}
                  className="h-8 w-8"
                >
                  -
                </Button>
                <div className="flex-1 text-center font-medium">
                  {exitFixedPercentage ? exitFixedPercentage : '10'}%
                  <div className="text-xs text-gray-500">단위: 10%</div>
                </div>
                <Button
                  variant="blue"
                  size="icon"
                  onClick={handleExitPercentageIncrease}
                  disabled={exitFixedPercentage ? exitFixedPercentage >= 100 : false}
                  className="h-8 w-8"
                >
                  +
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="blue"
                  onClick={() => handleExitPercentageSelect(50)}
                  className={`flex-1 ${exitFixedPercentage === 50 ? 'opacity-100' : 'opacity-50'}`}
                >
                  50%
                </Button>
                <Button
                  variant="blue"
                  onClick={() => handleExitPercentageSelect(100)}
                  className={`flex-1 ${exitFixedPercentage === 100 ? 'opacity-100' : 'opacity-50'}`}
                >
                  100%
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 수수료 포함 여부 */}
      {/* <div className="flex w-full items-center justify-between">
        <p className="text-lg font-bold">수수료 포함</p>
        <Switch checked={isFee} onCheckedChange={setIsFee} />
      </div> */}

      <div className="mt-5 flex w-full gap-2">
        <Button variant="blue" onClick={() => navigate('/algorithm-lab/style')} className="flex-1">
          이전
        </Button>
        <Button
          variant="blue"
          onClick={() => navigate('/algorithm-lab/market')}
          disabled={
            !entryInvestmentMethod ||
            (entryInvestmentMethod === 'FIXED_AMOUNT' &&
              (!entryFixedAmount || entryFixedAmount < 10000 || entryFixedAmount > 1000000)) ||
            (entryInvestmentMethod === 'FIXED_PERCENTAGE' &&
              (!entryFixedPercentage || entryFixedPercentage < 1)) ||
            !exitInvestmentMethod ||
            (exitInvestmentMethod === 'FIXED_AMOUNT' &&
              (!exitFixedAmount || exitFixedAmount < 10000 || exitFixedAmount > 1000000)) ||
            (exitInvestmentMethod === 'FIXED_PERCENTAGE' &&
              (!exitFixedPercentage || exitFixedPercentage < 1))
          }
          className="flex-1 disabled:cursor-not-allowed"
        >
          다음
        </Button>
      </div>
    </div>
  );
};
