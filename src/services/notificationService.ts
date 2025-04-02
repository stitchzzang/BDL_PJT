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
      this.instance.close();
      this.instance = null;
    }
  }
}

// SSE 구독 설정 함수
export const subscribeToNotifications = () => {
  const { isLogin, userData } = useAuthStore.getState();
  const accessToken = localStorage.getItem('accessToken');

  if (!isLogin || !accessToken || !userData.memberId || NotificationEventSource.getInstance())
    return;

  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 999999;
  const INITIAL_RECONNECT_DELAY = 1000;
  const MAX_RECONNECT_DELAY = 30000;
  let currentReconnectDelay = INITIAL_RECONNECT_DELAY;

  const connect = () => {
    try {
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

      const connectionTimeout = setTimeout(() => {
        const state = getReadyState(newEventSource.readyState);
        if (newEventSource.readyState !== EventSource.OPEN) {
          newEventSource.close();
          reconnectSSE();
        }
      }, 10000);

      newEventSource.onopen = (event) => {
        clearTimeout(connectionTimeout);
        reconnectAttempts = 0;
        currentReconnectDelay = INITIAL_RECONNECT_DELAY;
      };

      const reconnectSSE = () => {
        NotificationEventSource.closeConnection();
        reconnectAttempts++;

        currentReconnectDelay = Math.min(currentReconnectDelay * 1.5, MAX_RECONNECT_DELAY);

        setTimeout(() => {
          if (!NotificationEventSource.getInstance()) {
            connect();
          }
        }, currentReconnectDelay);
      };

      // 주기적으로 연결 상태 체크
      const connectionCheck = setInterval(() => {
        const state = getReadyState(newEventSource.readyState);
        if (newEventSource.readyState === EventSource.CLOSED) {
          clearInterval(connectionCheck);
          reconnectSSE();
        }
      }, 5000);

      // @ts-expect-error EventSource type mismatch
      newEventSource.onerror = (ev: Event) => {
        const state = getReadyState(newEventSource.readyState);

        clearInterval(connectionCheck);

        if (newEventSource.readyState === EventSource.CLOSED) {
          reconnectSSE();
        }
      };

      // @ts-expect-error Custom event type
      newEventSource.addEventListener('AUTO_TRADING_SIGNAL', (event: MessageEvent) => {
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
      newEventSource.addEventListener('TRADING_SIGNAL', (event: MessageEvent) => {
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
    position: 'top-right',
    style: {
      background: backgroundColor,
      color: 'white',
      borderLeft: `4px solid ${textColor}`,
    },
  });
}

// SSE 연결 수동 해제 함수
export const unsubscribeFromNotifications = () => {
  NotificationEventSource.closeConnection();
};

// 페이지 로드 시 연결 상태 확인
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const { isLogin } = useAuthStore.getState();
    if (isLogin) {
      subscribeToNotifications();
    }
  });

  window.addEventListener('beforeunload', () => {
    unsubscribeFromNotifications();
  });
}
