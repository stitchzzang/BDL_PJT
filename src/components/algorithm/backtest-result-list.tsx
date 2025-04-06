import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '@heroicons/react/24/solid';

import { DailyData } from '@/api/types/algorithm';
import { formatKoreanMoney } from '@/utils/numberFormatter';

interface BackTestResultListProps {
  dailyData: DailyData[] | null;
  setClickNumber: React.Dispatch<React.SetStateAction<number>>;
}

export const BackTestResultList = ({ dailyData, setClickNumber }: BackTestResultListProps) => {
  // 데이터가 없으면 빈 div 반환
  if (!dailyData || dailyData.length === 0) {
    return <div>현제 일일 데이터가 없습니다.</div>;
  }
  // 배열을 복사하고 순서를 뒤집어서 첫번째 요소가 마지막에 오도록 함
  const reversedData = [...dailyData].reverse();
  return (
    <div className=" rounded-xl bg-modal-background-color p-2">
      <div className="my-2">
        <h1 className="text-[14px] font-bold">거래 내역</h1>
      </div>
      <div
        className="rounded-x flex max-h-[440px] min-h-[440px] flex-col gap-1 overflow-y-auto text-[12px]"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#718096 #1a202c',
        }}
      >
        {reversedData.map((dailyDatacard, index) => {
          if (dailyDatacard.trade !== null) {
            return (
              <div
                key={`item-${dailyData.length - 1 - index}`}
                className="animate-fadeIn cursor-pointer rounded-lg bg-border-color bg-opacity-10 p-2 transition-colors duration-300 hover:bg-background-color hover:bg-opacity-100"
                onClick={() => setClickNumber(dailyDatacard.index)}
              >
                <div className="flex justify-between gap-2">
                  {dailyDatacard.trade.type === 'BUY' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4">
                          <ChevronDoubleRightIcon />
                        </div>
                        <p className="font-bold text-btn-red-color">구매</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4">
                          <ChevronDoubleLeftIcon />
                        </div>
                        <p className="font-bold text-btn-blue-color">판매</p>
                        <div className="flex gap-2 rounded-md border border-border-color border-opacity-40 p-1 px-2">
                          <p className="text-border-color">
                            거래가격:
                            <span className="text-white">
                              {' '}
                              {formatKoreanMoney(dailyDatacard.trade.price)}원
                            </span>
                          </p>
                          <p className="text-border-color">
                            거래개수:
                            <span className="text-white"> {dailyDatacard.trade.quantity}개</span>
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  <p className="opacity-30">{dailyDatacard.date}</p>
                </div>
                <div className="m-1 flex items-center justify-between rounded-md border border-border-color border-opacity-20 p-2">
                  <p className="text-border-color">
                    총 자산:{' '}
                    <span
                      className={`${dailyDatacard.portfolioValue > 10000000 ? 'text-btn-red-color' : 'text-btn-blue-color'} text-[15px]`}
                    >
                      {formatKoreanMoney(dailyDatacard.portfolioValue)}원
                    </span>
                  </p>
                  <div className="text-border-color">
                    <p>
                      현금:{' '}
                      <span className="text-btn-green-color">
                        {formatKoreanMoney(dailyDatacard.cash)}원
                      </span>
                    </p>
                    <p>
                      주식:{' '}
                      <span className="text-white">
                        {formatKoreanMoney(dailyDatacard.equity)}원
                      </span>
                    </p>
                  </div>
                </div>
                <div className="m-1 flex items-center gap-3 rounded-md border border-border-color border-opacity-20 p-2">
                  <p className="text-border-color">
                    일간 수익:{' '}
                    <span
                      className={`${dailyDatacard.dailyReturn < 0 ? 'text-btn-blue-color' : 'text-btn-red-color'}`}
                    >
                      {dailyDatacard.dailyReturn}%
                    </span>
                  </p>
                  <p className="text-border-color">
                    누적 수익:{' '}
                    <span
                      className={`${dailyDatacard.cumulativeReturn < 0 ? 'text-btn-blue-color' : 'text-btn-red-color'}`}
                    >
                      {dailyDatacard.cumulativeReturn}%
                    </span>
                  </p>
                </div>
                <div className="m-1 flex items-center gap-2 rounded-md border border-border-color border-opacity-20 p-2">
                  <p className="text-border-color">응답:</p>
                  <p>{dailyDatacard.trade.reason}</p>
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};
