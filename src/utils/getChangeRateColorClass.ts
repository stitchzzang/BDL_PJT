export function getChangeRateColorClass(changeRate: number) {
  return changeRate > 0
    ? 'border-btn-red-color text-btn-red-color'
    : changeRate < 0
      ? 'border-btn-blue-color text-btn-blue-color'
      : 'border-border-color text-border-color';
}
