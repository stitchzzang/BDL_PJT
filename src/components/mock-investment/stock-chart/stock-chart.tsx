import { Client, Frame, Message } from '@stomp/stompjs';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';

import { _ky } from '@/api/instance';
import { ApiResponse } from '@/api/types/common';

// 메시지 데이터 구조에 대한 타입 정의
interface TradeData {
  /** 종목 코드 (예: "005930") */
  stockCode: string;

  /** 주식 체결 시간 (문자열, HHmmss 형식 등) */
  stckCntgHour: string;

  /** 주식 현재가 (체결 가격) */
  stckPrpr: number;

  /** 주식 시가 */
  stckOprc: number;

  /** 주식 최고가 */
  stckHgpr: number;

  /** 주식 최저가 */
  stckLwpr: number;

  /** 체결 거래량 */
  cntgVol: number;

  /** 누적 거래량 */
  acmlVol: number;

  /** 누적 거래 대금 */
  acmlTrPbm: number;

  /** 체결구분 (예: "1" - 매수, "3" - 장전, "5" - 매도) */
  ccldDvsn: string;
}

//api 테스트
interface StockCandleData {
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

const stockChartApi = {
  getStockChart: () =>
    _ky.get('stocks/000660/minute/initial?limit=50').json<ApiResponse<StockCandleData[]>>(),
};

const useStockChart = () => {
  return useQuery({
    queryKey: ['StockChart'],
    queryFn: () => stockChartApi.getStockChart().then((res) => res.result),
  });
};

export const StockChart = () => {
  const [tradeData, setTradeData] = useState<TradeData[]>([]);
  const [message, setMessage] = useState<TradeData | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const stompClient = useRef<Client | null>(null);

  const { data: StockChart } = useStockChart();
  console.log(StockChart);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 WebSocket 연결 설정
    connectWebSocket();

    // 컴포넌트가 언마운트될 때 WebSocket 연결 해제
    return () => {
      disconnectWebSocket();
    };
  }, []);

  const connectWebSocket = () => {
    // SockJS 인스턴스 생성
    const socket = new SockJS('https://j12d202.p.ssafy.io/ws');

    // STOMP 클라이언트 생성
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000, // 연결 끊어졌을 때 5초 후 재연결 시도
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 연결 성공 콜백
    client.onConnect = (frame: Frame) => {
      setConnected(true);
      console.log('Connected to WebSocket:', frame);

      // 주제 구독
      client.subscribe('/topic/tradeData/000660', (message: Message) => {
        try {
          // 메시지 처리
          const receivedData = JSON.parse(message.body);
          console.log('Received data:', receivedData);

          // 상태 업데이트 (새 데이터를 배열 시작에 추가)
          setTradeData((prevData) => [receivedData, ...prevData.slice(0, 99)]);
          setMessage(receivedData);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });
    };

    // 에러 콜백
    client.onStompError = (frame: Frame) => {
      console.error('STOMP error:', frame.headers, frame.body);
      setConnected(false);
    };

    // 연결 종료 콜백
    client.onWebSocketClose = () => {
      console.log('WebSocket connection closed');
      setConnected(false);
    };

    // 연결 시작
    client.activate();

    // ref에 저장
    stompClient.current = client;
  };

  const disconnectWebSocket = () => {
    console.log('Attempting to disconnect WebSocket');

    if (stompClient.current) {
      try {
        // connected 상태와 관계없이 연결 종료 시도
        stompClient.current.deactivate();
        console.log('Disconnect command sent');
        setConnected(false);
      } catch (error) {
        console.error('Error during disconnect:', error);
      }
    } else {
      console.log('No STOMP client to disconnect');
    }
  };

  // 수동 재연결 함수
  const handleReconnect = () => {
    disconnectWebSocket();
    setTimeout(connectWebSocket, 1000);
  };

  return (
    <div className="border">
      <div>
        <h1>{message === null ? <span>none</span> : <span>{message.ccldDvsn}</span>} </h1>
        {tradeData.length === 0 ? <p>데이터를 기다리는 중...</p> : <ul>{tradeData[0].stckPrpr}</ul>}
      </div>
    </div>
  );
};
