import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import { InvalidAccessPage } from '@/routes/pages/algorithmLab/InvalidAccessPage';
import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';

export const ConfirmPage = () => {
  const isValidAccess = useAlgorithmLabGuard('confirm');
  const navigate = useNavigate();
  const {
    name,
    investmentStyle,
    investmentMethod,
    investmentAmount,
    marketResponse,
    riseResponse,
    fallResponse,
    resetState,
  } = useAlgorithmLabStore();

  if (!isValidAccess) {
    return <InvalidAccessPage />;
  }

  const getStyleText = (style: string) => {
    switch (style) {
      case 'conservative':
        return '보수적';
      case 'balanced':
        return '균형적';
      case 'aggressive':
        return '공격적';
      default:
        return '';
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'ratio':
        return '자산비율 투자';
      case 'fixed':
        return '고정금액 투자';
      default:
        return '';
    }
  };

  const getMarketResponseText = (response: string) => {
    switch (response) {
      case 'shortTerm':
        return '단기 변화에 반응';
      case 'monthlyTrend':
        return '월간 추세에 반응';
      default:
        return '';
    }
  };

  const handleComplete = () => {
    // TODO: API 호출 등 완료 처리
    resetState();
    navigate('/member/algorithm');
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8">
      <h2 className="text-3xl font-bold">알고리즘 확인</h2>
      <div className="w-full space-y-6 rounded-lg border border-btn-primary-inactive-color bg-modal-background-color p-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-text-inactive-3-color">알고리즘 이름</h3>
          <p>{name}</p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-text-inactive-3-color">투자 스타일</h3>
          <p>{investmentStyle && getStyleText(investmentStyle)}</p>
          <p>이익 실현 : {riseResponse}%</p>
          <p>손절매 : {fallResponse}%</p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-text-inactive-3-color">투자 방식</h3>
          <p>
            {investmentMethod && getMethodText(investmentMethod)} :{' '}
            {investmentAmount.toLocaleString()}원
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold text-text-inactive-3-color">시장 반응</h3>
          <p>{marketResponse && getMarketResponseText(marketResponse)}</p>
          <p>상승 시 반응 강도 : {riseResponse}%</p>
          <p>하락 시 반응 강도 : {fallResponse}%</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-inactive-3-color">추세 분석</h3>
        </div>
      </div>
      <div className="flex w-full gap-2">
        <Button variant="blue" onClick={() => navigate('/algorithm-lab/market')} className="flex-1">
          이전
        </Button>
        <Button variant="blue" onClick={handleComplete} className="flex-1">
          완료
        </Button>
      </div>
    </div>
  );
};
