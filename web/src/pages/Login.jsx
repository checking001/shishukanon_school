import React, { useState } from 'react';
import { LOGO } from '../assets/logo.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login({ onOpenAdminReg }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleLogin() {
    setError('');
    setBusy(true);
    try {
      await login(username, password);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <div className="login-card">
        <img className="logo" src={LOGO} alt="Logo" />
        <h1>শিশু কানন মডেল একাডেমি</h1>
        <p>মিরওয়ারিশপুর, বেগমগঞ্জ, নোয়াখালী</p>

        <div className="field" style={{ textAlign: 'left', marginTop: 18 }}>
          <label>ইমেইল / ইউজারনেম</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="field" style={{ textAlign: 'left', marginTop: 12 }}>
          <label>পাসওয়ার্ড</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {error && <small style={{ color: 'var(--primary)', display: 'block', marginTop: 8 }}>{error}</small>}

        <div className="actions" style={{ justifyContent: 'center' }}>
          <button className="btn primary" disabled={busy} onClick={handleLogin}>
            {busy ? 'লগইন হচ্ছে…' : 'লগইন'}
          </button>
          <button className="btn" onClick={onOpenAdminReg}>এডমিন রেজিস্টার</button>
        </div>
        <small className="muted">ডেমো লগইন: admin / admin123</small>
      </div>
    </div>
  );
}
