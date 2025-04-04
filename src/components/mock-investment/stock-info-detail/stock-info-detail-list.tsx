import { stockInfoDetail } from '@/components/mock-investment/stock-info-detail/stock-info-detail';
import { addCommasToThousand, formatKoreanMoney } from '@/utils/numberFormatter';

interface StockInfoDetailListProps {
  data: stockInfoDetail; // 타입 이름을 맞춰야 함
}

export const StockInfoDetailList = ({ data }: StockInfoDetailListProps) => {
  const divStyle =
    'flex justify-between rounded-2xl bg-[#102038] px-[14px] py-[10px] hover:bg-modal-background-color';
  return (
    <div className="flex flex-col gap-[10px]">
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">자본금:</span>
        <span className="text-[14px] font-light">{formatKoreanMoney(data.capital)} 원</span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">상장주식수:</span>
        <span className="text-[14px] font-light">{formatKoreanMoney(data.listedSharesCnt)} 원</span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">상장시가총액:</span>
        <span className="text-[14px] font-light">
          {formatKoreanMoney(data.listedCapitalAmount)} 원
        </span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">액면가:</span>
        <span className="text-[14px] font-light">{formatKoreanMoney(data.parValue)} 원</span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">발행가:</span>
        <span className="text-[14px] font-light">{formatKoreanMoney(data.issuePrice)} 원</span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">종가:</span>
        <span className="text-[14px] font-light">{formatKoreanMoney(data.closePrice)} 원</span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">전일종가:</span>
        <span className="text-[14px] font-light">
          {addCommasToThousand(data.previousClosePrice)} 원
        </span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">거래정지 여부:</span>
        <span className="text-[14px] font-light">{data.isTradingStop ? '예' : '아니오'}</span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">관리종목 여부:</span>
        <span className="text-[14px] font-light">
          {data.isAdministrationItem ? '예' : '아니오'}
        </span>
      </div>
    </div>
  );
};
