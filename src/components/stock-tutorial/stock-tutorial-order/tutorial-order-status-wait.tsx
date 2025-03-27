import { Button } from '@/components/ui/button';

export const TutorialOrderStatusWait = () => {
  const h3Style = 'text-[16px] font-bold text-btn-green-color';

  return (
    <div>
      <div className="mb-[30px] flex flex-col items-center justify-center gap-0">
        <p className="text-border-color">아무 행동을 하지 않고</p>
        <p className="text-border-color">
          <span className={h3Style}>다음 턴</span>
          으로 넘어갑니다.
        </p>
      </div>
      <Button variant="green" className="w-full" size="lg">
        <p className=" text-[18px] font-medium text-white">관망하기</p>
      </Button>
    </div>
  );
};
