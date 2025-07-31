import React from 'react';

import RiderLoginRegisterDemo from './RiderLoginRegisterDemo';

import MechanicLoginDemo from './MechanicLoginDemo';

export default function RoleSwitcherApp() {
  // Responsive: stack vertically on small screens, side by side on desktop
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 40,
        marginTop: 40,
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          minWidth: 280,
          flex: '1 1 320px',
          maxWidth: 400,
          marginBottom: 24,
        }}
      >
        <RiderLoginRegisterDemo />
      </div>
      <div
        style={{
          minWidth: 280,
          flex: '1 1 320px',
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <MechanicLoginDemo />
      </div>
      <style>{`
        @media (max-width: 700px) {
          div[role="switcher-container"] {
            flex-direction: column !important;
            gap: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
