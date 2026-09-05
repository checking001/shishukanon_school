import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { api } from '../lib/api.js';
import { defaultMessage, exportAllExcel, todayISO } from '../lib/helpers.js';

const STATUSES = ['উপস্থিত', 'অনুপস্থিত', 'দেরি', 'ছুটি'];

function waNumber(to) {
  let n = (to || '').replace(/\D/g, '');
  if (n.startsWith('01')) n = '88' + n;
  return n;
}

export default function Attendance() {
  const data = useData();
  const { Students, Attendance, saveAttendanceBulk } = data;
  const [date, setDate] = useState(todayISO());
  const [waFrom, setWaFrom] = useState('');
  const [smsFrom, setSmsFrom] = useState('');
  const [rows, setRows] = useState({});
  const [busyAll, setBusyAll] = useState(false);
  const [busyId, setBusyId] = useState(null);

  // তারিখ পাল্টালে সেই দিনের সেভ করা attendance (থাকলে) থেকে, না থাকলে ডিফল্ট
  // থেকে সারি রিসেট হয় — অরিজিনাল renderAttendance()-এর মতোই।
  useEffect(() => {
    const next = {};
    Students.forEach((s) => {
      const existing = Attendance.find((a) => a.date === date && a.studentId === s.id);
      const status = existing?.status || 'উপস্থিত';
      const message = existing?.message || defaultMessage(s, status, date);
      const to = existing?.to || s.guardianMobile || '';
      next[s.id] = { status, message, to };
    });
    setRows(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  function updateRow(id, patch) {
    setRows((r) => ({ ...r, [id]: { ...r[id], ...patch } }));
  }

  function onStatusChange(s, status) {
    updateRow(s.id, { status, message: defaultMessage(s, status, date) });
  }

  function openWhatsApp(s) {
    const row = rows[s.id];
    if (!row?.to) { alert('Guardian To নম্বর নেই'); return; }
    const n = waNumber(row.to);
    window.open('https://wa.me/' + n + '?text=' + encodeURIComponent(row.message), '_blank');
  }

  function openSMS(s) {
    const row = rows[s.id];
    if (!row?.to) { alert('Guardian To নম্বর নেই'); return; }
    window.location.href = 'sms:' + row.to + '?body=' + encodeURIComponent(row.message);
  }

  async function autoSend(s) {
    const row = rows[s.id];
    if (!row?.to) { alert('Guardian To নম্বর নেই'); return; }
    setBusyId(s.id);
    try {
      await api.post('/notify/whatsapp', { to: row.to, message: row.message, studentId: s.id });
    } catch (err) {
      openWhatsApp(s);
      alert('Auto Send ব্যর্থ হয়েছে (' + err.message + ')। WhatsApp chat ম্যানুয়ালি খোলা হয়েছে।');
    } finally {
      setBusyId(null);
    }
  }

  async function saveAttendance() {
    const records = Students.map((s) => ({ date, studentId: s.id, ...rows[s.id] }));
    try {
      await saveAttendanceBulk(records);
      exportAllExcel(data);
      alert('আজকের attendance সংরক্ষণ হয়েছে এবং Excel backup তৈরি হয়েছে।');
    } catch (err) {
      alert('সংরক্ষণ ব্যর্থ: ' + err.message);
    }
  }

  // সব ছাত্র-ছাত্রীকে Auto Send — একসাথে blast না করে, একজন একজন করে পাঠানো হয়
  // (WhatsApp ban-ঝুঁকি কমাতে); বটেও নিজস্ব rate-limit থাকবে, এটা দ্বিতীয় স্তরের সুরক্ষা।
  async function sendAllAttendance() {
    setBusyAll(true);
    try {
      await saveAttendance();
      for (const s of Students) {
        // eslint-disable-next-line no-await-in-loop
        await autoSend(s);
      }
    } finally {
      setBusyAll(false);
    }
  }

  return (
    <section className="page active">
      <div className="card">
        <div className="section-title">
          <h3>Daily Attendance + Guardian Notification</h3>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="grid two" style={{ marginBottom: 16 }}>
          <div className="field">
            <label>WhatsApp From (Business Number / Phone ID)</label>
            <input value={waFrom} onChange={(e) => setWaFrom(e.target.value)} placeholder="যেমন: 8801XXXXXXXXX" />
          </div>
          <div className="field">
            <label>SMS From (Sender ID)</label>
            <input value={smsFrom} onChange={(e) => setSmsFrom(e.target.value)} placeholder="School / Sender ID" />
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>ছাত্র-ছাত্রী</th><th>Guardian To</th><th>Status</th><th>Message Review / Edit</th><th>WhatsApp</th><th>SMS</th><th>Auto Send</th></tr>
            </thead>
            <tbody>
              {Students.map((s) => {
                const row = rows[s.id] || { status: 'উপস্থিত', message: '', to: s.guardianMobile || '' };
                return (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name || s.nameBn}</td>
                    <td>
                      <input
                        style={{ width: 150 }}
                        value={row.to}
                        placeholder="8801..."
                        onChange={(e) => updateRow(s.id, { to: e.target.value })}
                      />
                    </td>
                    <td>
                      <select value={row.status} onChange={(e) => onStatusChange(s, e.target.value)}>
                        {STATUSES.map((st) => <option key={st}>{st}</option>)}
                      </select>
                    </td>
                    <td>
                      <textarea
                        className="message-box"
                        value={row.message}
                        onChange={(e) => updateRow(s.id, { message: e.target.value })}
                      />
                    </td>
                    <td><button className="btn small" onClick={() => openWhatsApp(s)}>WhatsApp</button></td>
                    <td><button className="btn small" onClick={() => openSMS(s)}>SMS</button></td>
                    <td>
                      <button className="btn small success" disabled={busyId === s.id} onClick={() => autoSend(s)}>
                        {busyId === s.id ? '...' : 'Auto Send'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {Students.length === 0 && <tr><td colSpan={8}>কোনো ছাত্র-ছাত্রী নেই</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="actions">
          <button className="btn success" onClick={saveAttendance}>💾 Attendance Save + Excel</button>
          <button className="btn primary" disabled={busyAll} onClick={sendAllAttendance}>
            {busyAll ? 'পাঠানো হচ্ছে…' : '📱 Auto Send (API)'}
          </button>
          <button className="btn" onClick={() => exportAllExcel(data)}>📥 Excel Backup</button>
        </div>
        <p className="muted">
          উপস্থিত/অনুপস্থিত/দেরি/ছুটির message এখন প্রতিটি ছাত্রের জন্য আলাদা করে Review/Edit করা যাবে।
          WhatsApp/SMS-এর To নম্বর guardian mobile থেকে আসবে। Auto Send এখন সরাসরি স্কুলের নিজস্ব WhatsApp
          বট ব্যবহার করে — আলাদা করে কোনো endpoint সেট করার দরকার নেই।
        </p>
      </div>
    </section>
  );
}
