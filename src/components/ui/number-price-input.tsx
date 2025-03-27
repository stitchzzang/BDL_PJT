import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { getAdjustToTickSize } from '@/utils/getAdjustToTickSize';

interface InputProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  placeholder: string;
  className?: string;
  tickSize: number; // 호가 단위
  roundingMethod?: 'round' | 'floor' | 'ceil'; // 반올림 방식
}

export const NumberPriceInput: React.FC<InputProps> = ({
  value,
  setValue,
  placeholder,
  className,
  tickSize,
  roundingMethod = 'ceil',
}) => {
  // 입력 중인 값을 따로 관리
  const [inputValue, setInputValue] = useState<string>(value === 0 ? '' : value.toString());
  return (
    <Input
      className={`${className} rounded-xl px-[20px] py-[15px]`}
      type="text"
      placeholder={placeholder}
      value={inputValue} // 입력 중인 값 표시
      onChange={(e) => {
        const value = e.target.value;
        // 숫자만 허용하는 정규식
        if (/^\d*$/.test(value)) {
          setInputValue(value); // 입력 중에는 그대로 표시
        }
      }}
      onBlur={() => {
        // 포커스를 잃을 때(입력 완료 시) 호가 단위에 맞게 조정
        const numValue = inputValue === '' ? 0 : parseInt(inputValue, 10);
        const adjustedValue = getAdjustToTickSize(numValue, tickSize, roundingMethod);
        setValue(adjustedValue); // 상태 업데이트
        setInputValue(adjustedValue === 0 ? '' : adjustedValue.toString()); // 입력창도 업데이트
      }}
    />
  );
};
