import { useEffect } from 'react';

/**
 * 컴포넌트가 마운트될 때 페이지를 상단으로 스크롤합니다.
 * 주로 페이지 컴포넌트에서 사용하여 페이지 진입 시 스크롤을 초기화하는 용도로 활용합니다.
 *
 * 사용 예시:
 * ```tsx
 * const MyPage = () => {
 *   useAutoScrollTop(); // 페이지 진입 시 맨 위로 스크롤
 *   return <div>페이지 내용</div>;
 * };
 * ```
 */
export const useAutoScrollTop = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);
};
