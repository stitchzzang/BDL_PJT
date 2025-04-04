export const formatDateToYYMMDD = (date: Date): string => {
  const yy = date.getFullYear().toString().slice(2);
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yy}${mm}${dd}`;
};

export const formatYYMMDDToYYYYMMDD = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 6) return '';
  const yy = dateStr.slice(0, 2);
  const mm = dateStr.slice(2, 4);
  const dd = dateStr.slice(4, 6);
  return `20${yy}-${mm}-${dd}`;
};
