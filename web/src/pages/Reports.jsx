import React, { useMemo } from 'react';
import { useData } from '../context/DataContext.jsx';
import { money, reportStudents, reportFees, reportFinance, todayISO } from '../lib/helpers.js';
import { getReportPass } from '../components/ReportPassModal.jsx';

function changeReportPassword() {
  const current = getReportPass();
  const old = prompt('বর্তমান রিপোর্ট পাসওয়ার্ড দিন:');
  if (old !== current) { alert('বর্তমান পাসওয়ার্ড ভুল।'); return; }
  const p = prompt('নতুন রিপোর্ট পাসওয়ার্ড দিন (কমপক্ষে 4 অক্ষর):');
  if (!p || p.length < 4) { alert('পাসওয়ার্ড কমপক্ষে 4 অক্ষরের হতে হবে।'); return; }
  const p2 = prompt('নতুন পাসওয়ার্ড আবার দিন:');
  if (p !== p2) { alert('পাসওয়ার্ড মিলেনি।'); return; }
  localStorage.setItem('skReportPassword', p);
  sessionStorage.removeItem('skReportsUnlocked');
  alert('রিপোর্ট পাসওয়ার্ড পরিবর্তন হয়েছে।');
}

export default function Reports() {
  const data = useData();
  const { Students, Fees, Expenses } = data;

  const todayIncome = useMemo(
    () => Fees.filter((f) => f.date === todayISO()).reduce((a, x) => a + Number(x.total || 0), 0),
    [Fees]
  );
  const totalDue = useMemo(() => Students.reduce((a, s) => a + Number(s.due || 0), 0), [Students]);
  const totalExpense = useMemo(() => Expenses.reduce((a, x) => a + Number(x.amount || 0), 0), [Expenses]);

  return (
    <section className="page active">
      <div className="card no-print" style={{ marginBottom: 16 }}>
        <div className="section-title">
          <h3>🔐 রিপোর্ট নিরাপত্তা</h3>
          <button className="btn warning" onClick={changeReportPassword}>পাসওয়ার্ড পরিবর্তন</button>
        </div>
        <p className="muted">রিপোর্ট মেনু পাসওয়ার্ড ছাড়া খোলা যাবে না। ডিফল্ট পাসওয়ার্ড: <b>123456</b></p>
      </div>
      <div className="grid three">
        <div className="card">
          <h3>Student Report</h3>
          <p className="muted">ছাত্র-ছাত্রীর তালিকা, শ্রেণী, অভিভাবক, বকেয়া।</p>
          <button className="btn dark" onClick={() => reportStudents(Students)}>Print</button>
        </div>
        <div className="card">
          <h3>Fee Report</h3>
          <p className="muted">গ্রহণকৃত ফি ও রসিদ।</p>
          <button className="btn dark" onClick={() => reportFees(Fees)}>Print</button>
        </div>
        <div className="card">
          <h3>Financial Report</h3>
          <p className="muted">আয় বনাম শিক্ষকের বেতন ও অন্যান্য খরচ।</p>
          <button className="btn dark" onClick={() => reportFinance(data)}>Print</button>
        </div>
        <div className="card"><h3>আজকের মোট সংগ্রহ</h3><div className="num">{money(todayIncome)}</div></div>
        <div className="card"><h3>মোট বকেয়া</h3><div className="num">{money(totalDue)}</div></div>
        <div className="card"><h3>মোট খরচ</h3><div className="num">{money(totalExpense)}</div></div>
      </div>
    </section>
  );
}
