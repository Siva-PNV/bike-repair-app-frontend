import React from 'react';
import NavBar from './NavBar';
import MechanicSearchAndRequest from './MechanicSearchAndRequest';

export default function RiderDashboard() {
  // Placeholder dashboard content
  // Get riderId and token from localStorage
  let riderId = null;
  let token = null;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('riderUser');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        riderId = user.id || user._id;
      } catch (error) {
        console.error('Failed to parse riderUser from localStorage:', error);
      }
    }
    token = localStorage.getItem('token');
  }
  return (
    <>
      {/* <NavBar /> */}
      <div style={{  margin: '40px auto', padding: 24, borderRadius: 8 }}>
        <h2>Rider Dashboard</h2>
        <p>Welcome, Rider! Your dashboard will show your requests, status, and more.</p>
        <div style={{ marginTop: 32 }}>
          <MechanicSearchAndRequest token={token} riderId={riderId} />
        </div>
      </div>
    </>
  );
}
