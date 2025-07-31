import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MechanicNotifications from './components/MechanicNotifications';
import NavBar from './NavBar';

function MechanicLoginDemo() {
  const navigate = useNavigate();
  const [mechanicId, setMechanicId] = useState(null);
  const [token, setToken] = useState(null);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  // const [riderLoggedIn, setRiderLoggedIn] = useState(false);
  const [mechanicLocation, setMechanicLocation] = useState(null);
  const [profileWarning, setProfileWarning] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5050/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      // Store all user info in localStorage for persistence
      localStorage.setItem('user', JSON.stringify({
        token: data.token,
        mechanicId: data.mechanicId,
        riderId: data.riderId,
        role: data.user.role,
        user: data.user
      }));
      if (data.user.role === 'mechanic') {
        setMechanicId(data.mechanicId);
        if (data.token) setToken(data.token);
        // Always redirect to dashboard after mechanic login
        navigate('/mechanic-dashboard', { replace: true });
      } else if (data.user.role === 'rider') {
        // setRiderLoggedIn(true);
      } else {
        throw new Error('Unknown user role');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user && user.token && user.role) {
          if (user.role === 'mechanic' && user.mechanicId) {
            setToken(user.token);
            setMechanicId(user.mechanicId);
            // If not already on /mechanic-dashboard, redirect
            if (window.location.pathname !== '/mechanic-dashboard') {
              navigate('/mechanic-dashboard', { replace: true });
            }
          } else if (user.role === 'rider' && user.riderId) {
            // setRiderLoggedIn(true);
            // Optionally, navigate('/rider-dashboard');
          } else {
            localStorage.removeItem('user');
            navigate('/login', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Failed to parse user from localStorage:', err);
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!mechanicId || !token) return;
      try {
        // Fetch mechanic profile to get location
        setProfileWarning('');
        const mechRes = await fetch(`http://localhost:5050/api/mechanics/${mechanicId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (mechRes.ok) {
          const mechData = await mechRes.json();
          if (mechData && mechData.location && Array.isArray(mechData.location.coordinates)) {
            setMechanicLocation(mechData.location.coordinates);
          }
        } else {
          setProfileWarning('Warning: Mechanic profile not found. Distance calculation may be unavailable.');
        }
        const res = await fetch('http://localhost:5050/api/requests/mechanic', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setRequests(data);
      } catch (err) {
        console.error('Failed to fetch requests:', err);
        setError('Failed to fetch requests');
      }
    };
    fetchRequests();
  }, [mechanicId, token]);

  const updateRequestStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5050/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        // Refetch requests after status update
        if (mechanicId && token) {
          const res = await fetch('http://localhost:5050/api/requests/mechanic', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok) setRequests(data);
        }
      }
    } catch (err) {
      console.error('Failed to update request status:', err);
      setError('Failed to update request status');
    }
  };

  // Helper to calculate distance between two lat/lng points in km
  function getDistanceKm([lng1, lat1], [lng2, lat2]) {
    function toRad(x) { return x * Math.PI / 180; }
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  if (mechanicId) {
    // Separate completed and non-completed requests
    const activeRequests = requests.filter(r => r.status !== 'completed');
    // Completed requests will be shown on a separate page/component
    return (
      <>
        <div>
          <h2>Mechanic Dashboard</h2>
          <MechanicNotifications mechanicId={mechanicId} />
          {profileWarning && <div style={{ color: 'orange', marginBottom: 8 }}>{profileWarning}</div>}
          <p>Welcome! You will receive real-time repair requests here.</p>
          <h3>Assigned Requests</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {activeRequests.length === 0 && <li>No requests yet.</li>}
            {activeRequests.map(req => {
              // ...existing code for displaying each request...
              const fallbackMechLoc = req.mechanic?.location?.coordinates;
              const riderLoc = req.location?.coordinates;
              let distanceDisplay = null;
              if (riderLoc && (mechanicLocation || fallbackMechLoc)) {
                const dist = getDistanceKm((mechanicLocation || fallbackMechLoc), riderLoc).toFixed(2);
                distanceDisplay = <div><strong>Distance to Rider:</strong> {dist} km</div>;
              } else if (riderLoc && !mechanicLocation && !fallbackMechLoc) {
                distanceDisplay = <div style={{ color: 'gray' }}><em>Distance unavailable (no mechanic location)</em></div>;
              }
              return (
                <li key={req._id} style={{ border: '1px solid #ccc', borderRadius: 8, marginBottom: 12, padding: 12 }}>
                  <div><strong>Status:</strong> {req.status}</div>
                  <div><strong>Description:</strong> {req.description || 'N/A'}</div>
                  <div><strong>Rider:</strong> {req.rider?.name || req.rider?.email || req.rider}</div>
                  {/* <div><strong>Location:</strong> {req.location?.coordinates?.join(', ')}</div> */}
                  <div><strong>Created:</strong> {new Date(req.createdAt).toLocaleString()}</div>
                  {distanceDisplay}
                  <div style={{ marginTop: 8 }}>
                    {/* Navigation button only if location exists and status is accepted */}
                    {riderLoc && req.status === 'accepted' && (
                      <button
                        style={{ marginRight: 8 }}
                        onClick={() => {
                          const [lng, lat] = riderLoc;
                          // Google Maps expects lat,lng order
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                          window.open(url, '_blank');
                        }}
                      >
                        Navigate
                      </button>
                    )}
                    {req.status === 'pending' && (
                      <>
                        <button onClick={() => updateRequestStatus(req._id, 'accepted')} style={{ marginRight: 8 }}>Accept</button>
                        <button onClick={() => updateRequestStatus(req._id, 'declined')} style={{ marginRight: 8 }}>Decline</button>
                      </>
                    )}
                    {req.status === 'accepted' && (
                      <button onClick={() => updateRequestStatus(req._id, 'completed')} style={{ marginRight: 8 }}>Mark Complete</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </>
    );
  }

  // Don't show rider dashboard if mechanic is logged in

  return (
    <form onSubmit={handleLogin} style={{ maxWidth: 320, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Mechanic Login</h2>
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ width: '100%', marginBottom: 12 }} />
      <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={{ width: '100%', marginBottom: 12 }} />
      <button type="submit" style={{ width: '100%' }}>Login</button>
      <button
        type="button"
        style={{ width: '100%', marginTop: 12, background: '#eee', color: '#333', border: '1px solid #ccc', borderRadius: 4, padding: '8px 0', cursor: 'pointer' }}
        onClick={() => navigate('/mechanic-register')}
      >
        Register as Mechanic
      </button>
      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
    </form>
  );
}

export default MechanicLoginDemo;
