/**
 * 오늘 날짜를 'YYYY-MM-DD' 형식의 문자열로 반환합니다.
 * @returns {string} 'YYYY-MM-DD' 형식의 날짜 문자열
 */
export const getTodayFormatted = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};
