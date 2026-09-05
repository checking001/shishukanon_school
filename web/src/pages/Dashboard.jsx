import React, { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { money, todayISO, formatHeaderDate, exportAllExcel, reportStudents, reportFees } from '../lib/helpers.js';

const STATUS_COLORS = {
  'উপস্থিত': '#16a34a',
  'অনুপস্থিত': '#ef1d2d',
  'দেরি': '#f59e0b',
  'ছুটি': '#2563eb',
};
const STATUS_ORDER = Object.keys(STATUS_COLORS);

export default function Dashboard({ onNavigate }) {
  const { admin } = useAuth();
  const data = useData();
  const { Students, Teachers, Fees, Attendance, Expenses } = data;

  const recentAdmissions = useMemo(() => [...Students].slice(-5).reverse(), [Students]);
  const recentFees = useMemo(() => [...Fees].slice(-5).reverse(), [Fees]);
  const recentExpenses = useMemo(() => [...Expenses].slice(-5).reverse(), [Expenses]);

  const todayAttendance = useMemo(
    () => Attendance.filter((a) => a.date === todayISO()),
    [Attendance]
  );
  const counts = useMemo(() => {
    const c = Object.fromEntries(STATUS_ORDER.map((s) => [s, 0]));
    todayAttendance.forEach((a) => { if (c[a.status] !== undefined) c[a.status] += 1; });
    return c;
  }, [todayAttendance]);
  const total = todayAttendance.length;

  const donutStyle = useMemo(() => {
    if (!total) return {};
    let acc = 0;
    const stops = STATUS_ORDER.map((s) => {
      const from = acc;
      acc += (counts[s] / total) * 100;
      return `${STATUS_COLORS[s]} ${from}% ${acc}%`;
    });
    return { background: `conic-gradient(${stops.join(',')})` };
  }, [counts, total]);

  return (
    <section className="page active">
      <div className="section-title" style={{ margin: '8px 4px 14px' }}>
        <div>
          <h3 style={{ fontSize: 24, marginBottom: 4 }}>স্বাগতম, {admin?.username} 👋</h3>
          <span className="muted">আপনার আজকের সারসংক্ষেপ</span>
        </div>
        <span className="muted">{formatHeaderDate()}</span>
      </div>

      <div className="grid stats">
        <div className="stat">
          <div className="muted">মোট ছাত্র-ছাত্রী</div>
          <div className="num">{Students.length}</div>
          <div className="muted" style={{ cursor: 'pointer' }} onClick={() => onNavigate('students')}>বিস্তারিত দেখুন →</div>
        </div>
        <div className="stat">
          <div className="muted">মোট শিক্ষক/কর্মচারী</div>
          <div className="num">{Teachers.length}</div>
          <div className="muted" style={{ cursor: 'pointer' }} onClick={() => onNavigate('teachers')}>বিস্তারিত দেখুন →</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dashboard-card">
          <div className="section-title">
            <h3>👤 সাম্প্রতিক ভর্তি তালিকা</h3>
            <button className="btn small" onClick={() => onNavigate('admission')}>সব দেখুন</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>নাম</th><th>শ্রেণী</th><th>ভর্তি তারিখ</th><th>অভিভাবকের মোবাইল</th></tr></thead>
              <tbody>
                {recentAdmissions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td><td>{s.nameBn || s.name}</td><td>{s.class}</td>
                    <td>{s.admissionDate}</td><td>{s.guardianMobile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="section-title">
            <h3>📊 আজকের উপস্থিতি সারাংশ</h3>
            <button className="btn small" onClick={() => onNavigate('attendance')}>সব দেখুন</button>
          </div>
          <div className="donut-wrap">
            <div className="donut" style={donutStyle}>
              <div className="donut-center"><span>মোট</span><strong>{total}</strong></div>
            </div>
            <div className="legend">
              {STATUS_ORDER.map((s) => (
                <div key={s}><span className="dot" style={{ background: STATUS_COLORS[s] }} />{s}: {counts[s]}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dash-grid bottom">
        <div className="dashboard-card">
          <div className="section-title">
            <h3>💰 সাম্প্রতিক ফি সংগ্রহ</h3>
            <button className="btn small" onClick={() => onNavigate('fees')}>সব দেখুন</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>রসিদ নং</th><th>নাম</th><th>ফি</th><th>পরিমাণ</th><th>তারিখ</th></tr></thead>
              <tbody>
                {recentFees.map((f) => (
                  <tr key={f.receipt}>
                    <td>{f.receipt}</td><td>{f.studentName}</td><td>{f.method}</td>
                    <td>{money(f.total)}</td><td>{f.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="section-title">
            <h3>🧾 সাম্প্রতিক খরচ</h3>
            <button className="btn small" onClick={() => onNavigate('expenses')}>সব দেখুন</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ধরন</th><th>পরিমাণ</th><th>তারিখ</th></tr></thead>
              <tbody>
                {recentExpenses.map((e, i) => (
                  <tr key={i}><td>{e.type}</td><td>{money(e.amount)}</td><td>{e.date}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="section-title"><h3>⚡ দ্রুত লিংক</h3></div>
          <div className="quick-grid">
            <button className="quick" onClick={() => onNavigate('admission')}><span>👨‍🎓</span>নতুন ভর্তি</button>
            <button className="quick" onClick={() => onNavigate('fees')}><span>💳</span>ফি সংগ্রহ</button>
            <button className="quick" onClick={() => onNavigate('attendance')}><span>☑️</span>উপস্থিতি</button>
            <button className="quick" onClick={() => onNavigate('teachers')}><span>👩‍🏫</span>শিক্ষক যোগ</button>
            <button className="quick" onClick={() => onNavigate('expenses')}><span>🧾</span>খরচ যোগ</button>
            <button className="quick" onClick={() => exportAllExcel(data)}><span>📊</span>Excel Export</button>
            <button className="quick" onClick={() => reportStudents(Students)}><span>🖨️</span>রিপোর্ট</button>
            <button className="quick" onClick={() => reportFees(Fees)}><span>📋</span>ফি রিপোর্ট</button>
            <button className="quick" onClick={() => onNavigate('settings')}><span>⚙️</span>সেটিংস</button>
          </div>
        </div>
      </div>
    </section>
  );
}
