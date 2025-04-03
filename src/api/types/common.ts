export interface ApiResponse<T> {
  code: number;
  isSuccess: boolean;
  message: string;
  result: T;
}

export interface ApiSuccess<T> {
  isSuccess: boolean;
  code: number;
  message: string;
}
