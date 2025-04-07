import { EventSourcePolyfill } from 'event-source-polyfill';
import { toast } from 'react-toastify';

import { useAuthStore } from '@/store/useAuthStore';

interface TradeSignal {
  signalType: 'BUY' | 'SELL';
  companyId: number;
  companyName: string;
  price: number;
  quantity: number;
}

// SSE 연결 관리를 위한 클래스
class NotificationEventSource {
  static instance: EventSourcePolyfill | null = null;

  static getInstance() {
    return this.instance;
  }

  static setInstance(newInstance: EventSourcePolyfill) {
    this.instance = newInstance;
  }

  static closeConnection() {
    if (this.instance) {
      console.log('SSE 연결 종료');
      this.instance.close();
      this.instance = null;
    }
  }

  static isConnected() {
    return !!this.instance && this.instance.readyState === EventSource.OPEN;
  }
}

// SSE 구독 설정 함수
export const subscribeToNotifications = () => {
  const { isLogin, userData } = useAuthStore.getState();
  const accessToken = localStorage.getItem('accessToken');

  // 이미 연결이 있거나, 로그인 상태가 아니거나, 토큰이 없거나, memberId가 없으면 구독하지 않음
  if (!isLogin || !accessToken || !userData.memberId) {
    console.log('SSE 연결 불가: 로그인 상태 또는 토큰 없음');
    return;
  }

  // 이미 연결된 경우 새로운 연결을 시도하지 않음
  if (NotificationEventSource.getInstance()) {
    console.log('SSE 이미 연결됨');
    return;
  }

  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 999999;
  const INITIAL_RECONNECT_DELAY = 1000;
  const MAX_RECONNECT_DELAY = 30000;
  let currentReconnectDelay = INITIAL_RECONNECT_DELAY;

  const connect = () => {
    try {
      // 최신 userData 가져오기
      const { userData } = useAuthStore.getState();
      const accessToken = localStorage.getItem('accessToken');

      // 현재 로그인한 사용자 ID 체크
      if (!userData.memberId) {
        console.log('SSE 연결 실패: memberId가 없음');
        return;
      }

      console.log(`SSE 연결 시도: 사용자 ID ${userData.memberId}`);
      const newEventSource = new EventSourcePolyfill(
        `/api/notification/subscribe/${userData.memberId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          withCredentials: true,
          heartbeatTimeout: 60000,
        },
      );

      // 연결 상태 문자열로 변환
      const getReadyState = (state: number) => {
        switch (state) {
          case EventSource.CONNECTING:
            return 'CONNECTING (0)';
          case EventSource.OPEN:
            return 'OPEN (1)';
          case EventSource.CLOSED:
            return 'CLOSED (2)';
          default:
            return `UNKNOWN (${state})`;
        }
      };

      const connectionTimeout = setTimeout(
        () => {
          const state = getReadyState(newEventSource.readyState);
          if (newEventSource.readyState !== EventSource.OPEN) {
            newEventSource.close();
            reconnectSSE();
          }
        },
        60 * 60 * 1000,
      );

      newEventSource.onopen = (event) => {
        console.log('SSE 연결 성공');
        clearTimeout(connectionTimeout);
        reconnectAttempts = 0;
        currentReconnectDelay = INITIAL_RECONNECT_DELAY;
      };

      const reconnectSSE = () => {
        NotificationEventSource.closeConnection();

        // 로그인 상태가 아니면 재연결하지 않음
        const authState = useAuthStore.getState();
        if (!authState.isLogin) {
          console.log('SSE 재연결 중단: 로그인 상태 아님');
          return;
        }

        reconnectAttempts++;
        console.log(`SSE 재연결 시도 ${reconnectAttempts}`);

        currentReconnectDelay = Math.min(currentReconnectDelay * 1.5, MAX_RECONNECT_DELAY);

        setTimeout(() => {
          if (!NotificationEventSource.getInstance() && useAuthStore.getState().isLogin) {
            connect();
          }
        }, currentReconnectDelay);
      };

      // 주기적으로 연결 상태 체크
      const connectionCheck = setInterval(() => {
        const state = getReadyState(newEventSource.readyState);

        // 로그인 상태가 아니면 연결 종료
        if (!useAuthStore.getState().isLogin) {
          console.log('SSE 연결 체크: 로그인 상태 아님, 연결 종료');
          clearInterval(connectionCheck);
          NotificationEventSource.closeConnection();
          return;
        }

        if (newEventSource.readyState === EventSource.CLOSED) {
          console.log('SSE 연결 체크: 연결 종료됨, 재연결 시도');
          clearInterval(connectionCheck);
          reconnectSSE();
        }
      }, 15000);

      // @ts-expect-error EventSource type mismatch
      newEventSource.onerror = (ev: Event) => {
        const state = getReadyState(newEventSource.readyState);
        console.log(`SSE 오류 발생: ${state}`);

        clearInterval(connectionCheck);

        if (newEventSource.readyState === EventSource.CLOSED) {
          reconnectSSE();
        }
      };

      // @ts-expect-error Custom event type
      newEventSource.addEventListener('AUTO_TRADESIGNAL', (event: MessageEvent) => {
        try {
          const rawData = JSON.parse(event.data);
          if (isTradeSignal(rawData)) {
            const signal = rawData as TradeSignal;
            showTradeNotification(signal, true);
          }
        } catch (error) {
          toast.error('자동매매 신호를 처리하는 중 오류가 발생했습니다.');
        }
      });

      // @ts-expect-error Custom event type
      newEventSource.addEventListener('TRADESIGNAL', (event: MessageEvent) => {
        try {
          const rawData = JSON.parse(event.data);
          if (isTradeSignal(rawData)) {
            const signal = rawData as TradeSignal;
            showTradeNotification(signal, false);
          }
        } catch (error) {
          toast.error('매매 신호를 처리하는 중 오류가 발생했습니다.');
        }
      });

      NotificationEventSource.setInstance(newEventSource);
    } catch (error) {
      console.error('SSE 연결 오류:', error);
      setTimeout(connect, currentReconnectDelay);
    }
  };

  connect();
};

// 타입 가드 함수
function isTradeSignal(data: unknown): data is TradeSignal {
  if (!data || typeof data !== 'object') return false;

  const signal = data as Partial<TradeSignal>;
  return (
    typeof signal.signalType === 'string' &&
    (signal.signalType === 'BUY' || signal.signalType === 'SELL') &&
    typeof signal.companyId === 'number' &&
    typeof signal.companyName === 'string' &&
    typeof signal.price === 'number' &&
    typeof signal.quantity === 'number'
  );
}

// 거래 알림 표시 함수
function showTradeNotification(data: TradeSignal, isAuto: boolean) {
  const { signalType, companyName, price, quantity } = data;
  const prefix = isAuto ? '[자동매매]' : '[수동매매]';
  const toastMessage = `${prefix} ${signalType === 'BUY' ? '💰구매' : '💸판매'} ${companyName}\n가격: ${price.toLocaleString()}원 / 수량: ${quantity}주`;

  const backgroundColor = isAuto ? '#00AC4F' : '#FFB800'; // 자동매매는 초록색, 일반매매는 노란색
  const textColor = signalType === 'BUY' ? '#076BFD' : '#F23636'; // 매수는 파란색, 매도는 빨간색

  toast(toastMessage, {
    style: {
      background: backgroundColor,
      color: 'white',
      borderLeft: `4px solid ${textColor}`,
    },
  });
}

// SSE 연결 수동 해제 함수
export const unsubscribeFromNotifications = () => {
  console.log('SSE 연결 수동 해제 요청');
  NotificationEventSource.closeConnection();
};

// 페이지 언로드 시 연결 해제
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    unsubscribeFromNotifications();
  });
}
