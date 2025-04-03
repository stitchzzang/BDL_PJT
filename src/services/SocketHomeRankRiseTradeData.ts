import { Client, Frame } from '@stomp/stompjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';

import { HomeCompanyRankTradeData } from '@/api/types/home';

// 커스텀 훅
export const useRankRiseTradeDataConnection = (category: string) => {
  const stompClientRef = useRef<Client | null>(null);
  const [IsConnected, setIsConnected] = useState<boolean>(false);

  // 연결함수
  const connectionRankRiseTradeData = useCallback(
    (setRank: (data: HomeCompanyRankTradeData) => void) => {
      //기존 연결일 경우 해제
      disconnectRankRiseTradeData();

      //인스턴스 생성
      //https://j12d202.p.ssafy.io/ws
      //http://192.168.100.198:8080/ws
      const socket = new SockJS('https://j12d202.p.ssafy.io/ws');

      // STOMP 클라이언트 생성
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          // console.log(str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      stompClientRef.current = client;

      // 연결 성공 콜백
      client.onConnect = (frame: Frame) => {
        setIsConnected(true);
        // console.log('소켓 연결', frame);

        // 주제 구독
        client.subscribe(`/topic/ranking/changeRate/${category}/tradeData`, (message) => {
          try {
            // 메시지 처리 - 호가 데이터가 들어옴
            const receivedData = JSON.parse(message.body);
            setRank(receivedData);
          } catch (error) {
            console.error('에러 발생', error);
          }
        });
      };

      // 에러 콜백
      client.onStompError = (frame: Frame) => {
        console.error('STOMP 에러 발생 =', frame.headers, frame.body);
        setIsConnected(false);
      };

      // 연결 종료 콜백
      client.onWebSocketClose = () => {
        console.log('웹 소켓 연결 종료');
        setIsConnected(false);
      };

      // 연결 시작
      client.activate();
    },
    [],
  );

  // 연결 해제 함수
  const disconnectRankRiseTradeData = useCallback(() => {
    // console.log('소켓 연결 해제(disconnect)');
    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate();
        setIsConnected(false);
      } catch (error) {
        console.error('해제중 에러 발생', error);
      }
    } else {
      // console.log('연결 해제를 위한 스톰프 클라이언트가 없습니다.');
    }
  }, []);
  // 컴포넌트 언마운트 시 자동 연결 해제
  useEffect(() => {
    return () => {
      disconnectRankRiseTradeData();
    };
  }, [disconnectRankRiseTradeData]);

  return {
    IsConnected,
    connectionRankRiseTradeData,
    disconnectRankRiseTradeData,
  };
};
