import TestImage from '@/assets/test/stock-test.png';
import { Button } from '@/components/ui/button';

export const StockInfo = () => {
  return (
    <div>
      <div>
        <div>
          {/* 이미지 */}
          <img src={TestImage} alt="stock-icon" />
        </div>
        <div>
          <div>{/* 제목 */}</div>
          <div>{/* 하단 정보 */}</div>
        </div>
      </div>
      <div>
        <Button>알고리즘 선택</Button>
      </div>
    </div>
  );
};
