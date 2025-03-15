export interface DataPoint {
  date: string;
  open: number;
  low: number;
  high: number;
  close: number;
  volume: number;
  ema12?: number;
  ema26?: number;
}

export const initialData: DataPoint[] = [
  {
    date: '2021-02-02 16:00:00',
    open: 134.9307,
    low: 134.9105,
    high: 135.4215,
    close: 135.0087,
    volume: 73591581,
  },
  {
    date: '2021-02-02 15:45:00',
    open: 134.9707,
    low: 134.9307,
    high: 134.9707,
    close: 134.9307,
    volume: 67639193,
  },
  {
    date: '2021-02-02 15:30:00',
    open: 134.6608,
    low: 134.6608,
    high: 134.975,
    close: 134.975,
    volume: 64815258,
  },
  // ... 나머지 데이터는 위에서 제공된 data.js의 데이터를 그대로 복사해서 넣으시면 됩니다
];

export const dummyChartData = [
  {
    date: '2021-02-02 16:00:00',
    open: 134.9307,
    low: 134.9105,
    high: 135.4215,
    close: 135.0087,
    volume: 73591581,
  },
  {
    date: '2021-02-02 15:45:00',
    open: 134.9707,
    low: 134.9307,
    high: 134.9707,
    close: 134.9307,
    volume: 67639193,
  },
  {
    date: '2021-02-02 15:30:00',
    open: 134.6608,
    low: 134.6608,
    high: 134.975,
    close: 134.975,
    volume: 64815258,
  },
];
