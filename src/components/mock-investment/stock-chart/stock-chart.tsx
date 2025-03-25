import { Client, Frame, Message } from '@stomp/stompjs';
import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';

// 그래프 데이터
export interface DataPoint {
  stckCntgHour: string; // 이전의 date
  stckOprc: number; // 이전의 open
  stckHgpr: number; // 이전의 highw
  stckLwpr: number; // 이전의 low
  stckPrpr: number; // 이전의 close
  prevClose?: number; // 그대로 유지
  change?: number; // 그대로 유지
  changeType?: 'RISE' | 'FALL' | 'NONE'; // 그대로 유지
  cntgVol: number; // 이전의 volume
  acmlVol?: number; // 이전의 accVolume
  amount?: number; // 그대로 유지
  acmlTrPbm?: number; // 이전의 accAmount
  periodType?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'MINUTE'; // 그대로 유지
  ema5?: number; // 그대로 유지
  ema20?: number; // 그대로 유지
  stockName?: string; // 그대로 유지
  stockCode: string; // 선택적에서 필수로 변경됨
  ccldDvsn: string; // 새로 추가 (TradeData에는 있지만 DataPoint에는 없음)
}

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

export const StockChart = () => {
  const [tradeData, setTradeData] = useState<TradeData[]>([]);
  const [message, setMessage] = useState<TradeData | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const stompClient = useRef<Client | null>(null);

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
    const socket = new SockJS('http://192.168.100.198:8080/ws');

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
    <div>
      <h2>종목코드 000660 거래 데이터</h2>
      <div>
        <p>연결 상태: {connected ? '연결됨' : '연결 안됨'}</p>
        {!connected && <button onClick={handleReconnect}>재연결</button>}
      </div>

      <div>
        <h3>최근 거래 내역</h3>
        <h1>{message === null ? <span>none</span> : <span>{message.stckCntgHour}</span>} </h1>
        {tradeData.length === 0 ? (
          <p>데이터를 기다리는 중...</p>
        ) : (
          <ul>
            {tradeData.map((data, index) => (
              <li key={index}>
                종목코드: {data.stockCode}, 현재가: {data.stckPrpr.toLocaleString()}원, 시간:{' '}
                {data.stckCntgHour}, 거래량: {data.cntgVol.toLocaleString()}, 체결구분:{' '}
                {data.ccldDvsn === '1' ? '매수' : data.ccldDvsn === '5' ? '매도' : data.ccldDvsn}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
