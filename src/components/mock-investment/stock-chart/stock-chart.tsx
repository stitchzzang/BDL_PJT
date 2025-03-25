import { TickData } from '@/api/types/stock';

// 인터페이스 정의
interface TickInfoProps {
  TickData: TickData;
}

export const TickInfo = ({ TickData }: TickInfoProps) => {
  return (
    <div className="flex items-center gap-4">
      <div>
        {TickData === null ? (
          <p>none</p>
        ) : (
          <div
            className={`flex gap-3 rounded-2xl border-2 bg-opacity-40 p-3 px-6 transition-all duration-200 ${TickData.ccldDvsn === '1' ? 'border-btn-red-color text-btn-red-color' : 'border-btn-blue-color text-btn-blue-color'}`}
          >
            <h1>{TickData.stckPrpr}</h1>
            <h1 className="text-white opacity-60">{TickData.cntgVol}</h1>
          </div>
        )}
        {TickData === null ? <p>데이터를 기다리는 중...</p> : <ul></ul>}
      </div>
      <p className="opacity-60">현재 거래</p>
    </div>
  );
};
