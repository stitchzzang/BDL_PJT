import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * 페이지 이탈 방지를 위한 커스텀 훅
 *
 * @param when 이 값이 true일 때 이탈 방지가 활성화됩니다
 * @param message 사용자에게 표시할 확인 메시지
 */
export const usePreventLeave = (when: boolean, message: string) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPathRef = useRef(location.pathname);

  // beforeunload 이벤트 핸들러 (페이지 새로고침, 브라우저 닫기 등)
  useEffect(() => {
    if (when) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = message; // Chrome에서는 이 설정이 필요
        return message; // 다른 브라우저를 위한 리턴값
      };

      // 이벤트 리스너 등록
      window.addEventListener('beforeunload', handleBeforeUnload);

      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [when, message]);

  // 경로 변경 감지 - 다른 페이지로 이동할 때 작동
  useEffect(() => {
    // location이 변경되었고, 현재 경로가 이전 경로와 다르고, when 조건이 true일 때
    if (when && location.pathname !== currentPathRef.current) {
      // 확인 창 표시
      const confirmed = window.confirm(message);
      if (!confirmed) {
        // 사용자가 취소하면 이전 경로로 다시 이동
        navigate(currentPathRef.current, { replace: true });
        return;
      }
      // 사용자가 확인을 누르면 현재 경로를 업데이트
      currentPathRef.current = location.pathname;
    }
  }, [when, message, location.pathname, navigate]);

  // 브라우저의 뒤로가기/앞으로가기 버튼 감지를 위한 추가 이벤트 핸들러
  useEffect(() => {
    if (!when) return;

    // popstate 이벤트는 브라우저의 히스토리 엔트리가 변경될 때 발생
    const handlePopState = (e: PopStateEvent) => {
      // 사용자에게 확인 메시지 표시
      const confirmed = window.confirm(message);
      if (!confirmed) {
        // 사용자가 취소하면 현재 URL로 히스토리 엔트리 추가 (뒤로가기 방지)
        window.history.pushState(null, '', window.location.href);
      } else {
        // 사용자가 확인하면 현재 경로 업데이트
        currentPathRef.current = location.pathname;
      }
    };

    // popstate 이벤트 리스너 등록
    window.addEventListener('popstate', handlePopState);

    // history.pushState를 가로채서 현재 페이지 상태 저장
    window.history.pushState(null, '', window.location.href);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [when, message, navigate, location.pathname]);
};
