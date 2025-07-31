import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// Usage: useSocketNotifications(mechanicId, onNewRequest)
export function useSocketNotifications(mechanicId, onNewRequest) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!mechanicId) return;
    // Connect to backend Socket.IO server
    const socket = io('http://localhost:5050'); // Update if backend runs elsewhere
    socketRef.current = socket;

    // Join mechanic room
    socket.emit('join', mechanicId);

    // Listen for new request notifications
    socket.on('new_request', (data) => {
      if (onNewRequest) onNewRequest(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [mechanicId, onNewRequest]);

  return socketRef;
}
