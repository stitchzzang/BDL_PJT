export interface MemberInfo {
  profileImage: string; // 프로필 이미지
  nickname: string; // 닉네임
}

export interface MemberPassword {
  question: string; // 질문
  answer: string; // 답변
  newPassword: string; // 새비밀번호
}

export interface MemberTutorialResults {
  tutorials: {
    companyName: string; // 회사명
    startMoney: number; // 시작 금액
    endMoney: number; // 종료 금액
    changeRate: number; // 변화율
    startDate: string; // 시작일
    endDate: string; // 종료일
  }[];
}

export interface MemberInvestedStock {
  companyId: number; // 회사 ID
  companyImage: string; // 회사 이미지
  companyName: string; // 회사명
  quantity: number; // 수량
  principal: number; // 원금
}
