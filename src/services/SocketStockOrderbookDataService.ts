import { Client } from '@stomp/stompjs';
import { useCallback, useRef, useState } from 'react';

// 커스텀 훅
export const useOrderbookConnection = () => {
  const stompClientRef = useRef<Client | null>(null);
  const [IsConnected, setIsConnected] = useState<boolean>(false);

};
