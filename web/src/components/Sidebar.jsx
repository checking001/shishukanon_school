import React from 'react';
import { LOGO } from '../assets/logo.js';
import { useAuth } from '../context/AuthContext.jsx';

const NAV_ITEMS = [
  ['dashboard', '🏠 Dashboard'],
  ['admission', '👨\u200d🎓 নতুন ভর্তি'],
  ['students', '📋 ছাত্র-ছাত্রী তালিকা'],
  ['verification', '🔎 তথ্য যাচাই / ID Data'],
  ['fees', '💰 ছাত্র-ছাত্রী ফি গ্রহণ'],
  ['attendance', '🕘 উপস্থিতি / SMS'],
  ['teachers', '👩\u200d🏫 শিক্ষক-কর্মচারী'],
  ['teacherSalary', '💵 শিক্ষকের বেতন'],
  ['employeeSalary', '💵 কর্মচারীর বেতন'],
  ['expenses', '🧾 অন্যান্য খরচ'],
  ['reports', '📊 রিপোর্ট'],
  ['settings', '⚙️ Settings'],
];

export default function Sidebar({ page, onNavigate, mobileOpen }) {
  const { logout } = useAuth();

  return (
    <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="brand">
        <img src={LOGO} alt="Logo" />
        <b>শিশু কানন<br />মডেল একাডেমি</b>
      </div>
      <div className="nav">
        {NAV_ITEMS.map(([id, label]) => (
          <button
            key={id}
            className={page === id ? 'active' : ''}
            onClick={() => onNavigate(id)}
          >
            {label}
          </button>
        ))}
        <button onClick={logout}>🚪 Logout</button>
      </div>
    </aside>
  );
}
