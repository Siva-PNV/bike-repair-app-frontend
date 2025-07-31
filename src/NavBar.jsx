import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  // Logout handler for any user
  const handleLogout = () => {
    localStorage.removeItem('riderUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/', { replace: true });
  };
  // Styles
  const navStyle = {
    width: '100vw',
    minHeight: 70,
    background: '#111',
    padding: '0',
    borderRadius: 0,
    marginBottom: 24,
    boxShadow: '0 1px 4px #0001',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  // Optionally, update logoStyle and btnStyle for contrast
  const rowStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 32px',
    boxSizing: 'border-box',
  };
  const btnStyle = {
    margin: '0 8px',
    padding: '8px 16px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
    textAlign: 'left',
  };
  const logoutBtnStyle = {
    ...btnStyle,
    background: 'transparent',
    color: '#ff5555',
    border: 'none',
  };
  const logoStyle = {
    fontWeight: 700,
    fontSize: 28,
    color: '#fff',
    marginRight: 32,
    letterSpacing: 1,
  };
  // Determine user role and login state
  const userStr = localStorage.getItem('user');
  const riderStr = localStorage.getItem('riderUser');
  let userRole = null;
  let isLoggedIn = false;
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.role === 'mechanic') {
        userRole = 'mechanic';
        isLoggedIn = true;
      }
    } catch (e) {
      console.error(e);
    }
  }
  if (riderStr) {
    try {
      const rider = JSON.parse(riderStr);
      if (rider) {
        userRole = 'rider';
        isLoggedIn = true;
      }
    } catch (e) {
         console.error(e);
    }
  }
  return (
    <nav style={navStyle}>
      <div style={rowStyle}>
        <span style={logoStyle}>Bike Repair</span>
        {/* Hamburger icon for mobile */}
        <div
          className="nav-hamburger"
          style={{ display: 'none', cursor: 'pointer', marginLeft: 16 }}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <div style={{ width: 28, height: 4, background: '#fff', margin: '5px 0', borderRadius: 2 }} />
          <div style={{ width: 28, height: 4, background: '#fff', margin: '5px 0', borderRadius: 2 }} />
          <div style={{ width: 28, height: 4, background: '#fff', margin: '5px 0', borderRadius: 2 }} />
        </div>
        <div
          className="nav-btns"
          style={{
            display: 'flex',
            alignItems: 'center',
            ...(menuOpen ? { position: 'absolute', top: 70, right: 0, background: '#222', flexDirection: 'column', width: 220, boxShadow: '0 2px 8px #0002', borderRadius: 8, zIndex: 3000, padding: 16 } : {}),
          }}
        >
          <button
            style={btnStyle}
            onClick={() => {
              setMenuOpen(false);
              // Home navigation logic (same as before)
              const userStr = localStorage.getItem('user');
              const riderStr = localStorage.getItem('riderUser');
              let user = null;
              if (userStr) {
                try { user = JSON.parse(userStr); } catch (e) {
                     console.error(e);
                }
              }
              if (user && user.role === 'mechanic') {
                navigate('/mechanic-dashboard');
                return;
              }
              if (riderStr) {
                try {
                  const rider = JSON.parse(riderStr);
                  if (rider) {
                    navigate('/rider-dashboard');
                    return;
                  }
                } catch (e) {
                     console.error(e);
                }
              }
              navigate('/');
            }}
          >
            Home
          </button>
          {userRole === 'mechanic' && (
            <button style={btnStyle} onClick={() => { setMenuOpen(false); navigate('/mechanic-completed'); }}>Completed Requests</button>
          )}
          {userRole === 'rider' && (
            <button style={btnStyle} onClick={() => { setMenuOpen(false); navigate('/rider/requests-history'); }}>My Request History</button>
          )}
          {!isLoggedIn && (
            <button style={btnStyle} onClick={() => { setMenuOpen(false); navigate('/mechanic-register'); }}>Mechanic Register</button>
          )}
          {isLoggedIn && (
            <button style={logoutBtnStyle} onClick={() => { setMenuOpen(false); handleLogout(); }}>Logout</button>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 800px) {
          .nav-btns {
            display: none !important;
          }
          .nav-hamburger {
            display: block !important;
          }
        }
        @media (max-width: 800px) {
          .nav-btns${menuOpen ? '' : ''} {
            display: ${menuOpen ? 'flex' : 'none'} !important;
          }
        }
      `}</style>
    </nav>
  );
}
