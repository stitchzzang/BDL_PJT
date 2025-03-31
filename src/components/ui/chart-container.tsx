import React, { useEffect, useState } from 'react';

import { MinuteChart } from '@/components/ui/chart-simulate'; // 기존 분봉 차트
import { TickChart } from '@/components/ui/tick-chart';
// import { TickChart } from '@/components/ui/TickChart'; // 새로 만든 틱 차트

// 틱 데이터 인터페이스 (기존 코드에서 가져옴)
interface TickData {
  stockCode: string;
  stckCntgHour: string;
  stckPrpr: number;
  stckOprc: number;
  stckHgpr: number;
  stckLwpr: number;
  cntgVol: number;
  acmlVol: number;
  acmlTrPbm: number;
  ccldDvsn: string;
}

// 분봉 데이터 인터페이스 (기존 코드에서 가져옴)
interface StockMinuteData {
  stockCandleMinuteId: number;
  companyId: string;
  openPrice: number;
  openPricePercent: number;
  highPrice: number;
  highPricePercent: number;
  lowPrice: number;
  lowPricePercent: number;
  closePrice: number;
  closePricePercent: number;
  contractingVolume: number;
  accumulatedTradeAmount: number;
  tradingTime: string;
  fiveAverage: number;
  twentyAverage: number;
}

interface StockMinuteDefaultData {
  companyId: string;
  limit: number;
  cursor: string;
  data: StockMinuteData[];
}

// 메인 컴포넌트
const StockChartContainer: React.FC = () => {
  // 상태 관리
  const [minuteData, setMinuteData] = useState<StockMinuteDefaultData | null>(null);
  const [tickData, setTickData] = useState<TickData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 분봉 데이터 로드 (컴포넌트 마운트 시 1회 실행)
  useEffect(() => {
    const fetchMinuteData = async () => {
      setLoading(true);
      try {
        // 분봉 데이터 API 호출 (실제 구현에 맞게 수정 필요)
        const response = await fetch('/api/stocks/1/minute?limit=100');
        const result = await response.json();

        if (result.isSuccess) {
          setMinuteData(result.result);
        } else {
          setError(result.message || '데이터 로드 실패');
        }
      } catch (err) {
        setError('데이터 로드 중 오류 발생');
        console.error('분봉 데이터 로드 오류:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMinuteData();
  }, []);

  // 웹소켓 연결 및 틱 데이터 구독 (실제 구현에 맞게 수정 필요)
  useEffect(() => {
    // 웹소켓 연결 및 이벤트 핸들러 설정
    const connectWebSocket = () => {
      // 실제 구현에서는 아래 부분을 실제 웹소켓 연결로 대체
      console.log('웹소켓 연결 시작...');

      // 실제 구현 대신 데모용 타이머 설정 (매 초마다 임의의 틱 데이터 생성)
      const mockTickInterval = setInterval(() => {
        // 이전 틱 데이터 기반으로 약간 변동된 새 틱 데이터 생성
        const prevPrice = tickData?.stckPrpr || 50000;
        const randomChange = Math.floor(Math.random() * 100) - 50; // -50 ~ +50 사이 랜덤 변화
        const newPrice = Math.max(1, prevPrice + randomChange);

        // 현재 시간을 HHmmss 형식으로 변환
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeStr = `${hours}${minutes}${seconds}`;

        // 새 틱 데이터 생성
        const newTickData: TickData = {
          stockCode: '005930',
          stckCntgHour: timeStr,
          stckPrpr: newPrice,
          stckOprc: tickData?.stckOprc || 50000,
          stckHgpr: Math.max(tickData?.stckHgpr || 0, newPrice),
          stckLwpr: Math.min(tickData?.stckLwpr || 100000, newPrice),
          cntgVol: 10 + Math.floor(Math.random() * 100),
          acmlVol: (tickData?.acmlVol || 0) + 10 + Math.floor(Math.random() * 100),
          acmlTrPbm: (tickData?.acmlTrPbm || 0) + newPrice * 10,
          ccldDvsn: newPrice > prevPrice ? '1' : newPrice < prevPrice ? '5' : '3',
        };

        setTickData(newTickData);
      }, 1000); // 1초마다 업데이트

      // 클린업 함수
      return () => {
        clearInterval(mockTickInterval);
        console.log('웹소켓 연결 종료');
      };
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, [tickData]);

  // 추가 데이터 로드 함수 (페이지네이션)
  const handleLoadMoreData = async (cursor: string) => {
    try {
      // 추가 데이터 API 호출 (실제 구현에 맞게 수정 필요)
      const response = await fetch(`/api/stocks/1/minute?cursor=${cursor}&limit=50`);
      const result = await response.json();

      if (result.isSuccess) {
        return result.result;
      }

      return null;
    } catch (err) {
      console.error('추가 데이터 로드 오류:', err);
      return null;
    }
  };

  // 차트 레이아웃 구성 (분봉 차트 + 틱 차트)
  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xl font-bold">주식 차트</h2>

      {/* 분봉 차트 영역 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-md">
        {loading ? (
          <div className="flex h-[400px] items-center justify-center">
            <p>데이터 로딩 중...</p>
          </div>
        ) : error ? (
          <div className="flex h-[400px] items-center justify-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <MinuteChart
            companyId="1"
            height={400}
            initialLimit={100}
            initialData={minuteData || undefined}
            onLoadMoreData={handleLoadMoreData}
            // TickData 속성은 전달하지 않음 (별도 컴포넌트로 분리)
          />
        )}
      </div>

      {/* 틱 차트 영역 */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-md">
        <TickChart
          tickData={tickData}
          height={200}
          basePrice={minuteData?.data[0]?.openPrice} // 기준가 (첫번째 데이터의 시가)
        />
      </div>

      {/* 현재 틱 정보 표시 (옵션) */}
      {tickData && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-md">
          <h3 className="mb-2 text-lg font-semibold">현재 시세 정보</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">현재가</p>
              <p className="text-lg font-bold">
                {new Intl.NumberFormat('ko-KR').format(tickData.stckPrpr)}원
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">시가</p>
              <p className="text-lg font-medium">
                {new Intl.NumberFormat('ko-KR').format(tickData.stckOprc)}원
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">고가</p>
              <p className="text-lg font-medium">
                {new Intl.NumberFormat('ko-KR').format(tickData.stckHgpr)}원
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">저가</p>
              <p className="text-lg font-medium">
                {new Intl.NumberFormat('ko-KR').format(tickData.stckLwpr)}원
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockChartContainer;
