import React from 'react';
import { Polyline } from 'react-leaflet';

export default function DirectionsLine({ route }) {
  if (!route) return null;
  // route should be an array of [lat, lng] pairs
  return <Polyline positions={route} color="blue" weight={5} />;
}
