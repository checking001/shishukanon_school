import React, { useState } from 'react';

const PASS_KEY = 'skReportPassword';
const UNLOCK_KEY = 'skReportsUnlocked';
const DEFAULT_PASS = '123456';

export function getReportPass() {
  return localStorage.getItem(PASS_KEY) || DEFAULT_PASS;
}

// ব্রাউজার ট্যাব বন্ধ না করা পর্যন্ত আনলক থাকে — অরিজিনাল sessionStorage আচরণের মতোই।
export function isReportsUnlocked() {
  return sessionStorage.getItem(UNLOCK_KEY) === '1';
}

export default function ReportPassModal({ onUnlock, onClose }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  function unlock() {
    if (pass !== getReportPass()) {
      setError('রিপোর্ট পাসওয়ার্ড ভুল। প্রয়োজনে 123456 Reset চাপুন।');
      return;
    }
    sessionStorage.setItem(UNLOCK_KEY, '1');
    onUnlock();
  }

  function resetPassword() {
    localStorage.setItem(PASS_KEY, DEFAULT_PASS);
    sessionStorage.removeItem(UNLOCK_KEY);
    setPass('');
    alert('রিপোর্ট পাসওয়ার্ড 123456 এ Reset হয়েছে। এখন 123456 দিয়ে প্রবেশ করুন।');
  }

  return (
    <div style={{ display: 'flex', position: 'fixed', inset: 0, background: '#0008', zIndex: 101, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card" style={{ width: 'min(420px,100%)' }}>
        <div className="section-title">
          <h3>🔐 রিপোর্ট পাসওয়ার্ড</h3>
          <button className="btn" onClick={onClose}>✕</button>
        </div>
        <div className="field">
          <label>রিপোর্ট Password</label>
          <input
            type="password"
            autoComplete="off"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && unlock()}
          />
        </div>
        {error && <small style={{ color: 'var(--primary)' }}>{error}</small>}
        <div className="actions">
          <button className="btn primary" onClick={unlock}>🔓 প্রবেশ করুন</button>
          <button className="btn warning" onClick={resetPassword}>123456 Reset</button>
        </div>
      </div>
    </div>
  );
}
