import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const PROD_SOCKET_URL = 'https://sami-cafe-restaurant-1.onrender.com';

const getSocketUrl = () => {
  // If running in browser and NOT running on localhost / 127.0.0.1
  // ALWAYS route socket connections to the live production Render backend
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    const envUrl = import.meta.env.VITE_SOCKET_URL;
    if (envUrl && envUrl.startsWith('https://') && !envUrl.includes('localhost')) {
      return envUrl;
    }
    return PROD_SOCKET_URL;
  }

  // Local development
  const envUrl = import.meta.env.VITE_SOCKET_URL;
  if (envUrl && !envUrl.includes('10000') && !envUrl.includes('undefined')) {
    return envUrl;
  }
  return 'http://localhost:5000';
};

const SOCKET_URL = getSocketUrl();

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
