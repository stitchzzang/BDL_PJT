/**
 * 종목 시가에 따른 호가 단위 계산 함수 (개선안)
 * @param price 주식 가격(종목 시가)
 * @returns 해당 종목 시가의 호가 단위
 */
export const getTickSize = (price: number): number => {
  if (price < 0) {
    throw new Error('가격은 0 이상이어야 합니다.');
  }

  if (price < 2000) {
    return 1; // 2,000원 미만: 1원
  } else if (price < 5000) {
    return 5; // 2,000원 ~ 5,000원 미만: 5원
  } else if (price < 20000) {
    return 10; // 5,000원 ~ 20,000원 미만: 10원
  } else if (price < 50000) {
    return 50; // 20,000원 ~ 50,000원 미만: 50원
  } else if (price < 200000) {
    return 100; // 50,000원 ~ 200,000원 미만: 100원
  } else if (price < 500000) {
    return 500; // 200,000원 ~ 500,000원 미만: 500원
  } else {
    return 1000; // 500,000원 이상: 1,000원
  }
};

// 사용 예시
// const stockPrice = 35000;
// const tickSize = getTickSize(stockPrice);
// console.log(`${stockPrice}원의 호가 단위는 ${tickSize}원입니다.`);
