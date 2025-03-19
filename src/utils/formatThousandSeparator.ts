export const formatThousandSeparator = (amount: number): string => {
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
