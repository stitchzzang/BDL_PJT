import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';

import graphMotion from '@/assets/lottie/graph-animation.json';
import moneyMotion from '@/assets/lottie/money-animation.json';
import { HelpBadge } from '@/components/common/help-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import { InvalidAccessPage } from '@/routes/pages/algorithm-lab/InvalidAccessPage';
import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';

export const MethodPage = () => {
  const isValidAccess = useAlgorithmLabGuard('method');
  const navigate = useNavigate();
  const { investmentMethod, investmentAmount, setInvestmentMethod, setInvestmentAmount } =
    useAlgorithmLabStore();

  if (!isValidAccess) {
    return <InvalidAccessPage />;
  }

  // 투자 금액 변경 시 이벤트 핸들러
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^0-9]/g, '').replace(/^0+/, '');
    setInvestmentAmount(Number(sanitizedValue));
  };

  // 투자 금액 입력 시 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/[0-9]/.test(e.key) &&
      e.key !== 'Backspace' &&
      e.key !== 'Delete' &&
      !e.key.includes('Arrow')
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5">
      <h2 className="text-3xl font-bold">투자 방식 설정</h2>
      <HelpBadge
        title="투자는 어떤 방식으로 설정할까요?"
        description="투자 금액을 어떻게 설정할까요?
        선택하신 방법에 따라 알고리즘이 투자를 진행합니다."
      />

      <p className="w-full text-left text-lg font-bold">옵션 중 하나를 선택해주세요.</p>
      {investmentMethod === 'fixed' ? (
        <div className="m-[10px]">
          <Lottie
            animationData={moneyMotion}
            loop={true}
            autoplay={true}
            style={{ height: 150, width: 150 }}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice',
            }}
          />
        </div>
      ) : (
        <div>
          <Lottie
            animationData={graphMotion}
            loop={true}
            autoplay={true}
            style={{ height: 170, width: 170 }}
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice',
            }}
          />
        </div>
      )}

      <div className="flex w-full gap-4">
        <Button
          variant="blue"
          onClick={() => setInvestmentMethod('ratio')}
          className={`flex-1 flex-col items-center p-4 ${
            investmentMethod === 'ratio' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'
          }`}
        >
          <p className="text-lg font-bold">자산비율 투자</p>
          <p className="whitespace-normal text-sm">내 자산의 일정 비율을 사용</p>
        </Button>
        <Button
          variant="blue"
          onClick={() => setInvestmentMethod('fixed')}
          className={`flex-1 flex-col items-center p-4 ${
            investmentMethod === 'fixed' ? 'bg-btn-blue-color' : 'bg-btn-blue-color/20'
          }`}
        >
          <p className="text-lg font-bold">고정금액 투자</p>
          <p className="whitespace-normal text-sm">매 거래마다 일정 금액 사용</p>
        </Button>
      </div>
      <div className="w-full">
        <Input
          type="text"
          value={investmentAmount || ''}
          onChange={handleAmountChange}
          onKeyDown={handleKeyDown}
          placeholder="투자 금액을 입력하세요"
          className="h-12 w-full"
        />
      </div>
      <div className="flex w-full gap-2">
        <Button variant="blue" onClick={() => navigate('/algorithm-lab/style')} className="flex-1">
          이전
        </Button>
        <Button
          variant="blue"
          onClick={() => navigate('/algorithm-lab/market')}
          disabled={!investmentMethod || investmentAmount <= 0}
          className="flex-1 disabled:cursor-not-allowed"
        >
          다음
        </Button>
      </div>
    </div>
  );
};
