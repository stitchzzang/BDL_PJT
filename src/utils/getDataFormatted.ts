export const getDataFormatted = (isoDateString: string) => {
  if (!isoDateString) return '';
  return isoDateString.split('T')[0];
};

// 사용 예시
// const result = formatDateOnly('2025-03-28T06:29:00');
// console.log(result); "2025-03-28"
