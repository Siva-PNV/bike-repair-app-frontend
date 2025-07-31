import React, { useState } from 'react';

function MechanicRegister({ onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    shopName: '',
    address: '',
    phone: '',
    lat: '',
    lng: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: 'mechanic',
      shopName: form.shopName,
      address: form.address,
      phone: form.phone,
      location: {
        type: 'Point',
        coordinates: [parseFloat(form.lng), parseFloat(form.lat)]
      }
    };
    try {
      const res = await fetch('http://localhost:5050/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess('Registration successful!');
      setForm({ name: '', email: '', password: '', shopName: '', address: '', phone: '', lat: '', lng: '' });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
        <h3>Mechanic Registration</h3>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required style={{ width: '100%', marginBottom: 8 }} />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required style={{ width: '100%', marginBottom: 8 }} />
        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required style={{ width: '100%', marginBottom: 8 }} />
        <input name="shopName" value={form.shopName} onChange={handleChange} placeholder="Shop Name" required style={{ width: '100%', marginBottom: 8 }} />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" style={{ width: '100%', marginBottom: 8 }} />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" style={{ width: '100%', marginBottom: 8 }} />
        <button
          type="button"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                pos => {
                  setForm(f => ({
                    ...f,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                  }));
                },
                () => alert('Location access denied')
              );
            } else {
              alert('Geolocation not supported');
            }
          }}
          style={{ width: '100%', marginBottom: 8 }}
        >
          Use My Current Location
        </button>
        <input name="lat" type="number" step="any" value={form.lat} onChange={handleChange} placeholder="Latitude" required style={{ width: '48%', marginRight: '4%' }} />
        <input name="lng" type="number" step="any" value={form.lng} onChange={handleChange} placeholder="Longitude" required style={{ width: '48%' }} />
        <button type="submit" style={{ width: '100%', marginTop: 12 }}>Register</button>
        {success && <div style={{ color: 'green', marginTop: 12 }}>{success}</div>}
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
}

export default MechanicRegister;
