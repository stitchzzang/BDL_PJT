import { Input } from '@/components/ui/input';
import { formatKoreanMoney } from '@/utils/numberFormatter';

interface InputProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  placeholder: string;
  className?: string;
  formatAsCurrency?: boolean;
  disabled?: boolean;
}

export const NumberInput: React.FC<InputProps> = ({
  value,
  setValue,
  placeholder,
  className,
  formatAsCurrency = false,
  disabled = false,
}) => {
  // 최대 입력 가능 금액 (9999억원)
  const MAX_AMOUNT = 999999999999;

  const displayValue = () => {
    if (value === 0) return '';
    return formatAsCurrency ? formatKoreanMoney(value) : value.toString();
  };

  return (
    <Input
      className={`${className} rounded-xl px-[20px] py-[15px]`}
      type="text"
      placeholder={placeholder}
      value={displayValue()}
      disabled={disabled}
      onChange={(e) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/[^\d]/g, '');

        if (numericValue === '') {
          setValue(0);
        } else {
          // 숫자로 변환
          const parsedValue = parseInt(numericValue, 10);

          // 최대값(9999억) 제한 적용
          const limitedValue = Math.min(parsedValue, MAX_AMOUNT);

          setValue(limitedValue);
        }
      }}
    />
  );
};
