import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { fileToDataUri } from '../lib/helpers.js';

export default function AdminRegModal({ onClose }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    setError('');
    if (!username.trim()) return setError('Username দিন');
    if (pass.length < 6) return setError('Password কমপক্ষে ৬ অক্ষরের হতে হবে');
    if (pass !== pass2) return setError('Password মিলছে না');

    setBusy(true);
    try {
      const photo = photoFile ? await fileToDataUri(photoFile) : '';
      await register(username.trim(), pass, photo);
      alert('✅ Admin Registration সম্পন্ন হয়েছে। এখন লগইন করুন।');
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', position: 'fixed', inset: 0, background: '#0008', zIndex: 100, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: 'min(460px,100%)', maxHeight: '90vh', overflow: 'auto' }}>
        <div className="section-title">
          <h3>🔐 Admin Registration</h3>
          <button className="btn" onClick={onClose}>✕</button>
        </div>
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="field">
            <label>Admin Username</label>
            <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="কমপক্ষে 6 অক্ষর" value={pass} onChange={(e) => setPass(e.target.value)} />
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} />
          </div>
          <div className="field">
            <label>Admin Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0] || null)} />
          </div>
        </div>
        {error && <small style={{ color: 'var(--primary)' }}>{error}</small>}
        <div className="actions">
          <button className="btn primary" disabled={busy} onClick={save}>
            {busy ? 'সংরক্ষণ হচ্ছে…' : '💾 Registration Save'}
          </button>
          <button className="btn" onClick={onClose}>বাতিল</button>
        </div>
      </div>
    </div>
  );
}
