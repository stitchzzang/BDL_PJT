import { TutorialResultResponse } from '@/api/types/tutorial';
import {
  addCommasToThousand,
  addStockValueColorClass,
  plusMinusSign,
  roundToTwoDecimalPlaces,
} from '@/utils/numberFormatter';

interface StockTutorialResultItemProps {
  result: TutorialResultResponse;
}

export const StockTutorialResultItem = ({ result }: StockTutorialResultItemProps) => {
  return (
    <div className="flex w-full flex-row items-center justify-between gap-2 rounded-[10px] bg-modal-background-color p-3 hover:bg-modal-background-color/50">
      <div className="flex flex-row items-center gap-4">
        <img
          src={result.companyImage}
          alt="company-identifier"
          className="h-[50px] w-[50px] rounded-xl"
        />
        <div className="flex flex-col gap-1">
          <p className="text-base">{result.companyName}</p>
          <div className="flex flex-row gap-2 text-sm text-text-inactive-2-color">
            {new Date(result.startDate).toLocaleDateString()} ~{' '}
            {new Date(result.endDate).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center gap-4 text-base">
        <div className="flex flex-row items-center gap-1">
          <span className="text-border-color">시작 금액</span>
          <p className="text-text-main-color">{addCommasToThousand(result.startMoney)}</p>
          <span className="text-border-color">원</span>
        </div>
        <div className="flex flex-row items-center gap-1">
          <span className="text-border-color">최종 금액</span>
          <p className="text-text-main-color">{addCommasToThousand(result.endMoney)}</p>
          <span className="text-border-color">원</span>
        </div>
        <div className="flex flex-row items-center gap-1">
          <span className="text-border-color">최종 수익률</span>
          <p
            className={`rounded-lg border px-2 py-1 ${addStockValueColorClass(
              ((result.endMoney - result.startMoney) / result.startMoney) * 100,
            )}`}
          >
            {`${plusMinusSign(
              ((result.endMoney - result.startMoney) / result.startMoney) * 100,
            )} ${roundToTwoDecimalPlaces(
              ((result.endMoney - result.startMoney) / result.startMoney) * 100,
            )}%`}
          </p>
        </div>
      </div>
    </div>
  );
};
