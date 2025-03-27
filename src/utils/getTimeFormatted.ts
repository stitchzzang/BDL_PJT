export const getFormatTime = (timeInput: string | number): string => {
  // 입력값을 문자열로 변환
  const timeString: string = String(timeInput);

  // 6자리가 아닌 경우 예외 처리
  if (timeString.length !== 6) {
    return '유효하지 않은 형식입니다. 6자리 숫자를 입력하세요.';
  }

  // 시, 분, 초 추출
  const hours: string = timeString.substring(0, 2);
  const minutes: string = timeString.substring(2, 4);
  const seconds: string = timeString.substring(4, 6);

  // 형식에 맞게 반환
  return `${hours}:${minutes}:${seconds}`;
};
