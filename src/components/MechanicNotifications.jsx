import React, { useState, useCallback } from 'react';
import { useSocketNotifications } from '../hooks/useSocketNotifications';

export default function MechanicNotifications({ mechanicId }) {
  const [notifications, setNotifications] = useState([]);

  // Handler for new incoming requests
  const handleNewRequest = useCallback((data) => {
    setNotifications((prev) => [
      {
        id: data.requestId,
        description: data.description,
        location: data.location,
        rider: data.rider,
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  }, []);

  useSocketNotifications(mechanicId, handleNewRequest);

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000 }}>
      {notifications.map((notif) => (
        <div key={notif.id} style={{ background: '#fff', border: '1px solid #333', borderRadius: 8, padding: 12, marginBottom: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <strong>New Repair Request!</strong>
          <div>Description: {notif.description || 'No details'}</div>
          <div>Location: {notif.location.join(', ')}</div>
          <div>Time: {notif.time}</div>
        </div>
      ))}
    </div>
  );
}
