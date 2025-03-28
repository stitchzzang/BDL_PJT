/**
 *
 * @param price 입력된 가격 (원)
 * @param tickSize 호가 단윈 -> getTickSize에서 계산된 값이 넣어질 예정
 * @param roundingMethod  반올림 양식 (기본값은 round)
 * @returns 호가 단위에 맞게 반환된 값
 */

export const getAdjustToTickSize = (
  price: number,
  tickSize: number,
  roundingMethod: 'round' | 'floor' | 'ceil' = 'round',
): number => {
  if (price < 0) {
    throw new Error('가격은 0 이상이어야 합니다.');
  }

  if (tickSize < 0) {
    throw new Error('호가 단위는 양수여야 합니다.');
  }

  // 호가 단위로 나눈 후 지정된 반올림 방식에 따라 계산
  switch (roundingMethod) {
    case 'floor':
      return Math.floor(price / tickSize) * tickSize;
    case 'ceil':
      return Math.ceil(price / tickSize) * tickSize;
    case 'round':
    default:
      return Math.round(price / tickSize) * tickSize;
  }
};

// 사용 예시
/*
const inputPrice = 214600;
const tickSize = 500;

const adjustedPrice = adjustToTickSize(inputPrice, tickSize, 'floor');
console.log(`입력된 가격: ${inputPrice}원, 조정된 가격: ${adjustedPrice}원`);
// 출력: 입력된 가격: 214600원, 조정된 가격: 214500원

// 다른 반올림 방식 사용
const roundedUp = adjustToTickSize(214600, 500, 'ceil'); // 215000
const rounded = adjustToTickSize(214600, 500, 'round'); // 214500 (500의 중간점인 250을 기준으로 반올림)
*/
