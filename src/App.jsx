import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleSwitcherApp from './RoleSwitcherApp';
import MechanicLoginDemo from './MechanicLoginDemo';
import MechanicCompletedRequests from './MechanicCompletedRequests';
import MechanicRegister from './MechanicRegister';
import RiderRequestStatus from './RiderRequestStatus';
import RiderRequestsHistory from './RiderRequestsHistory';
import NavBar from './NavBar';
import { useLocation } from 'react-router-dom';
import RiderDashboard from './RiderDashboard';

function App() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const location = useLocation();
  const hideNavBar = location.pathname === '/login' || location.pathname === '/';
  return (
    <div>
      {!hideNavBar && <NavBar token={token} />}
      <Routes>
        <Route path="/rider/request/:requestId" element={<RiderRequestStatus token={token} />} />
        <Route path="/rider/requests-history" element={<RiderRequestsHistory token={token} />} />
      <Route path="/mechanic-dashboard" element={<MechanicLoginDemo />} />
      <Route path="/mechanic-completed" element={<MechanicCompletedRequests />} />
        <Route path="/rider-dashboard" element={<RiderDashboard />} />
        <Route path="/mechanic-register" element={<MechanicRegister />} />
        <Route path="/*" element={<RoleSwitcherApp />} />
      </Routes>
    </div>
  );
}

export default App;
