import { EventSourcePolyfill } from 'event-source-polyfill';
import { toast } from 'react-hot-toast';

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
      console.log('SSE 연결 시도...', {
        memberId: userData.memberId,
        hasToken: !!accessToken,
        url: `/api/notification/subscribe/${userData.memberId}`,
      });

      const newEventSource = new EventSourcePolyfill(
        `/api/notification/subscribe/${userData.memberId}`,
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
        console.log(`SSE 연결 타임아웃 (상태: ${state})`);
        if (newEventSource.readyState !== EventSource.OPEN) {
          newEventSource.close();
          reconnectSSE();
        }
      }, 10000);

      newEventSource.onopen = (event) => {
        console.log('SSE 연결 성공', event);
        clearTimeout(connectionTimeout);
        reconnectAttempts = 0;
        currentReconnectDelay = INITIAL_RECONNECT_DELAY;
      };

      const reconnectSSE = () => {
        console.log(`SSE 재연결 시도 (시도 횟수: ${reconnectAttempts + 1})`);
        NotificationEventSource.closeConnection();
        reconnectAttempts++;

        currentReconnectDelay = Math.min(currentReconnectDelay * 1.5, MAX_RECONNECT_DELAY);
        console.log(`${currentReconnectDelay}ms 후 재연결 시도`);

        setTimeout(() => {
          if (!NotificationEventSource.getInstance()) {
            connect();
          }
        }, currentReconnectDelay);
      };

      // 주기적으로 연결 상태 체크
      const connectionCheck = setInterval(() => {
        const state = getReadyState(newEventSource.readyState);
        console.log('SSE 상태:', state);

        if (newEventSource.readyState === EventSource.CLOSED) {
          console.log('SSE 연결 끊김 감지');
          clearInterval(connectionCheck);
          reconnectSSE();
        }
      }, 5000);

      // @ts-expect-error EventSource type mismatch
      newEventSource.onerror = (ev: Event) => {
        const state = getReadyState(newEventSource.readyState);
        console.error('SSE 연결 오류:', {
          error: ev,
          state,
          readyState: newEventSource.readyState,
        });

        clearInterval(connectionCheck);

        if (newEventSource.readyState === EventSource.CLOSED) {
          console.log('오류로 인한 재연결 시도');
          reconnectSSE();
        }
      };

      // @ts-expect-error Custom event type
      newEventSource.addEventListener('AUTOTRADESIGNAL', (event: MessageEvent) => {
        console.log('자동매매 신호 수신:', event.data);
        try {
          const rawData = JSON.parse(event.data);
          if (isTradeSignal(rawData)) {
            const signal = rawData as TradeSignal;
            showTradeNotification(signal, true);
          }
        } catch (error) {
          console.error('자동매매 신호 처리 중 오류 발생:', error);
          toast.error('자동매매 신호를 처리하는 중 오류가 발생했습니다.');
        }
      });

      // @ts-expect-error Custom event type
      newEventSource.addEventListener('TRADESIGNAL', (event: MessageEvent) => {
        console.log('매매 신호 수신:', event.data);
        try {
          const rawData = JSON.parse(event.data);
          if (isTradeSignal(rawData)) {
            const signal = rawData as TradeSignal;
            showTradeNotification(signal, false);
          }
        } catch (error) {
          console.error('매매 신호 처리 중 오류 발생:', error);
          toast.error('매매 신호를 처리하는 중 오류가 발생했습니다.');
        }
      });

      NotificationEventSource.setInstance(newEventSource);
    } catch (error) {
      console.error('SSE 초기 연결 실패:', error);
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
  toast.dismiss();

  const { signalType, companyName, price, quantity } = data;
  const prefix = isAuto ? '[자동매매]' : '[매매]';
  const toastMessage = `${prefix} ${signalType === 'BUY' ? '매수' : '매도'} 신호: ${companyName}\n가격: ${price.toLocaleString()}원 / 수량: ${quantity}주`;

  if (isAuto) {
    if (signalType === 'BUY') {
      toast.success(toastMessage, {
        duration: 5000,
        position: 'top-right',
        style: { background: '#4CAF50', color: 'white' },
      });
    } else {
      toast.error(toastMessage, {
        duration: 5000,
        position: 'top-right',
        style: { background: '#f44336', color: 'white' },
      });
    }
  } else {
    toast(toastMessage, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: signalType === 'BUY' ? '#2196F3' : '#FF9800',
        color: 'white',
      },
    });
  }
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
