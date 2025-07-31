import React from 'react';

import RiderLoginRegisterDemo from './RiderLoginRegisterDemo';

import MechanicLoginDemo from './MechanicLoginDemo';

export default function RoleSwitcherApp() {
  // Show both forms side by side
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 40, marginTop: 40 }}>
      <div style={{ minWidth: 340 }}>
        <RiderLoginRegisterDemo />
      </div>
      <div style={{ minWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <MechanicLoginDemo />
      </div>
    </div>
  );
}
