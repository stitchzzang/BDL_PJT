import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export const SignUpSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-5">
        <h1 className="text-3xl font-bold">회원가입 완료</h1>
        <div className="flex min-w-[400px] flex-col items-center justify-center gap-3 rounded-[20px] bg-modal-background-color p-6 shadow-lg">
          <div className="flex flex-col items-center justify-center gap-1 text-lg text-border-color">
            <p>회원가입이 완료되었습니다.</p>
            <p>로그인하여 BDL을 즐겨보세요.</p>
          </div>
          <Button variant="blue" className="mt-5 w-full" onClick={() => navigate('/login')}>
            로그인
          </Button>
        </div>
      </div>
    </div>
  );
};
