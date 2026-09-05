import React, { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { genId, todayISO } from '../lib/helpers.js';
import { receiptHTML, printFeeReceipt } from '../lib/print.js';

const FEE_FIELDS = [
  ['monthly', 'মাসিক বেতন'], ['newRenew', 'নতুন / পুনঃ ভর্তি'], ['form', 'ভর্তি ফরম ফি'],
  ['due', 'অগ্রিম / বকেয়া বেতন'], ['exam', 'পরীক্ষার ফি'], ['mct', 'MCT ফি'],
  ['semester', 'সেমিস্টার ফি'], ['books', 'স্কুল বই ফি'], ['transport', 'Transport ফি'],
  ['stationery', 'Stationery Items ফি'], ['certificate', 'প্রশংসা পত্র ফি'], ['other', 'অন্যান্য ফি'],
];

export default function Fees() {
  const { Students, add, update } = useData();
  const [studentName, setStudentName] = useState('');
  const [receiptNo, setReceiptNo] = useState(() => genId('RC-'));
  const [receipt, setReceipt] = useState(null);
  const [busy, setBusy] = useState(false);

  function lookupStudent(e) {
    const s = Students.find((x) => x.id === e.target.value);
    setStudentName(s?.nameBn || s?.name || '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData(e.target);
      const o = Object.fromEntries(fd.entries());
      const nums = FEE_FIELDS.map(([k]) => k);
      o.total = nums.reduce((a, k) => a + Number(o[k] || 0), 0);
      o.receipt = o.receipt || genId('RC-');

      const saved = await add('Fees', o);

      const s = Students.find((x) => x.id === o.studentId);
      if (s) {
        await update('Students', s.id, { due: Math.max(0, Number(s.due || 0) - Number(o.due || 0)) });
      }

      setReceipt(saved);
      printFeeReceipt(saved);
      e.target.reset();
      setStudentName('');
      setReceiptNo(genId('RC-'));
    } catch (err) {
      alert('সংরক্ষণ ব্যর্থ: ' + err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="page active">
      <div className="card">
        <div className="section-title">
          <h3>ছাত্র-ছাত্রী ফি গ্রহণ / রসিদ</h3>
          <span className="muted">সকল ফি + সর্বমোট Amount Receipt-এ যোগ হবে</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field"><label>Student ID</label><input name="studentId" required onInput={lookupStudent} /></div>
            <div className="field"><label>Student Name</label><input name="studentName" value={studentName} readOnly /></div>
            <div className="field"><label>পেমেন্ট তারিখ</label><input name="date" type="date" defaultValue={todayISO()} /></div>
            {FEE_FIELDS.map(([k, label]) => (
              <div className="field" key={k}><label>{label}</label><input name={k} type="number" defaultValue={0} /></div>
            ))}
            <div className="field">
              <label>Payment Method</label>
              <select name="method">{['Cash', 'Bank', 'bKash', 'Nagad', 'Other'].map((m) => <option key={m}>{m}</option>)}</select>
            </div>
            <div className="field"><label>রসিদ নম্বর</label><input name="receipt" value={receiptNo} readOnly /></div>
          </div>
          <div className="actions"><button className="btn success" type="submit" disabled={busy}>{busy ? 'তৈরি হচ্ছে…' : '🧾 রসিদ তৈরি ও Print'}</button></div>
        </form>
      </div>
      {receipt && (
        <div className="card" style={{ marginTop: 16 }} dangerouslySetInnerHTML={{ __html: receiptHTML(receipt) }} />
      )}
    </section>
  );
}
