import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const MemberInvestmentPage = () => {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-row gap-3">
        <div className="flex flex-col items-start">
          <p className="text-lg text-border-color">총 자산</p>
          <p className="text-4xl font-bold">52,1223,425원</p>
        </div>
        <div className="flex flex-row items-start rounded-lg bg-modal-background-color p-3">
          <div className="flex flex-col items-start">
            <p className="text-sm text-border-color">내 평가금</p>
            <p className="text-3xl font-bold text-btn-red-color">32,123,425원</p>
          </div>
          <div className="mx-4 h-full w-[1px] bg-btn-primary-inactive-color" />
          <div className="flex flex-col items-start">
            <p className="text-sm text-border-color">내 현금</p>
            <p className="text-3xl font-bold text-btn-green-color">32,123,425원</p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row gap-3">
          <Badge variant="increase">
            <span className="mr-1 text-sm text-border-color">총 수익률:</span>
            <span className="text-sm text-btn-blue-color">+32.12%</span>
          </Badge>
          <Badge variant="main">
            <span className="mr-1 text-sm text-border-color">총 수익:</span>50,000,000원
          </Badge>
          <Badge variant="decrease">
            <span className="mr-1 text-sm text-border-color">일간 수익률:</span>
            <span className="text-sm text-btn-red-color">-32.12%</span>
          </Badge>
          <Badge variant="main">
            <span className="mr-1 text-sm text-border-color">일간 수익:</span>-5,000원
          </Badge>
        </div>
        <div className="flex flex-row gap-3">
          <Button variant="red">자산 초기화 하기</Button>
        </div>
      </div>
      <hr className="mt-5 w-full border-btn-primary-inactive-color" />
      <div className="flex flex-row gap-3">
        <div className="flex flex-row gap-2 rounded-lg border border-border-color bg-modal-background-color p-3">
          <p>전체 개수:</p>
          <span>12개</span>
        </div>
      </div>
    </div>
  );
};
