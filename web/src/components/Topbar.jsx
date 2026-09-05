import React, { useEffect, useState } from 'react';
import { LOGO } from '../assets/logo.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatHeaderDate, formatHeaderTime } from '../lib/helpers.js';

export default function Topbar({ onMenuToggle }) {
  const { admin } = useAuth();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu" type="button" aria-label="Menu" onClick={onMenuToggle}>☰</button>
        <img className="topbar-logo" src={LOGO} alt="শিশু কানন মডেল একাডেমি Logo" />
        <div className="school-head">
          <div className="bn">শিশু কানন মডেল একাডেমি</div>
          <div className="addr">মিরওয়ারিশপুর, বেগমগঞ্জ, নোয়াখালী</div>
        </div>
      </div>
      <div className="topbar-right">
        <div className="date-chip">
          <span className="cal">▣</span>
          <div><b>{formatHeaderDate(now)}</b><br /><span>{formatHeaderTime(now)}</span></div>
        </div>
        <div className="account-chip">
          <div className="account-text"><b>{admin?.username}</b><br /><span>Administrator</span></div>
          <div className="avatar">
            {admin?.photo ? <img src={admin.photo} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '👤'}
          </div>
          <span>⌄</span>
        </div>
      </div>
    </div>
  );
}
