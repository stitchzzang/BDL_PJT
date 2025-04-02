import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { HelpBadge } from '@/components/common/help-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlgorithmLabGuard } from '@/hooks/useAlgorithmLabGuard';
import { InvalidAccessPage } from '@/routes/pages/algorithm-lab/InvalidAccessPage';
import { useAlgorithmLabStore } from '@/store/useAlgorithmLabStore';
import { useAuthStore } from '@/store/useAuthStore';

export const NamePage = () => {
  const isValidAccess = useAlgorithmLabGuard('name');
  const { isLogin } = useAuthStore();
  const navigate = useNavigate();
  const { algorithmName, setAlgorithmName } = useAlgorithmLabStore();
  const [nowName, setNowName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 유효성 검사 함수
  const validateName = (name: string) => {
    // 비어있는 경우
    if (name.trim() === '') {
      setErrorMessage('');
      return false;
    }

    if (name.length === 1) {
      setErrorMessage('알고리즘 이름은 2자 이상이어야 합니다.');
      return false;
    }

    // 특수문자 검사 (한글, 영문, 숫자만 허용)
    if (!/^[가-힣a-zA-Z0-9]+$/.test(name)) {
      setErrorMessage('특수문자 및 자음/모음은 사용할 수 없습니다.');
      return false;
    }

    // 길이 검사
    if (name.length > 10) {
      setErrorMessage('알고리즘 이름은 10자 이하여야 합니다.');
      return false;
    }

    // 모든 검사 통과
    setErrorMessage('');
    return true;
  };

  if (!isValidAccess) {
    return <InvalidAccessPage />;
  }

  if (!isLogin) {
    toast.error('로그인 후 이용해주세요.');
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">"나만의 자동 매매 전략 만들기"</h1>
      <HelpBadge
        title="안녕하세요! 먼저 전략에 이름을 지어주세요."
        description="여러분이 생성한 알고리즘은 저장하여 나중에 확인이 가능합니다.
        알고리즘 이름을 생성하여 편하게 관리해보세요!"
      />
      <Badge variant="destructive" className="flex w-full flex-col items-baseline gap-1">
        <span className="text-base font-bold">⚠️ 주의</span>
        <span className="text-sm">이름은 수정이 불가능하니 신중히 결정해주세요!</span>
      </Badge>
      <div className="relative w-full">
        <AnimatePresence>
          {nowName && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="flex justify-center overflow-hidden text-[22px] font-bold text-btn-blue-color"
              style={{
                textShadow: '0 0 20px rgba(20, 61, 128, 0.7), 0 0 5px rgba(8, 32, 72, 0.5)',
                filter: 'drop-shadow(0 0 1px #0a68ff)',
              }}
            >
              <motion.h1
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {nowName}
              </motion.h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 아래 요소들을 컨테이너로 감싸서 함께 움직이게 함 */}
        <motion.div
          animate={{
            y: nowName ? 20 : 0,
          }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-4 w-full">
            <Input
              type="text"
              value={algorithmName}
              onChange={(e) => {
                const newValue = e.target.value;
                setAlgorithmName(newValue);
                setNowName(newValue);
                validateName(newValue);
              }}
              placeholder="알고리즘 이름을 작성하세요."
              className={`h-12 transition-colors duration-200 focus:outline-none focus:ring-2 ${
                errorMessage
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                  : 'focus:border-blue-500 focus:ring-blue-200'
              }`}
            />
            {errorMessage && <p className="mt-1 text-sm text-red-500">{errorMessage}</p>}
          </div>
          <div className="flex w-full gap-2">
            <Button variant="blue" onClick={() => navigate('/algorithm-lab')} className="flex-1">
              이전
            </Button>
            <Button
              variant="blue"
              onClick={() => navigate('/algorithm-lab/style')}
              disabled={!algorithmName.trim() || !!errorMessage}
              className="flex-1 disabled:cursor-not-allowed"
            >
              다음
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
