import { useNavigate } from 'react-router-dom';

import { HelpBadge } from '@/components/common/help-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import { InvalidAccessPage } from '@/routes/pages/algorithm-lab/InvalidAccessPage';
import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';

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

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <h2 className="text-3xl font-bold">투자 방식 설정</h2>
      <HelpBadge
        title="투자는 어떤 방식으로 설정할까요?"
        description="진입/청산 방식을 설정해주세요.
        선택하신 방법에 따라 알고리즘이 투자를 진행합니다."
      />

      {/* 진입 방식 설정 */}
      <div className="w-full space-y-4">
        <p className="text-lg font-bold">진입 방식 설정</p>
        <div className="flex gap-4">
          <Button
            variant="blue"
            onClick={() => {
              setEntryMethod('ONCE');
              setEntryInvestmentMethod('FIXED_PERCENTAGE');
              setEntryFixedPercentage(100);
            }}
            className={`flex-1 ${entryMethod === 'ONCE' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'}`}
          >
            한번에 진입
          </Button>
          <Button
            variant="blue"
            onClick={() => {
              setEntryMethod('DIVIDE');
              setEntryInvestmentMethod('FIXED_PERCENTAGE');
            }}
            className={`flex-1 ${entryMethod === 'DIVIDE' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'}`}
          >
            나누어 진입
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant="blue"
              onClick={() => setEntryInvestmentMethod('FIXED_AMOUNT')}
              disabled={entryMethod === 'ONCE'}
              className={`flex-1 ${
                entryInvestmentMethod === 'FIXED_AMOUNT'
                  ? 'bg-btn-blue-color'
                  : 'bg-btn-blue-color/20'
              } ${entryMethod === 'ONCE' ? 'opacity-50' : ''}`}
            >
              고정 금액
            </Button>
            <Button
              variant="blue"
              onClick={() => setEntryInvestmentMethod('FIXED_PERCENTAGE')}
              className={`flex-1 ${
                entryInvestmentMethod === 'FIXED_PERCENTAGE'
                  ? 'bg-btn-blue-color'
                  : 'bg-btn-blue-color/20'
              }`}
            >
              고정 비율
            </Button>
          </div>
          {entryInvestmentMethod === 'FIXED_AMOUNT' && entryMethod !== 'ONCE' && (
            <Input
              type="number"
              value={entryFixedAmount || ''}
              onChange={(e) => setEntryFixedAmount(Number(e.target.value))}
              placeholder="고정 금액을 입력하세요"
              className="h-12 w-full"
            />
          )}
          {entryInvestmentMethod === 'FIXED_PERCENTAGE' && (
            <Input
              type="number"
              value={entryFixedPercentage || ''}
              onChange={(e) => setEntryFixedPercentage(Number(e.target.value))}
              placeholder="고정 비율(%)을 입력하세요"
              className="h-12 w-full"
              disabled={entryMethod === 'ONCE'}
            />
          )}
        </div>
      </div>

      {/* 청산 방식 설정 */}
      <div className="w-full space-y-4">
        <p className="text-lg font-bold">청산 방식 설정</p>
        <div className="flex gap-4">
          <Button
            variant="blue"
            onClick={() => {
              setExitMethod('ONCE');
              setExitInvestmentMethod('FIXED_PERCENTAGE');
              setExitFixedPercentage(100);
            }}
            className={`flex-1 ${exitMethod === 'ONCE' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'}`}
          >
            한번에 청산
          </Button>
          <Button
            variant="blue"
            onClick={() => {
              setExitMethod('DIVIDE');
              setExitInvestmentMethod('FIXED_PERCENTAGE');
            }}
            className={`flex-1 ${exitMethod === 'DIVIDE' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'}`}
          >
            나누어 청산
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant="blue"
              onClick={() => setExitInvestmentMethod('FIXED_AMOUNT')}
              disabled={exitMethod === 'ONCE'}
              className={`flex-1 ${
                exitInvestmentMethod === 'FIXED_AMOUNT'
                  ? 'bg-btn-blue-color'
                  : 'bg-btn-blue-color/20'
              } ${exitMethod === 'ONCE' ? 'opacity-50' : ''}`}
            >
              고정 금액
            </Button>
            <Button
              variant="blue"
              onClick={() => setExitInvestmentMethod('FIXED_PERCENTAGE')}
              className={`flex-1 ${
                exitInvestmentMethod === 'FIXED_PERCENTAGE'
                  ? 'bg-btn-blue-color'
                  : 'bg-btn-blue-color/20'
              }`}
            >
              고정 비율
            </Button>
          </div>
          {exitInvestmentMethod === 'FIXED_AMOUNT' && exitMethod !== 'ONCE' && (
            <Input
              type="number"
              value={exitFixedAmount || ''}
              onChange={(e) => setExitFixedAmount(Number(e.target.value))}
              placeholder="고정 금액을 입력하세요"
              className="h-12 w-full"
            />
          )}
          {exitInvestmentMethod === 'FIXED_PERCENTAGE' && (
            <Input
              type="number"
              value={exitFixedPercentage || ''}
              onChange={(e) => setExitFixedPercentage(Number(e.target.value))}
              placeholder="고정 비율(%)을 입력하세요"
              className="h-12 w-full"
              disabled={exitMethod === 'ONCE'}
            />
          )}
        </div>
      </div>

      {/* 수수료 포함 여부 */}
      <div className="flex w-full items-center justify-between">
        <p className="text-lg font-bold">수수료 포함</p>
        <Switch checked={isFee} onCheckedChange={setIsFee} />
      </div>

      <div className="flex w-full gap-2">
        <Button variant="blue" onClick={() => navigate('/algorithm-lab/style')} className="flex-1">
          이전
        </Button>
        <Button
          variant="blue"
          onClick={() => navigate('/algorithm-lab/market')}
          disabled={
            !entryMethod ||
            (entryMethod === 'DIVIDE' &&
              (!entryInvestmentMethod ||
                (entryInvestmentMethod === 'FIXED_AMOUNT' && !entryFixedAmount) ||
                (entryInvestmentMethod === 'FIXED_PERCENTAGE' && !entryFixedPercentage))) ||
            !exitMethod ||
            (exitMethod === 'DIVIDE' &&
              (!exitInvestmentMethod ||
                (exitInvestmentMethod === 'FIXED_AMOUNT' && !exitFixedAmount) ||
                (exitInvestmentMethod === 'FIXED_PERCENTAGE' && !exitFixedPercentage)))
          }
          className="flex-1 disabled:cursor-not-allowed"
        >
          다음
        </Button>
      </div>
    </div>
  );
};
