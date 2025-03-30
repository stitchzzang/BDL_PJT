export interface MemberInfo {
  profileImage: string; // 프로필 이미지
  nickname: string; // 닉네임
}

export interface MemberPassword {
  question: string; // 질문
  answer: string; // 답변
  newPassword: string; // 새비밀번호
}
export interface MemberInvestedStock {
  companyId: number; // 회사 ID
  companyImage: string; // 회사 이미지
  companyName: string; // 회사명
  quantity: number; // 수량
  principal: number; // 원금
}
