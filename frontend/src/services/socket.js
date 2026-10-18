import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const socketUrl = base.replace(/\/api\/?$/, '');
    socket = io(socketUrl, { autoConnect: true, transports: ['websocket', 'polling'] });
  }
  return socket;
};

export default getSocket;
