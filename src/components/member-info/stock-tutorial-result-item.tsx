import { TutorialResultResponse } from '@/api/types/tutorial';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  addCommasToThousand,
  addStockValueColorClass,
  plusMinusSign,
  roundToTwoDecimalPlaces,
} from '@/utils/numberFormatter';

interface StockTutorialResultItemProps {
  result: TutorialResultResponse;
  isHighlighted?: boolean;
}

export const StockTutorialResultItem = ({
  result,
  isHighlighted = false,
}: StockTutorialResultItemProps) => {
  return (
    <div
      className={`flex w-full flex-row items-center justify-between gap-2 rounded-[10px] bg-modal-background-color p-3 transition-all duration-300 hover:bg-modal-background-color/50 ${isHighlighted ? 'animate-pulse border-2 border-blue-500 bg-blue-900/20' : ''}`}
    >
      <div className="flex flex-row items-center gap-4">
        <img
          src={result.companyImage}
          alt="company-identifier"
          className="h-[50px] w-[50px] rounded-xl"
        />
        <div className="flex flex-col gap-1">
          <p className="text-base">{result.companyName}</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex cursor-help flex-row text-sm text-text-inactive-2-color underline">
                  {new Date(result.endDate).toLocaleDateString()}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>진행일로부터 과거 1년 간의 데이터로 튜토리얼이 진행됩니다.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex flex-row items-center gap-4 text-base">
        <div className="flex flex-row items-center gap-1">
          <span className="text-border-color">최종 금액</span>
          <p className="text-text-main-color">{addCommasToThousand(result.endMoney)}</p>
          <span className="text-border-color">원</span>
        </div>
        <div className="flex flex-row items-center gap-1">
          <span className="text-border-color">최종 수익률</span>
          <p
            className={`min-w-[80px] rounded-lg border px-2 py-1 text-center ${addStockValueColorClass(
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
