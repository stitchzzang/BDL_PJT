import { TickData } from '@/api/types/stock';
import { addCommasToThousand } from '@/utils/numberFormatter';

// 인터페이스 정의
interface TickInfoProps {
  tickData: TickData | null;
}

export const TickInfo = ({ tickData }: TickInfoProps) => {
  return (
    <div className="flex items-center gap-4">
      <div>
        {tickData === null ? (
          <div></div>
        ) : (
          <div
            className={`duration-400 flex gap-3 rounded-2xl border-2 bg-opacity-40 p-3 px-6 transition-all ${tickData.ccldDvsn === '1' ? 'border-btn-red-color bg-btn-red-color bg-opacity-10 text-btn-red-color' : 'border-btn-blue-color bg-btn-blue-color  bg-opacity-10 text-btn-blue-color'}`}
          >
            <h1>{addCommasToThousand(tickData.stckPrpr)}</h1>
            <h1 className="text-white opacity-60">{tickData.cntgVol}</h1>
          </div>
        )}
        {tickData === null ? (
          <div className="rounded-2xl border-2 border-border-color p-3 px-6 opacity-40">
            <p className="text-border-color">장시간 : 09:00 - 15:30</p>
          </div>
        ) : (
          <ul></ul>
        )}
      </div>
      {tickData === null ? (
        <p className="opacity-20">현재 거래</p>
      ) : (
        <p className="opacity-60">현재 거래</p>
      )}
    </div>
  );
};
