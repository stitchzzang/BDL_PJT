import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';

import graphMove from '@/assets/lottie/graph-animation.json';
import { HelpBadge } from '@/components/common/help-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TermTooltip } from '@/components/ui/TermTooltip';
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
            <TermTooltip term="진입">진입</TermTooltip> <TermTooltip term="청산">청산</TermTooltip>{' '}
            방식을 설정해주세요.
            <br />
            선택하신 방법에 따라 알고리즘이 투자를 진행합니다.
          </>
        }
      />

      {/* 진입 방식 설정 */}
      <div className="w-full space-y-4">
        <p className="text-lg font-bold">
          <TermTooltip term="진입">진입</TermTooltip> 방식 설정
        </p>
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
              onClick={() => {
                setEntryInvestmentMethod('FIXED_AMOUNT');
                setEntryFixedAmount(1000);
                setEntryFixedPercentage(null);
              }}
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
              onClick={() => {
                setEntryInvestmentMethod('FIXED_PERCENTAGE');
                setEntryFixedPercentage(entryMethod === 'ONCE' ? 100 : 1);
                setEntryFixedAmount(null);
              }}
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
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  value={entryFixedAmount ? addCommasToThousand(entryFixedAmount) : ''}
                  onChange={(e) => {
                    const value = Number(e.target.value.replace(/,/g, ''));
                    if (e.target.value === '') {
                      setEntryFixedAmount(null);
                    } else if (!isNaN(value)) {
                      setEntryFixedAmount(value);
                    }
                  }}
                  placeholder="고정 금액을 입력하세요 (최소 1,000원)"
                  className="h-12 w-full pr-7"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">원</span>
              </div>
              {entryFixedAmount !== null &&
                (entryFixedAmount < 1000 ||
                  entryFixedAmount % 1000 !== 0 ||
                  entryFixedAmount < 0) && (
                  <p className="text-sm text-red-500">1,000원 이상의 1,000원 단위로 입력해주세요</p>
                )}
            </div>
          )}
          {entryInvestmentMethod === 'FIXED_PERCENTAGE' && (
            <div className="relative">
              <Input
                type="text"
                value={entryFixedPercentage ? `${entryFixedPercentage}` : ''}
                onChange={(e) => {
                  const value = Number(e.target.value.replace(/%/g, ''));
                  if (e.target.value === '') {
                    setEntryFixedPercentage(null);
                  } else if (!isNaN(value)) {
                    if (value >= 1 && value <= 100) {
                      setEntryFixedPercentage(value);
                    } else if (value > 100) {
                      setEntryFixedPercentage(100);
                    }
                  }
                }}
                placeholder="고정 비율을 입력하세요 (1~100)"
                className="h-12 w-full pr-7"
                disabled={entryMethod === 'ONCE'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
            </div>
          )}
        </div>
      </div>

      {/* 청산 방식 설정 */}
      <div className="w-full space-y-4">
        <p className="text-lg font-bold">
          <TermTooltip term="청산">청산</TermTooltip> 방식 설정
        </p>
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
              onClick={() => {
                setExitInvestmentMethod('FIXED_AMOUNT');
                setExitFixedAmount(1000);
                setExitFixedPercentage(null);
              }}
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
              onClick={() => {
                setExitInvestmentMethod('FIXED_PERCENTAGE');
                setExitFixedPercentage(exitMethod === 'ONCE' ? 100 : 1);
                setExitFixedAmount(null);
              }}
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
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type="text"
                  value={exitFixedAmount ? addCommasToThousand(exitFixedAmount) : ''}
                  onChange={(e) => {
                    const value = Number(e.target.value.replace(/,/g, ''));
                    if (e.target.value === '') {
                      setExitFixedAmount(null);
                    } else if (!isNaN(value)) {
                      setExitFixedAmount(value);
                    }
                  }}
                  placeholder="고정 금액을 입력하세요 (최소 1,000원)"
                  className="h-12 w-full pr-7"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">원</span>
              </div>
              {exitFixedAmount !== null &&
                (exitFixedAmount < 1000 || exitFixedAmount % 1000 !== 0 || exitFixedAmount < 0) && (
                  <p className="text-sm text-red-500">1,000원 이상의 1,000원 단위로 입력해주세요</p>
                )}
            </div>
          )}
          {exitInvestmentMethod === 'FIXED_PERCENTAGE' && (
            <div className="relative">
              <Input
                type="text"
                value={exitFixedPercentage ? `${exitFixedPercentage}` : ''}
                onChange={(e) => {
                  const value = Number(e.target.value.replace(/%/g, ''));
                  if (e.target.value === '') {
                    setExitFixedPercentage(null);
                  } else if (!isNaN(value)) {
                    if (value >= 1 && value <= 100) {
                      setExitFixedPercentage(value);
                    } else if (value > 100) {
                      setExitFixedPercentage(100);
                    }
                  }
                }}
                placeholder="고정 비율을 입력하세요 (1~100)"
                className="h-12 w-full pr-7"
                disabled={exitMethod === 'ONCE'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
            </div>
          )}
        </div>
      </div>

      {/* 수수료 포함 여부 */}
      {/* <div className="flex w-full items-center justify-between">
        <p className="text-lg font-bold">수수료 포함</p>
        <Switch checked={isFee} onCheckedChange={setIsFee} />
      </div> */}

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
                (entryInvestmentMethod === 'FIXED_AMOUNT' &&
                  (!entryFixedAmount || entryFixedAmount < 10)) ||
                (entryInvestmentMethod === 'FIXED_PERCENTAGE' && !entryFixedPercentage))) ||
            !exitMethod ||
            (exitMethod === 'DIVIDE' &&
              (!exitInvestmentMethod ||
                (exitInvestmentMethod === 'FIXED_AMOUNT' &&
                  (!exitFixedAmount || exitFixedAmount < 10)) ||
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
