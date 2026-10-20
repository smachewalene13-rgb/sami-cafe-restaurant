import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return 'https://sami-cafe-restaurant-1.onrender.com';
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
