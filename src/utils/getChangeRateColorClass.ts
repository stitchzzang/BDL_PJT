export function getChangeRateColorClass(changeRate: number) {
  return changeRate >= 0
    ? 'border-btn-red-color text-btn-red-color'
    : 'border-btn-blue-color text-btn-blue-color';
}
