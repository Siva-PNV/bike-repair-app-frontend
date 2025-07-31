import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MapLocationSelector from './MapLocationSelector';
import NavBar from './NavBar';

// This component expects a requestId prop and a token prop
function RiderRequestStatus({ requestId, token }) {
  const params = useParams();
  const reqId = requestId || params.requestId;
  const [request, setRequest] = useState(null);
  const [mechanicLocation, setMechanicLocation] = useState(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Poll request status and mechanic location every 5 seconds
  useEffect(() => {
    if (!reqId) return;
    // Validate reqId as a MongoDB ObjectId (24 hex chars)
    const objectIdPattern = /^[a-f\d]{24}$/i;
    if (!objectIdPattern.test(reqId)) {
      setError('Invalid request ID format.');
      setLoading(false);
      return;
    }
    let interval;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`https://bike-repair-app-backend.onrender.com/api/requests/${reqId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        });
        const data = await res.json();
        if (res.status === 404) {
          setError('Request not found. It may have been deleted or never existed.');
          setRequest(null);
          return;
        }
        if (!res.ok) throw new Error(data.message || 'Failed to fetch request');
        setRequest(data);
        setStatus(data.status);
        if (data.mechanic && data.mechanic.location) {
          setMechanicLocation({
            lat: data.mechanic.location.coordinates[1],
            lng: data.mechanic.location.coordinates[0],
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [reqId, token]);

  if (loading) return <div style={{ padding: 32 }}><NavBar />Loading request status...</div>;
  if (error) return <div style={{ color: 'red', padding: 32 }}><NavBar />{error}</div>;
  if (!request) return <div style={{ padding: 32 }}><NavBar />No request found.</div>;

  return (
    <div style={{ maxWidth: 600, margin: '32px auto', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
      {/* <NavBar /> */}
      <h2>Repair Request Status</h2>
      <div style={{ marginBottom: 16 }} />
      <div><strong>Status:</strong> {status}</div>
      <div><strong>Mechanic:</strong> {request.mechanic ? request.mechanic.shopName : 'Not assigned yet'}</div>
      <div><strong>Description:</strong> {request.description}</div>
      <div style={{ margin: '24px 0' }}>
        {mechanicLocation ? (
          <MapLocationSelector
            lat={mechanicLocation.lat}
            lng={mechanicLocation.lng}
            setLat={() => {}}
            setLng={() => {}}
            mechanicMarkers={[request.mechanic]}
            route={null}
          />
        ) : (
          <div>Waiting for mechanic location...</div>
        )}
      </div>
      <div style={{ color: '#888', fontSize: 14 }}>
        This page updates automatically. You will see the mechanic's live location and status here.
      </div>
    </div>
  );
}

export default RiderRequestStatus;
