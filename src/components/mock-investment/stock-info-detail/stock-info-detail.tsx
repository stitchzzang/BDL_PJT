import { StockInfoDetailList } from '@/components/mock-investment/stock-info-detail/stock-info-detail-list';

export interface stockInfoDetail {
  capital: number;
  listedSharesCnt: number;
  listedCapitalAmount: number;
  parValue: number;
  issuePrice: number;
  closePrice: number;
  previousClosePrice: number;
  isTradingStop: boolean;
  isAdministrationItem: boolean;
}

// 더미데이터 1 - 대형주 예시
const stockInfoDetailTest: stockInfoDetail = {
  capital: 5000000000, // 자본금 50억원
  listedSharesCnt: 100000000, // 상장주식수 1억주
  listedCapitalAmount: 500000000000, // 상장시가총액 5000억원
  parValue: 500, // 액면가 500원
  issuePrice: 25000, // 발행가 25,000원
  closePrice: 52500, // 종가 52,500원
  previousClosePrice: 51800, // 전일종가 51,800원
  isTradingStop: false, // 거래정지 여부
  isAdministrationItem: false, // 관리종목 여부
};

export const StockInfoDetail = () => {
  return (
    <div className="h-full rounded-2xl bg-modal-background-color p-[20px]">
      <div>
        <h3 className="text-[14px] font-bold">종목 정보</h3>
      </div>
      <div className="mt-[20px]">
        <StockInfoDetailList data={stockInfoDetailTest} />
      </div>
    </div>
  );
};
