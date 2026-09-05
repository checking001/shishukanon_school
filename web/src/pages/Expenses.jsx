import React, { useState } from 'react';
import { useData } from '../context/DataContext.jsx';

const EXPENSE_TYPES = ['বিদ্যুৎ', 'ভাড়া', 'স্টেশনারি', 'মেরামত', 'অন্যান্য'];

export default function Expenses() {
  const { add } = useData();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const o = Object.fromEntries(new FormData(e.target).entries());
      await add('Expenses', o);
      alert('খরচ সংরক্ষণ হয়েছে।');
      e.target.reset();
    } catch (err) {
      alert('সংরক্ষণ ব্যর্থ: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page active">
      <div className="card">
        <div className="section-title"><h3>Other Expenses / অন্যান্য খরচ</h3></div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field"><label>খরচের ধরন</label>
              <select name="type">{EXPENSE_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
            </div>
            <div className="field"><label>তারিখ</label><input name="date" type="date" /></div>
            <div className="field"><label>Amount</label><input name="amount" type="number" required /></div>
            <div className="field full"><label>বিবরণ</label><textarea name="description" /></div>
          </div>
          <div className="actions">
            <button className="btn primary" disabled={saving}>{saving ? 'সংরক্ষণ হচ্ছে…' : 'খরচ সংরক্ষণ'}</button>
          </div>
        </form>
      </div>
    </section>
  );
}
