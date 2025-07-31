import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RiderRequestsHistory() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // You may need to get the token from context, localStorage, or props
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5050/api/requests/mine', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch requests');
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [token]);

  if (loading) return <div style={{ padding: 32 }}>Loading your requests...</div>;
  if (error) return <div style={{ color: 'red', padding: 32 }}>{error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: '32px auto', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
      <h2>My Request History</h2>
      {requests.length === 0 ? (
        <div>No requests found.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {requests.map(req => {
            const isPending = req.status === 'pending';
            const liStyle = {
              border: '1px solid #ccc',
              borderRadius: 8,
              marginBottom: 12,
              padding: 12,
              cursor: isPending ? 'pointer' : 'default',
              transition: 'background 0.2s',
            };
            return (
              <li
                key={req._id}
                style={liStyle}
                onClick={() => {
                  if (isPending) navigate(`/rider/request/${req._id}`);
                }}
                title={isPending ? 'Click to track this request' : ''}
              >
                <div><strong>Status:</strong> {req.status}</div>
                <div><strong>Mechanic:</strong> {req.mechanic ? req.mechanic.shopName : 'Not assigned yet'}</div>
                <div><strong>Description:</strong> {req.description}</div>
                <div><strong>Created:</strong> {new Date(req.createdAt).toLocaleString()}</div>
                {isPending && (
                  <div style={{ color: '#007bff', fontSize: 13, marginTop: 4 }}>
                    Click to track this request
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default RiderRequestsHistory;
