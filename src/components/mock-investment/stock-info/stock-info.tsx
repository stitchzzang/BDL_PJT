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
          <div>
            <h3>한화오션</h3>
            <p>27210</p>
          </div>
          <div>
            <h3>166,223 원</h3>
            <div>
              <div>
                <p>어제보다</p>
                <p>+1,323원(23%)</p>
              </div>
              <div>
                <p>반도체체</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Button>알고리즘 선택</Button>
      </div>
    </div>
  );
};
