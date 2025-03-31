export interface LoginResponse {
  memberId: number;
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
