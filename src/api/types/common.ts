export interface ApiResponse<T> {
  code: number;
  isSuccess: boolean;
  message: string;
  result: T;
}
