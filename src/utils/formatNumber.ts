// formatNumber.ts - 숫자 포맷팅 유틸리티 함수
export const formatNumber = (value: number | string): string => {
  // 문자열로 변환
  const numStr = typeof value === 'string' ? value : String(value);

  // 소수점 처리를 위해 숫자를 소수점 앞/뒤로 분리
  const parts = numStr.split('.');
  const integerPart = parts[0];

  // 정수 부분에 천 단위 콤마 추가
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // 소수점이 있다면 합치기
  if (parts.length > 1) {
    return `${formattedInteger}.${parts[1]}`;
  }

  return formattedInteger;
};
