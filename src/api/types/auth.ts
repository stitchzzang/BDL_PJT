export interface LoginResponse {
  nickname: string;
  profile: string;
}

export interface SignupRequest {
  email: string;
  nickname: string;
  password: string;
  question: number;
  answer: string;
}
