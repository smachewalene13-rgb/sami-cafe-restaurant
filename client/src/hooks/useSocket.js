import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
    });
  }
  return socketInstance;
};

export const useSocket = (event, callback) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const socket = getSocket();

    const handler = (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    if (event) {
      socket.on(event, handler);
    }

    return () => {
      if (event) {
        socket.off(event, handler);
      }
    };
  }, [event]);

  return getSocket();
};

export default useSocket;
