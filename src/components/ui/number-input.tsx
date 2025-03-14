import { Input } from '@/components/ui/input';

interface InputProps {
  value: number;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  placeholder: string;
}

export const NumberInput: React.FC<InputProps> = ({ value, setValue, placeholder }) => {
  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={value === 0 ? '' : value.toString()} // 상태값을 string으로 변환해서 value에 전달
      onChange={(e) => {
        const value = e.target.value;
        // 숫자만 허용하는 정규식
        if (/^\d*$/.test(value)) {
          const numValue = value === '' ? 0 : parseInt(value, 10); // 빈 값은 0으로 처리
          setValue(numValue); // number 타입으로 상태를 업데이트
        }
      }}
    />
  );
};
