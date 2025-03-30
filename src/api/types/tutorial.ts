export interface TutorialResultResponse {
  tutorialResult: TutorialResult[];
}

export interface TutorialResult {
  tutorialResultId: number; // 튜토리얼 결과 ID
  companyId: number; // 기업 ID
  companyName: string; // 기업명
  startMoney: number; // 시작 금액
  endMoney: number; // 최종 금액
  startDate: string; // 시작날짜
  endDate: string; // 종료날짜
  memberId: number; // 회원 ID
  memberName: string; // 회원 이름
}
