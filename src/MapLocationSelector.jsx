import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import DirectionsLine from './DirectionsLine';
import 'leaflet/dist/leaflet.css';

// Fix marker icon issue in Leaflet + Webpack
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationPicker({ lat, lng, setLat, setLng }) {
  const markerRef = useRef();
  useMapEvents({
    click(e) {
      setLat(e.latlng.lat.toFixed(6));
      setLng(e.latlng.lng.toFixed(6));
    },
  });
  return lat && lng ? <Marker position={[lat, lng]} ref={markerRef}><Popup>Your selected location</Popup></Marker> : null;
}

import { useMap } from 'react-leaflet';

function MapAutoCenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
}

export default function MapLocationSelector({ lat, lng, setLat, setLng, mechanicMarkers = [], route }) {
  const [mapLoading, setMapLoading] = React.useState(false);
  const defaultPosition = [lat || 17.385, lng || 78.4867]; // Hyderabad as fallback

  React.useEffect(() => {
    if (!lat || !lng) setMapLoading(false);
  }, [lat, lng]);

  return (
    <div className="responsive-map-container">
      {mapLoading && (
        <div className="map-loading-overlay">
          <div className="map-spinner" />
        </div>
      )}
      <MapContainer center={defaultPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapAutoCenter lat={lat ? parseFloat(lat) : null} lng={lng ? parseFloat(lng) : null} />
        <LocationPicker lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
        {mechanicMarkers.map((m) => (
          <Marker key={m._id} position={[m.location.coordinates[1], m.location.coordinates[0]]}>
            <Popup>
              <strong>{m.shopName}</strong><br />
              {m.address || 'No address'}
            </Popup>
          </Marker>
        ))}
        {route && <DirectionsLine route={route} />}
      </MapContainer>
      <div className="map-info-overlay">
        Click on the map to select your location.
      </div>
      <style>{`
        .responsive-map-container {
          width: 100%;
          min-width: 0;
          height: 400px;
          margin-bottom: 16px;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px #0001;
          background: #fff;
          transition: height 0.2s;
        }
        .map-loading-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(255,255,255,0.7);
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .map-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #eee;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .map-info-overlay {
          margin-top: 8px;
          font-size: 14px;
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          background: rgba(255,255,255,0.8);
          text-align: center;
          padding: 4px;
          pointer-events: none;
        }
        @media (max-width: 600px) {
          .responsive-map-container {
            width: 100vw;
            min-width: 0;
            left: 50%;
            right: 50%;
            margin-left: -50vw;
            margin-right: -50vw;
            height: 250px;
            border-radius: 8px;
            margin-bottom: 10px;
          }
          .map-info-overlay {
            font-size: 12px;
            padding: 2.5px;
          }
        }
        @media (max-width: 400px) {
          .responsive-map-container {
            width: 100vw;
            min-width: 0;
            left: 50%;
            right: 50%;
            margin-left: -50vw;
            margin-right: -50vw;
            height: 180px;
            border-radius: 0;
          }
          .map-info-overlay {
            font-size: 11px;
            padding: 2px;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
