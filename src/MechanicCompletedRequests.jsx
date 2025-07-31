import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';

export default function MechanicCompletedRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let token = null;
    let mechanicId = null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.token;
        mechanicId = user.mechanicId;
      } catch {
        //
      }
    }
    if (!token || !mechanicId) {
      setError('Not authenticated.');
      setLoading(false);
      return;
    }
    fetch('https://bike-repair-app-backend.onrender.com/api/requests/mechanic', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRequests(Array.isArray(data) ? data.filter(r => r.status === 'completed') : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch completed requests.');
        setLoading(false);
      });
  }, []);

  return (
    <>
      <NavBar />
      <div style={{ maxWidth: 700, margin: '120px auto 40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
        <h2>Completed Requests</h2>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {requests.length === 0 && !loading && <li>No completed requests.</li>}
          {requests.map(req => (
            <li key={req._id} style={{ border: '1px solid #ccc', borderRadius: 8, marginBottom: 12, padding: 12 }}>
              <div><strong>Status:</strong> {req.status}</div>
              <div><strong>Description:</strong> {req.description || 'N/A'}</div>
              <div><strong>Rider:</strong> {req.rider?.name || req.rider?.email || req.rider}</div>
              <div><strong>Created:</strong> {new Date(req.createdAt).toLocaleString()}</div>
              <div><strong>Completed:</strong> {req.updatedAt ? new Date(req.updatedAt).toLocaleString() : 'N/A'}</div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
