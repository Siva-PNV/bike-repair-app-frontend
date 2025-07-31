import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapLocationSelector from './MapLocationSelector';
import polyline from '@mapbox/polyline';

function MechanicSearchAndRequest({ token }) {
  const navigate = useNavigate();
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [mechanics, setMechanics] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selected, setSelected] = useState(null);
  const [description, setDescription] = useState('');
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setMechanics([]);
    setLoading(true);
    try {
      const res = await fetch(`https://bike-repair-app-backend.onrender.com/api/mechanics/nearby?lat=${lat}&lng=${lng}&radius=5000` , {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Search failed');
      setMechanics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (mechanicId) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch('https://bike-repair-app-backend.onrender.com/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mechanicId,
          location: { coordinates: [parseFloat(lng), parseFloat(lat)] },
          description
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      setSuccess('Request sent!');
      setSelected(null);
      setDescription('');
      // Redirect to request status page if possible
      if (data._id && navigate) {
        navigate(`/rider/request/${data._id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch route when a mechanic is selected
  useEffect(() => {
    const fetchRoute = async () => {
      if (!selected) { setRoute(null); return; }
      const mechanic = mechanics.find(m => m._id === selected);
      if (!mechanic || !lat || !lng) { setRoute(null); return; }
      // Use OSRM public API for demo (no key required)
      const url = `https://router.project-osrm.org/route/v1/driving/${lng},${lat};${mechanic.location.coordinates[0]},${mechanic.location.coordinates[1]}?overview=full&geometries=polyline`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          const coords = polyline.decode(data.routes[0].geometry).map(([a, b]) => [a, b]);
          setRoute(coords);
        } else {
          setRoute(null);
        }
      } catch {
        setRoute(null);
      }
    };
    fetchRoute();
  }, [selected, lat, lng, mechanics]);

return (
    <div>
        <div className="mechanic-main-container">
            <div className="mechanic-flex-row">
                {/* Left: Map and Search Form */}
                <div className="mechanic-left-col">
                    <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
                        <h3>Find Nearby Mechanics</h3>
                        <MapLocationSelector lat={lat ? parseFloat(lat) : null} lng={lng ? parseFloat(lng) : null} setLat={setLat} setLng={setLng} mechanicMarkers={mechanics} route={route} />
                        {/* <div className="latlng-fields-row">
                            <input type="number" step="any" placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} required className="latlng-input" />
                            <input type="number" step="any" placeholder="Longitude" value={lng} onChange={e => setLng(e.target.value)} required className="latlng-input" />
                        </div> */}
                        <button
                            type="button"
                            className="location-btn"
                            onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                        (pos) => {
                                            setLat(pos.coords.latitude);
                                            setLng(pos.coords.longitude);
                                        },
                                        (err) => {
                                            setError('Could not get your location. Please allow location access in your browser settings and try again.');
                                            console.error('Geolocation error:', err);
                                        }
                                    );
                                } else {
                                    setError('Geolocation is not supported by your browser.');
                                }
                            }}
                        >
                            Use My Current Location
                        </button>
                        <button type="submit" className="search-btn">Search</button>
                    </form>
                    {success && <div style={{ color: 'green', marginTop: 12, fontWeight: 500 }}>{success}</div>}
                    {error && <div style={{ color: 'red', marginTop: 12, fontWeight: 500 }}>{error}</div>}
                </div>
                {/* Right: Mechanics List */}
                <div className="mechanic-right-col">
                    {loading && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0' }}>
                            <div className="spinner" style={{ width: 40, height: 40, border: '4px solid #eee', borderTop: '4px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <div style={{ marginTop: 8, color: '#007bff' }}>Loading mechanics...</div>
                        </div>
                    )}
                    {mechanics.length > 0 && !loading && (
                        <div>
                            <h4>Mechanics Found:</h4>
                            <ul
                                style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    maxHeight: 400,
                                    overflowY: 'auto',
                                    margin: 0,
                                }}
                                className="mechanics-list-scroll"
                            >
                                {mechanics.map(m => (
                                    <li key={m._id} style={{ border: '1px solid #ccc', borderRadius: 8, marginBottom: 12, padding: 12, boxShadow: '0 2px 8px #0001' }}>
                                        <div><strong>{m.shopName}</strong></div>
                                        <div>Address: {m.address || 'N/A'}</div>
                                        <div>Phone: {m.phone || 'N/A'}</div>
                                        <button onClick={() => setSelected(m._id)} style={{ marginTop: 8, background: '#007bff', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>Request</button>
                                        {selected === m._id && (
                                            <div style={{ marginTop: 8 }}>
                                                <textarea placeholder="Describe your issue" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', minHeight: 40, borderRadius: 4, border: '1px solid #ccc', padding: 8 }} />
                                                <button onClick={() => handleRequest(m._id)} style={{ marginTop: 8, background: '#28a745', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 16px', cursor: 'pointer' }}>Send Request</button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .mechanic-main-container {
                    width: 95vw;
                    margin: 0;
                    padding: 0;
                    font-family: 'Segoe UI, Arial, sans-serif';
                }
                .mechanic-flex-row {
                    display: flex;
                    gap: 32px;
                    align-items: flex-start;
                    width: 100%;
                    max-width: 1600px;
                    margin: 0 auto;
                }
                .mechanic-left-col {
                    flex: 1 1 0%;
                    min-width: 0;
                    padding: 40px 16px 24px 32px;
                    box-sizing: border-box;
                }
                .mechanic-right-col {
                    flex: 1 1 0%;
                    min-width: 0;
                    padding: 40px 40px 24px 24px;
                    box-sizing: border-box;
                }
                .mechanics-list-scroll {
                    max-height: 400px;
                    overflow-y: auto;
                }
                .latlng-fields-row {
                    display: flex;
                    gap: 4%;
                    margin-bottom: 8px;
                    margin-top: 15px;
                }
                .latlng-input {
                    width: 48%;
                    font-size: 16px;
                    padding: 8px 6px;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                }
                .location-btn {
                    width: 100%;
                    margin-bottom: 8px;
                    background: #28a745;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    padding: 12px 0;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                }
                .search-btn {
                    width: 100%;
                    margin-top: 4px;
                    background: #007bff;
                    color: #fff;
                    border: none;
                    border-radius: 4px;
                    padding: 12px 0;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                }
                @media (max-width: 900px) {
                    .mechanic-flex-row {
                        gap: 12px;
                    }
                    .mechanic-left-col, .mechanic-right-col {
                        padding: 24px 8px 16px 8px;
                    }
                }
                @media (max-width: 600px) {
                    .mechanic-flex-row {
                        flex-direction: column;
                        gap: 0;
                        width: 100vw;
                        max-width: 100vw;
                        margin: 0;
                    }
                    .mechanic-left-col, .mechanic-right-col {
                        width: 100vw;
                        min-width: 0;
                        padding: 12px 16px 0 16px;
                        box-sizing: border-box;
                    }
                    .latlng-fields-row {
                        flex-direction: column;
                        gap: 8px;
                        margin-bottom: 8px;
                        margin-top: 12px;
                    }
                    .latlng-input {
                        width: 100%;
                        font-size: 15px;
                        padding: 10px 8px;
                    }
                    .location-btn, .search-btn {
                        font-size: 15px;
                        padding: 14px 0;
                    }
                    .mechanics-list-scroll {
                        max-height: 250px;
                    }
                }
            `}</style>
        </div>
    </div>
);
}

export default MechanicSearchAndRequest;
