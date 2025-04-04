import { CompanyMainInfo } from '@/api/types/stock';
import { addCommasToThousand, formatKoreanMoney } from '@/utils/numberFormatter';

interface StockInfoDetailListProps {
  companyMainInfo: CompanyMainInfo; // 타입 이름을 맞춰야 함
}

export const StockInfoDetailList = ({ companyMainInfo }: StockInfoDetailListProps) => {
  const divStyle =
    'flex justify-between rounded-2xl bg-[#102038] px-[14px] py-[14px] hover:bg-modal-background-color';
  return (
    <div className="flex flex-col gap-[10px]">
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">자본금:</span>
        <span className="text-[14px] font-light">
          {formatKoreanMoney(companyMainInfo.capital)} 원
        </span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">상장주수:</span>
        <span className="text-[14px] font-light">
          {formatKoreanMoney(companyMainInfo.listedSharesCnt)} 원
        </span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">액면가:</span>
        <span className="text-[14px] font-light">
          {formatKoreanMoney(companyMainInfo.parValue)} 원
        </span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">발행금액:</span>
        <span className="text-[14px] font-light">
          {formatKoreanMoney(companyMainInfo.issuePrice)} 원
        </span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">당일종가:</span>
        <span className="text-[14px] font-light">
          {formatKoreanMoney(companyMainInfo.closePrice)} 원
        </span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">전일종가:</span>
        <span className="text-[14px] font-light">
          {addCommasToThousand(companyMainInfo.previousClosePrice)} 원
        </span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">거래정지 여부:</span>
        <span className="text-[14px] font-light">
          {companyMainInfo.isTradingStop ? '예' : '아니오'}
        </span>
      </div>
      <div className={divStyle}>
        <span className="text-[14px] text-border-color">관리종목 여부:</span>
        <span className="text-[14px] font-light">
          {companyMainInfo.isAdministrationItem ? '예' : '아니오'}
        </span>
      </div>
    </div>
  );
};
