// numberFormatter.ts - 숫자 포맷팅 유틸리티 함수들

/**
 * 숫자에 천 단위 콤마를 추가합니다.
 * 예시:
 * - 1234567 -> "1,234,567"
 * - 1234.56 -> "1,234.56"
 * - "1234567" -> "1,234,567"
 * @param value - 변환할 숫자 또는 문자열
 * @returns 천 단위 콤마가 포함된 문자열
 */
export const addCommasToThousand = (value: number | string): string => {
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

/**
 * 숫자를 한국어 돈 단위(조, 억)로 변환합니다.
 * 예시:
 * - 1234567890 -> "12억"
 * - 1234567890123 -> "1조"
 * - 1234567 -> "1,234,567"
 * @param amount - 변환할 숫자
 * @returns 한국어 돈 단위로 변환된 문자열
 */
export const formatKoreanMoney = (amount: number): string => {
  if (amount >= 1000000000000) {
    // 1조 이상
    const trillions = Math.floor(amount / 1000000000000);
    return `${trillions}조`;
  } else if (amount >= 100000000) {
    // 1억 이상
    const billions = Math.floor(amount / 100000000);
    return `${billions}억`;
  } else {
    return amount.toLocaleString();
  }
};
