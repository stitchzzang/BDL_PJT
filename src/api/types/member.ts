export interface MemberInfo {
  profileImage?: string; // 프로필 이미지
  nickname?: string; // 닉네임
  deleteProfile?: boolean; // 프로필 삭제 여부
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

export interface AccountResponse {
  companyId: number; // 종목 ID
  companyImage: string; // 종목 이미지
  companyName: string; // 종목명
  profitRate: number; // 해당 종목의 수익률 (%)
  profit: number; // 해당 종목의 수익금 (원)
  avgPrice: number; // 1주당 평균 매수가 (원)
  currentPrice: number; //  현재 주가 (원)
  stockCnt: number; // 보유 주식 수량
  evaluation: number; // 해당 종목의 평가금액 (주식 수량 × 현재가)
  investment: number; // 해당 종목의 투자 원금 (주식 수량 × 평균 매수가)
  dailyProfitRate: number; // 해당 종목의 일간 수익률 (%)
  dailyProfit: number; // 해당 종목의 일간 수익금 (원)
}

export interface AccountSummaryResponse {
  totalAsset: number; // 총자산 (현금 + 주식 평가금액)
  totalEvaluation: number; // 보유 주식의 총 평가금액
  totalCash: number; // 총 보유 현금 (주문가능금액 + 미체결 주문금액)
  orderableAmount: number; // 주문 가능 금액 (실제로 사용 가능한 현금)
  totalProfitRate: number; // 전체 수익률 (%)
  totalProfit: number; // 전체 수익금 (원)
  dailyProfitRate: number; // 일간 수익률 (%)
  dailyProfit: number; // 일간 수익금 (원)
  accountCount: number; // 보유 종목 수
  accounts: AccountResponse[]; // 각 종목별 계좌 정보 목록
}
