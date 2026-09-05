import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { money } from '../lib/helpers.js';
import { printStudentCard } from '../lib/print.js';

export default function Students() {
  const { Students, update, remove } = useData();
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const query = q.toLowerCase();
    return Students.filter((s) => (
      (s.nameBn || s.name || '').toLowerCase().includes(query)
      || (s.nameEn || '').toLowerCase().includes(query)
      || (s.id || '').toLowerCase().includes(query)
      || (s.class || '').toLowerCase().includes(query)
      || (s.guardianMobile || '').toLowerCase().includes(query)
    ));
  }, [Students, q]);

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
      alert('তথ্য মুছে ফেলা হয়েছে।');
    } catch (err) {
      alert('মুছে ফেলা যায়নি: ' + err.message);
    }
  }

  return (
    <section className="page active">
      <div className="card">
        <div className="section-title">
          <h3>ছাত্র-ছাত্রী তালিকা ও Student Details</h3>
          <input className="search" placeholder="নাম / ID / শ্রেণী দিয়ে খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ছবি</th><th>ID</th><th>নাম (বাংলা/English)</th><th>পিতা</th><th>মাতা</th><th>শ্রেণী</th><th>Blood</th><th>Guardian</th><th>মোবাইল</th><th>বকেয়া</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={11}>কোনো ছাত্র-ছাত্রী নেই</td></tr>}
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.photo ? <img src={s.photo} className="photo-preview" alt="" /> : '—'}</td>
                  <td>{s.id}</td>
                  <td><b>{s.nameBn || s.name || ''}</b><br /><span className="muted">{s.nameEn || ''}</span></td>
                  <td>{s.father}</td>
                  <td>{s.mother}</td>
                  <td>{s.class}</td>
                  <td>{s.blood || '—'}</td>
                  <td>{s.guardian}</td>
                  <td>{s.guardianMobile}</td>
                  <td>{money(s.due)}</td>
                  <td>
                    <button className="btn small" onClick={() => printStudentCard(s)}>ID Card</button>{' '}
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
