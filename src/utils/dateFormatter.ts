export const formatDateToYYMMDD = (date: Date): string => {
  const yy = date.getFullYear().toString().slice(2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yy}${mm}${dd}`;
};

export const formatYYMMDDToYYYYMMDD = (dateStr: string): string => {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.length !== 6) {
    console.warn(`[formatYYMMDDToYYYYMMDD] 유효하지 않은 날짜 형식: ${dateStr}`);
    return '2023-01-01'; // 기본값 반환
  }

  // 숫자만 포함되어 있는지 확인
  if (!/^\d+$/.test(dateStr)) {
    console.warn(`[formatYYMMDDToYYYYMMDD] 날짜에 숫자가 아닌 문자 포함: ${dateStr}`);
    return '2023-01-01'; // 기본값 반환
  }

  const yy = dateStr.slice(0, 2);
  const mm = dateStr.slice(2, 4);
  const dd = dateStr.slice(4, 6);

  // 월과 일이 유효한 범위인지 확인
  const month = parseInt(mm, 10);
  const day = parseInt(dd, 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    console.warn(`[formatYYMMDDToYYYYMMDD] 유효하지 않은 월/일: ${dateStr}`);
    return '2023-01-01'; // 기본값 반환
  }

  return `20${yy}-${mm}-${dd}`;
};
