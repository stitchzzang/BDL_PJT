import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const MemberInvestmentPage = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row gap-3">
        <div className="flex flex-col items-start">
          <p>총 자산</p>
          <p>52,1223,425원</p>
        </div>
        <div className="flex flex-row items-start rounded-lg bg-modal-background-color p-3">
          <div className="flex flex-col items-start">
            <p>내 평가금</p>
            <p>32,123,425원</p>
          </div>
          <hr className="h-full w-1 border-r border-btn-primary-inactive-color" />
          <div className="flex  flex-col items-start">
            <p>내 현금</p>
            <p>32,123,425원</p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">
          <Badge variant="increase">총 수익률: +32.12%</Badge>
          <Badge variant="main">총 수익: 50,000,000원</Badge>
          <Badge variant="decrease">일간 수익률: -32.12%</Badge>
          <Badge variant="main">일간 수익: -5,000원</Badge>
        </div>
        <div className="flex flex-row gap-3">
          <Button variant="red">자산 초기화 하기</Button>
        </div>
      </div>
      <hr className="w-full border-btn-primary-inactive-color" />
      <div className="flex flex-row gap-3">
        <div className="flex flex-row gap-2 rounded-lg border border-border-color bg-modal-background-color p-3">
          <p>전체 개수:</p>
          <span>12개</span>
        </div>
      </div>
    </div>
  );
};
