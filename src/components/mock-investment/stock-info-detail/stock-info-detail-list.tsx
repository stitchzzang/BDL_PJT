import { stockInfoDetail } from '@/components/mock-investment/stock-info-detail/stock-info-detail';

interface StockInfoDetailListProps {
  data: stockInfoDetail; // 타입 이름을 맞춰야 함
}

export const StockInfoDetailList = ({ data }: StockInfoDetailListProps) => {
  return (
    <div>
      <div>자본금: {data.capital.toLocaleString()} 원</div>
      <div>상장주식수: {data.listedSharesCnt.toLocaleString()} 주</div>
      <div>상장시가총액: {data.listedCapitalAmount.toLocaleString()} 원</div>
      <div>액면가: {data.parValue.toLocaleString()} 원</div>
      <div>발행가: {data.issuePrice.toLocaleString()} 원</div>
      <div>종가: {data.closePrice.toLocaleString()} 원</div>
      <div>전일종가: {data.previousClosePrice.toLocaleString()} 원</div>
      <div>거래정지 여부: {data.isTradingStop ? '예' : '아니오'}</div>
      <div>관리종목 여부: {data.isAdministrationItem ? '예' : '아니오'}</div>
    </div>
  );
};
