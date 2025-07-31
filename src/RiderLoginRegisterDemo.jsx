import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MechanicSearchAndRequest from './MechanicSearchAndRequest';

export default function RiderLoginRegisterDemo({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('riderUser');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch { /* ignore parse error */ }
      }
    }
    return null;
  });
//   const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = isRegister ? 'http://localhost:5050/api/auth/register' : 'http://localhost:5050/api/auth/login';
      const body = isRegister
        ? { name: form.name, email: form.email, password: form.password, role: 'rider' }
        : { email: form.email, password: form.password };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        // Intentionally ignore JSON parse errors
      }
      if (!res.ok) {
        setError(data.message || 'Registration/Login failed');
        setSuccess('');
        return;
      }
      if (isRegister) {
        setSuccess('Registration successful! Please log in.');
        setIsRegister(false);
        setForm({ email: '', password: '', name: '' });
        setError('');
        return;
      }
      setUser(data.user);
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.user) {
        localStorage.setItem('riderUser', JSON.stringify(data.user));
        // Redirect to /rider-dashboard after login
        navigate('/rider-dashboard', { replace: true });
      }
      if (onLogin) onLogin(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Auto-logout if user is removed from localStorage (e.g., manual clear)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorage = () => {
        const stored = localStorage.getItem('riderUser');
        if (!stored) setUser(null);
      };
      window.addEventListener('storage', handleStorage);
      return () => window.removeEventListener('storage', handleStorage);
    }
  }, []);
  // Prevent infinite redirect loop: only redirect if not already on /rider-dashboard
  React.useEffect(() => {
    if (user && window.location.pathname !== '/rider-dashboard') {
      navigate('/rider-dashboard', { replace: true });
    }
  }, [user, navigate]);
  if (user && window.location.pathname === '/rider-dashboard') {
    return null;
  }
// 
  return (
    <div>
      <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
        <h2>{isRegister ? 'Rider Register' : 'Rider Login'}</h2>
        {isRegister && (
          <input name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required style={{ width: '100%', marginBottom: 12 }} />
        )}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ width: '100%', marginBottom: 12 }} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={{ width: '100%', marginBottom: 12 }} />
        <button type="submit" style={{ width: '100%' }}>{isRegister ? 'Register' : 'Login'}</button>
        <div style={{ marginTop: 12 }}>
          <button type="button" onClick={() => setIsRegister((v) => !v)} style={{ width: '100%' }}>
            {isRegister ? 'Already have an account? Login' : 'No account? Register'}
          </button>
        </div>
        {success && <div style={{ color: 'green', marginTop: 12 }}>{success}</div>}
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
}
