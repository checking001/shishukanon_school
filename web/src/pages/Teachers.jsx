import React, { useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { fileToDataUri, money } from '../lib/helpers.js';
import { printTeacherCard } from '../lib/print.js';

const TEACHER_ROLES = ['শিক্ষক', 'শিক্ষিকা'];
const EMPLOYEE_ROLES = ['কর্মচারী', 'অফিস সহকারী', 'আয়া', 'নিরাপত্তাকর্মী', 'অন্যান্য'];

function StaffForm({ kind, title, subtitle, roles }) {
  const { add } = useData();
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData(e.target);
      const photoFile = fd.get('photo');
      const idcardFile = fd.get('idcard');
      const certFile = fd.get('certificate');
      const o = Object.fromEntries(fd.entries());
      o.type = kind;
      o.photo = photoFile?.name ? await fileToDataUri(photoFile) : '';
      o.idcard = idcardFile?.name ? await fileToDataUri(idcardFile) : '';
      o.certificate = certFile?.name ? await fileToDataUri(certFile) : '';

      const saved = await add('Teachers', o);
      e.target.reset();
      setPreview('');
      alert((kind === 'teacher' ? 'শিক্ষক' : 'কর্মচারী') + ' সংরক্ষণ হয়েছে। ID: ' + saved.id);
      printTeacherCard(saved);
    } catch (err) {
      alert('সংরক্ষণ ব্যর্থ: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" style={kind === 'employee' ? { marginTop: 16 } : undefined}>
      <div className="section-title"><h3>{title}</h3><span className="muted">{subtitle}</span></div>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field"><label>{kind === 'teacher' ? 'শিক্ষক/শিক্ষিকার নাম *' : 'কর্মচারীর নাম *'}</label><input name="name" required /></div>
          <div className="field"><label>পদবি</label><select name="role">{roles.map((r) => <option key={r}>{r}</option>)}</select></div>
          <div className="field"><label>মোবাইল</label><input name="mobile" /></div>
          <div className="field"><label>এনআইডি কার্ডের নাম্বার *</label><input name="nid" inputMode="numeric" autoComplete="off" placeholder="NID নম্বর লিখুন" required /></div>
          <div className="field"><label>ঠিকানা</label><input name="address" /></div>
          <div className="field"><label>যোগদানের তারিখ</label><input name="joinDate" type="date" /></div>
          <div className="field"><label>বেতন</label><input name="salary" type="number" defaultValue={0} /></div>
          <div className="field"><label>ছবি</label>
            <input name="photo" type="file" accept="image/*" onChange={async (e) => {
              const f = e.target.files?.[0]; if (f) setPreview(await fileToDataUri(f));
            }} />
          </div>
          <div className="field"><label>ID Card / NID Photo</label><input name="idcard" type="file" accept="image/*" /></div>
          <div className="field"><label>সনদ / Certificate</label><input name="certificate" type="file" accept=".pdf,image/*" /></div>
          <div className="field"><label>Photo Preview</label>{preview && <img src={preview} className="photo-preview" alt="" />}</div>
        </div>
        <div className="actions">
          <button className="btn primary" type="submit" disabled={saving}>
            {saving ? 'সংরক্ষণ হচ্ছে…' : `💾 ${kind === 'teacher' ? 'শিক্ষক' : 'কর্মচারী'} সংরক্ষণ + ID Card`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Teachers() {
  const { Teachers, update, remove } = useData();

  async function editStaff(t) {
    const name = prompt('নাম:', t.name); if (name === null) return;
    const role = prompt('পদবি:', t.role || ''); if (role === null) return;
    const mobile = prompt('মোবাইল:', t.mobile || ''); if (mobile === null) return;
    const nid = prompt('এনআইডি নম্বর:', t.nid || ''); if (nid === null) return;
    const address = prompt('ঠিকানা:', t.address || ''); if (address === null) return;
    const salary = prompt('বেতন:', t.salary || '0'); if (salary === null) return;
    try {
      await update('Teachers', t.id, { name: name.trim(), role: role.trim(), mobile: mobile.trim(), nid: nid.trim(), address: address.trim(), salary });
      alert('তথ্য Edit ও সংরক্ষণ হয়েছে।');
    } catch (err) {
      alert('আপডেট ব্যর্থ: ' + err.message);
    }
  }

  async function deleteStaff(t) {
    if (!confirm(`আপনি কি ${t.name} (${t.id})-কে মুছে ফেলতে চান?`)) return;
    try {
      await remove('Teachers', t.id);
      alert('ID ও সংশ্লিষ্ট তথ্য Delete করা হয়েছে।');
    } catch (err) {
      alert('মুছে ফেলা যায়নি: ' + err.message);
    }
  }

  return (
    <section className="page active">
      <StaffForm kind="teacher" title="নতুন শিক্ষক যোগদানের ফরম" subtitle="শিক্ষক ও শিক্ষিকার জন্য আলাদা ফরম" roles={TEACHER_ROLES} />
      <StaffForm kind="employee" title="নতুন কর্মচারী যোগদানের ফরম" subtitle="কর্মচারীর জন্য আলাদা ফরম" roles={EMPLOYEE_ROLES} />

      <div className="card" style={{ marginTop: 16 }}>
        <div className="section-title"><h3>Teacher / Employee List</h3><span className="muted">✏️ Edit / 🗑️ Delete</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>ছবি</th><th>ID</th><th>নাম</th><th>ধরন</th><th>পদবি</th><th>মোবাইল</th><th>NID</th><th>বেতন</th><th>Action</th></tr></thead>
            <tbody>
              {Teachers.length === 0 && <tr><td colSpan={9}>কোনো শিক্ষক/কর্মচারী নেই</td></tr>}
              {Teachers.map((t) => (
                <tr key={t.id}>
                  <td>{t.photo ? <img src={t.photo} className="photo-preview" alt="" /> : '—'}</td>
                  <td>{t.id}</td>
                  <td>{t.name}</td>
                  <td>{t.type === 'employee' ? 'কর্মচারী' : 'শিক্ষক'}</td>
                  <td>{t.role}</td>
                  <td>{t.mobile}</td>
                  <td>{t.nid}</td>
                  <td>{money(t.salary)}</td>
                  <td>
                    <button className="btn small" onClick={() => printTeacherCard(t)}>ID Card</button>{' '}
                    <button className="btn small warning" onClick={() => editStaff(t)}>✏️ Edit</button>{' '}
                    <button className="btn small danger" onClick={() => deleteStaff(t)}>🗑️ Delete</button>
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
