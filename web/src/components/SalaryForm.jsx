import React, { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { genId, todayISO } from '../lib/helpers.js';
import { salaryReceiptHTML, printSalaryReceipt, downloadSalaryPDF } from '../lib/print.js';

const PREFIX = { teacher: 'TSAL-', employee: 'ESAL-' };

export default function SalaryForm({ type, title, subtitle, idPlaceholder }) {
  const { Teachers, add } = useData();
  const [teacherId, setTeacherId] = useState('');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [receiptNo, setReceiptNo] = useState(() => genId(PREFIX[type]));
  const [receipt, setReceipt] = useState(null);
  const [busy, setBusy] = useState(false);

  function lookupStaff(idValue) {
    setTeacherId(idValue);
    const t = Teachers.find((x) => x.id === idValue && x.type === type);
    setStaffName(t?.name || '');
    setStaffRole(t?.role || '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const o = Object.fromEntries(fd.entries());
    const staff = Teachers.find((x) => x.id === o.teacherId && x.type === type);
    if (!staff) {
      alert(type === 'teacher' ? 'শিক্ষক ID পাওয়া যায়নি।' : 'কর্মচারী ID পাওয়া যায়নি।');
      return;
    }
    setBusy(true);
    try {
      o.staffType = type;
      o.receipt = o.receipt || genId(PREFIX[type]);
      o.date = todayISO();
      o.teacherName = staff.name;
      o.role = staff.role;

      const saved = await add('Salaries', o);
      setReceipt(saved);
      setReceiptNo(genId(PREFIX[type]));
      setTimeout(() => printSalaryReceipt(), 350);
    } catch (err) {
      alert('সংরক্ষণ ব্যর্থ: ' + err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="card">
        <div className="section-title"><h3>{title}</h3><span className="muted">{subtitle}</span></div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field"><label>{type === 'teacher' ? 'শিক্ষক ID *' : 'কর্মচারী ID *'}</label>
              <input name="teacherId" required placeholder={idPlaceholder} value={teacherId} onChange={(e) => lookupStaff(e.target.value)} />
            </div>
            <div className="field"><label>{type === 'teacher' ? 'শিক্ষকের নাম' : 'কর্মচারীর নাম'}</label><input value={staffName} readOnly /></div>
            <div className="field"><label>পদবি</label><input value={staffRole} readOnly /></div>
            <div className="field"><label>মাস *</label><input name="month" type="month" required /></div>
            <div className="field"><label>মূল বেতন *</label><input name="amount" type="number" min="0" required /></div>
            <div className="field">
              <label>Payment Method</label>
              <select name="method">{['Cash', 'Bank', 'bKash', 'Nagad', 'Other'].map((m) => <option key={m}>{m}</option>)}</select>
            </div>
            <div className="field"><label>রশিদ নম্বর</label><input name="receipt" value={receiptNo} readOnly /></div>
            <div className="field full"><label>বিবরণ</label>
              <textarea name="note" placeholder={type === 'teacher' ? 'শিক্ষকের মাসিক বেতন / ভাতা / অন্যান্য' : 'কর্মচারীর মাসিক বেতন / ভাতা / অন্যান্য'} />
            </div>
          </div>
          <div className="actions">
            <button className="btn success" type="submit" disabled={busy}>
              {busy ? 'সংরক্ষণ হচ্ছে…' : `💾 ${type === 'teacher' ? 'শিক্ষকের' : 'কর্মচারীর'} বেতন গ্রহণ ও রশিদ তৈরি`}
            </button>
          </div>
        </form>
      </div>
      <div id="salaryReceiptArea" className="card" style={{ display: receipt ? 'block' : 'none' }}>
        {receipt && (
          <>
            <div dangerouslySetInnerHTML={{ __html: salaryReceiptHTML(receipt) }} />
            <div className="salary-receipt-actions no-print">
              <button className="btn success" onClick={() => alert('রশিদ সংরক্ষণ হয়েছে: ' + receipt.receipt)}>💾 সংরক্ষণ</button>
              <button className="btn dark" onClick={() => printSalaryReceipt()}>🖨️ Print</button>
              <button className="btn primary" onClick={() => downloadSalaryPDF(receipt)}>📄 PDF Save</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
