import React from 'react';
import { useData } from '../context/DataContext.jsx';

export default function Verification() {
  const { Students, update, remove } = useData();

  async function verifyStudent(s) {
    try {
      await update('Students', s.id, { verified: true });
      alert('Verified: ' + (s.nameBn || s.name || s.id));
    } catch (err) {
      alert('ব্যর্থ: ' + err.message);
    }
  }

  async function editStudent(s) {
    const bn = prompt('ছাত্র/ছাত্রীর নাম (বাংলা):', s.nameBn || s.name || ''); if (bn === null) return;
    const en = prompt('ছাত্র/ছাত্রীর নাম (English):', s.nameEn || ''); if (en === null) return;
    const father = prompt('পিতার নাম:', s.father || ''); if (father === null) return;
    const mother = prompt('মাতার নাম:', s.mother || ''); if (mother === null) return;
    const nid = prompt('অভিভাবকের NID নম্বর:', s.guardianNid || ''); if (nid === null) return;
    const mobile = prompt('অভিভাবকের মোবাইল:', s.guardianMobile || ''); if (mobile === null) return;
    const cls = prompt('শ্রেণী:', s.class || ''); if (cls === null) return;
    const blood = prompt('Blood Group:', s.blood || ''); if (blood === null) return;
    try {
      await update('Students', s.id, {
        nameBn: bn, nameEn: en, name: bn || en, father, mother,
        guardianNid: nid, guardianMobile: mobile, class: cls, blood,
      });
      alert('ছাত্র-ছাত্রীর তথ্য আপডেট হয়েছে।');
    } catch (err) {
      alert('আপডেট ব্যর্থ: ' + err.message);
    }
  }

  async function deleteStudent(s) {
    if (!confirm('এই ছাত্র-ছাত্রীর ID ও সম্পূর্ণ তথ্য মুছে ফেলতে চান?')) return;
    try {
      await remove('Students', s.id);
    } catch (err) {
      alert('মুছে ফেলা যায়নি: ' + err.message);
    }
  }

  return (
    <section className="page active">
      <div className="card">
        <div className="section-title">
          <h3>Student ID Data Details Check / Verification</h3>
          <button className="btn dark" onClick={() => window.print()}>🖨️ Print</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>ছবি</th><th>Student</th><th>Guardian NID</th><th>Guardian ID Photo</th><th>আয়ের উৎস</th><th>মাসিক বেতন দিতে পারবেন?</th><th>Action</th></tr>
            </thead>
            <tbody>
              {Students.length === 0 && <tr><td colSpan={8}>কোনো তথ্য নেই</td></tr>}
              {Students.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.photo ? <img src={s.photo} className="photo-preview" alt="" /> : '—'}</td>
                  <td><b>{s.nameBn || s.name || ''}</b><br />{s.nameEn || ''}<br />পিতা: {s.father || ''}<br />মাতা: {s.mother || ''}</td>
                  <td>{s.guardianNid || '—'}</td>
                  <td>{s.guardianId ? <span className="badge present">সংযুক্ত</span> : <span className="badge absent">নেই</span>}</td>
                  <td>{s.incomeSource || '—'}</td>
                  <td>{s.canPay || 'যাচাই প্রয়োজন'}</td>
                  <td>
                    <button className="btn small" onClick={() => verifyStudent(s)}>Verify</button>{' '}
                    <button className="btn small" onClick={() => editStudent(s)}>Edit</button>{' '}
                    <button className="btn small danger" onClick={() => deleteStudent(s)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
