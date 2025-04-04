import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { getAdjustToTickSize } from '@/utils/getAdjustToTickSize';

interface InputProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  placeholder?: string;
  className?: string;
  tickSize: number; // 호가 단위
  roundingMethod?: 'round' | 'floor' | 'ceil'; // 반올림 방식
  closePrice: number; // 기준점 종가
}

export const NumberPriceInput: React.FC<InputProps> = ({
  value,
  setValue,
  placeholder = '가격을 입력하세요',
  className,
  tickSize,
  roundingMethod = 'ceil',
  closePrice,
}) => {
  // 입력 중인 값을 따로 관리
  const [inputValue, setInputValue] = useState<string>(value === 0 ? '' : value.toString());
  // 경고 메시지 상태
  const [warningMessage, setWarningMessage] = useState<string>('');

  // 최대 입력 가능 금액 (9999억원)
  const MAX_AMOUNT = 999900000000;

  // 가격 범위 계산 (고정 30%)
  const minPrice = Math.floor(closePrice * 0.7); // 하한가 (30% 아래)
  const maxPrice = Math.ceil(closePrice * 1.3); // 상한가 (30% 위)

  // 호가 단위에 맞게 조정된 최소/최대 가격
  const adjustedMinPrice = getAdjustToTickSize(minPrice, tickSize, 'ceil');
  const adjustedMaxPrice = getAdjustToTickSize(maxPrice, tickSize, 'floor');

  // 가격 유효성 검사 및 경고 메시지 생성
  const validateAndAdjustPrice = (price: number): [number, string] => {
    if (price === 0) return [0, ''];

    // 9999억원 초과인 경우
    if (price > MAX_AMOUNT) {
      return [
        MAX_AMOUNT,
        `최대 입력 가능 금액을 초과하여 ${MAX_AMOUNT.toLocaleString()}원으로 조정되었습니다.`,
      ];
    }

    // 최소값보다 작은 경우
    if (price < adjustedMinPrice) {
      return [
        adjustedMinPrice,
        `입력한 가격이 최소 가격보다 낮아 ${adjustedMinPrice.toLocaleString()}원으로 조정되었습니다.`,
      ];
    }

    // 최대값보다 큰 경우
    if (price > adjustedMaxPrice) {
      return [
        adjustedMaxPrice,
        `입력한 가격이 최대 가격보다 높아 ${adjustedMaxPrice.toLocaleString()}원으로 조정되었습니다.`,
      ];
    }

    // 범위 내인 경우
    return [price, ''];
  };

  // closePrice가 변경되면 입력값도 자동으로 조정
  useEffect(() => {
    if (value > 0) {
      const [adjustedPrice, message] = validateAndAdjustPrice(value);
      if (adjustedPrice !== value) {
        setValue(adjustedPrice);
        setInputValue(adjustedPrice.toString());
        setWarningMessage(message);
      }
    }
  }, [closePrice]);
  return (
    <div className="w-full">
      <Input
        className={`${className} rounded-xl px-[20px] py-[15px] ${warningMessage ? 'border-red-500' : ''}`}
        type="text"
        placeholder={placeholder ?? '가격을 입력하세요'}
        value={inputValue} // 입력 중인 값 표시
        onChange={(e) => {
          const value = e.target.value;
          // 숫자만 허용하는 정규식
          if (/^\d*$/.test(value)) {
            // 입력 값이 9999억원 이하인 경우에만 입력 허용
            const numValue = value === '' ? 0 : parseInt(value, 10);
            if (numValue <= MAX_AMOUNT) {
              setInputValue(value); // 입력 중에는 그대로 표시
              // 입력 중에는 경고 메시지 숨기기
              setWarningMessage('');
            } else {
              // 최대 금액을 초과하면 최대 금액으로 설정
              setInputValue(MAX_AMOUNT.toString());
              setWarningMessage(
                `최대 입력 가능 금액은 9999억원(${MAX_AMOUNT.toLocaleString()}원)입니다.`,
              );
            }
          }
        }}
        onBlur={() => {
          // 포커스를 잃을 때(입력 완료 시) 호가 단위에 맞게 조정
          const numValue = inputValue === '' ? 0 : parseInt(inputValue, 10);
          const adjustedValue = getAdjustToTickSize(numValue, tickSize, roundingMethod);

          // 범위 검사 및 자동 조정
          const [finalValue, message] = validateAndAdjustPrice(adjustedValue);

          setValue(finalValue); // 상태 업데이트
          setInputValue(finalValue === 0 ? '' : finalValue.toString()); // 입력창도 업데이트
          setWarningMessage(message); // 경고 메시지 설정
        }}
      />
      {warningMessage && <p className="mt-1 text-sm text-orange-500">{warningMessage}</p>}
    </div>
  );
};
