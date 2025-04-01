/**
 * 페이지를 부드럽게 상단으로 스크롤합니다.
 */
export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
