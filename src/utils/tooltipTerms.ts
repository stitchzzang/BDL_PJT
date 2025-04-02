// 금융 및 주식 관련 용어 정의 객체
export interface TermDefinition {
  term: string;
  definition: string;
  category?: string;
}

export const financialTerms: Record<string, TermDefinition> = {
  // 홈페이지 관련 용어
  코스닥: {
    term: '코스닥',
    definition: '기술력과 성장성이 높은 중소형 기업들이 상장된 한국의 주식시장',
    category: '홈페이지',
  },
  코스피: {
    term: '코스피',
    definition:
      '한국의 대표 대기업들이 주로 상장된 주식시장.\n\n코스피 지수는 한국 주식시장의 전반적인 추세를 보여주는 지표입니다.',
    category: '홈페이지',
  },
  등락률: {
    term: '등락률',
    definition: '주식 가격이 전일 대비 상승하거나 하락한 비율',
    category: '홈페이지',
  },
  현재가: {
    term: '현재가',
    definition: '주식이 실시간으로 거래되는 가격',
    category: '홈페이지',
  },
  거래대금: {
    term: '거래대금',
    definition: '일정 기간 동안 거래된 주식의 총 금액',
    category: '홈페이지',
  },

  // 알고리즘 LAB 관련 용어
  이익률: {
    term: '이익률',
    definition: '투자한 금액 대비 얻은 이익의 비율',
    category: '알고리즘 LAB',
  },
  손절매: {
    term: '손절매',
    definition: '주식 가격이 일정 수준 이하로 떨어질 때 손실을 막기 위해 매도하는 행위',
    category: '알고리즘 LAB',
  },
  진입: {
    term: '진입',
    definition: '주식 매매를 시작하기 위해 시장에 참여하는 시점',
    category: '알고리즘 LAB',
  },
  청산: {
    term: '청산',
    definition: '보유한 주식을 모두 매도하여 포지션을 정리하는 행위',
    category: '알고리즘 LAB',
  },
  '수수료 포함': {
    term: '수수료 포함',
    definition: '(0.00004%)거래 시 발생하는 비용까지 고려한 금액',
    category: '알고리즘 LAB',
  },
  분봉: {
    term: '분봉',
    definition: '주식 가격의 변동을 분 단위로 기록한 차트',
    category: '알고리즘 LAB',
  },
  일봉: {
    term: '일봉',
    definition: '하루 동안의 주식 가격 변동을 기록한 차트',
    category: '알고리즘 LAB',
  },
  이동평균선: {
    term: '이동평균선',
    definition:
      '일정 기간 동안의 주가를 평균 내어 부드러운 선으로 보여주어, 주가의 전체적인 흐름을 쉽게 파악할 수 있도록 도와주는 도구',
    category: '알고리즘 LAB',
  },
  단기선: {
    term: '단기선',
    definition:
      '최근 며칠 간의 주가 평균을 계산해, 빠른 변동을 반영하는 단기적인 주가 흐름을 쉽게 확인할 수 있게 해주는 도구',
    category: '알고리즘 LAB',
  },
  장기선: {
    term: '장기선',
    definition:
      '장기간의 주가 평균을 계산해, 전체적인 주가 추세와 안정성을 파악할 수 있도록 도와주는 도구',
    category: '알고리즘 LAB',
  },
  '반응 강도': {
    term: '반응 강도',
    definition: '주식 가격이 특정 시간 내에 설정한 퍼센트(%) 이상 변동 할 때',
    category: '알고리즘 LAB',
  },
  '이동평균선 사용': {
    term: '이동평균선 사용',
    definition:
      '여러 날의 주가를 평균 내어 그린 선이에요. \n 그래서 주가가 매일 조금씩 오르락내리락해도,\n이 선을 보면 주가가 대체로 오르고 있는지, 내리고 있는지를 한눈에 알 수 있어요.',
    category: '알고리즘 LAB',
  },

  // 주식 튜토리얼 관련 용어
  '기업 코드': {
    term: '기업 코드',
    definition: '각 기업을 고유하게 식별하기 위해 부여된 번호나 문자',
    category: '주식 튜토리얼',
  },
  변곡점: {
    term: '변곡점',
    definition: '주식 가격이 상승세에서 하락세로 또는 그 반대로 전환되는 시점',
    category: '주식 튜토리얼',
  },
  시드머니: {
    term: '시드머니',
    definition: '투자를 시작할 때 사용하는 초기 자금',
    category: '주식 튜토리얼',
  },
  '주문 가능': {
    term: '주문 가능',
    definition: '현재 주식을 구매하거나 판매할 수 있는 상태',
    category: '주식 튜토리얼',
  },
  '현재 자산': {
    term: '현재 자산',
    definition: '보유 중인 주식과 기타 자산의 총 가치',
    category: '주식 튜토리얼',
  },
  지정가: {
    term: '지정가',
    definition: '투자자가 원하는 특정 가격에 주식을 주문하는 방식',
    category: '주식 튜토리얼',
  },

  // 모의 주식 관련 용어
  종가: {
    term: '종가',
    definition: '주식시장이 마감할 때의 마지막 거래 가격',
    category: '모의 주식',
  },
  시가: {
    term: '시가',
    definition: '주식시장이 개장할 때 처음 거래된 가격',
    category: '모의 주식',
  },
  고가: {
    term: '고가',
    definition: '하루 동안 거래된 주식 중 가장 높은 가격',
    category: '모의 주식',
  },
  저가: {
    term: '저가',
    definition: '하루 동안 거래된 주식 중 가장 낮은 가격',
    category: '모의 주식',
  },
  거래량: {
    term: '거래량',
    definition: '특정 기간 동안 실제로 거래된 주식의 수',
    category: '모의 주식',
  },
  자본금: {
    term: '자본금',
    definition: '기업이 사업 시작 시 투자받은 총 자금',
    category: '모의 주식',
  },
  상장주식수: {
    term: '상장주식수',
    definition: '시장에 공개된 해당 기업의 총 주식 수',
    category: '모의 주식',
  },
  상장시가총액: {
    term: '상장시가총액',
    definition: '상장된 주식의 총 수와 현재가를 곱해 산출한 기업의 시장 가치',
    category: '모의 주식',
  },
  액면가: {
    term: '액면가',
    definition: '주식 한 주에 명시된 기본 가격',
    category: '모의 주식',
  },
  발행가: {
    term: '발행가',
    definition: '기업이 주식을 처음 공개할 때 정한 가격',
    category: '모의 주식',
  },
  전일종가: {
    term: '전일종가',
    definition: '전날 마감 시의 주식 마지막 거래 가격',
    category: '모의 주식',
  },
  '거래정지 여부': {
    term: '거래정지 여부',
    definition: '해당 주식의 거래가 일시적으로 중단되었는지 여부',
    category: '모의 주식',
  },
  '관리종목 여부': {
    term: '관리종목 여부',
    definition: '투자자 보호를 위해 특별 관리되는 주식인지 여부',
    category: '모의 주식',
  },
  틱: {
    term: '틱',
    definition: '주식 가격이 최소로 변동할 수 있는 단위',
    category: '모의 주식',
  },

  // 마이페이지 관련 용어
  평가금: {
    term: '평가금',
    definition: '현재 보유한 주식의 시세를 반영한 총 가치',
    category: '마이페이지',
  },
  원금: {
    term: '원금',
    definition: '처음 투자한 금액',
    category: '마이페이지',
  },
  '1주 평균 금액': {
    term: '1주 평균 금액',
    definition: '구매금액 / 보유수량',
    category: '마이페이지',
  },
  구매금액: {
    term: '구매금액',
    definition: '1주 평균 금액 * 보유수량',
    category: '마이페이지',
  },
  보유수량: {
    term: '보유수량',
    definition: '보유한 주식의 총 수',
    category: '마이페이지',
  },
};

// 특정 용어 정의 찾기 함수
export const getTermDefinition = (term: string): TermDefinition | undefined => {
  return financialTerms[term];
};

// 모든 용어 목록 가져오기
export const getAllTermsList = (): string[] => {
  return Object.keys(financialTerms);
};

// 카테고리별 용어 정의 가져오기 함수
export const getTermsByCategory = (category: string): TermDefinition[] => {
  return Object.values(financialTerms).filter((term) => term.category === category);
};

// 용어 목록 가져오기
export const getAllTerms = (): TermDefinition[] => {
  return Object.values(financialTerms);
};
