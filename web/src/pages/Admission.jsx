import React, { useRef, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import { fileToDataUri } from '../lib/helpers.js';
import { printStudentCard } from '../lib/print.js';

export default function Admission() {
  const { add } = useData();
  const formRef = useRef(null);
  const [studentPhoto, setStudentPhoto] = useState('');
  const [guardianIdPhoto, setGuardianIdPhoto] = useState('');
  const [busy, setBusy] = useState(false);

  async function handlePreview(e, setter) {
    const file = e.target.files?.[0];
    if (file) setter(await fileToDataUri(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData(e.target);
      const photo = fd.get('photo')?.name ? await fileToDataUri(fd.get('photo')) : '';
      const guardianId = fd.get('guardianId')?.name ? await fileToDataUri(fd.get('guardianId')) : '';
      const st = Object.fromEntries(fd.entries());
      delete st.photo;
      delete st.guardianId;
      st.name = st.nameBn || st.nameEn;
      st.photo = photo;
      st.guardianId = guardianId;
      st.due = 0;
      st.verified = false;

      const saved = await add('Students', st);
      e.target.reset();
      setStudentPhoto('');
      setGuardianIdPhoto('');
      alert('ভর্তি সংরক্ষণ হয়েছে। Student ID: ' + saved.id);
      printStudentCard(saved);
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
          <h3>নতুন ছাত্র-ছাত্রী ভর্তি / Registration Form</h3>
          <span className="muted">শ্রেণী: প্লে থেকে অষ্টম</span>
        </div>
        <form ref={formRef} onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field"><label>ছাত্র/ছাত্রীর নাম (বাংলা) *</label><input name="nameBn" required /></div>
            <div className="field"><label>ছাত্র/ছাত্রীর নাম (English) *</label><input name="nameEn" required /></div>
            <div className="field"><label>লিঙ্গ</label><select name="gender"><option>ছাত্র</option><option>ছাত্রী</option></select></div>
            <div className="field"><label>জন্ম তারিখ</label><input name="dob" type="date" /></div>
            <div className="field">
              <label>শ্রেণী *</label>
              <select name="class">
                {['প্লে', 'নার্সারি', 'কেজি', 'প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম', 'ষষ্ঠ', 'সপ্তম', 'অষ্টম'].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Blood Group</label>
              <select name="blood">
                <option value="">নির্বাচন করুন</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="field"><label>Student Photo</label><input name="photo" type="file" accept="image/*" onChange={(e) => handlePreview(e, setStudentPhoto)} /></div>
            <div className="field"><label>পিতার নাম *</label><input name="father" required /></div>
            <div className="field"><label>মাতার নাম *</label><input name="mother" required /></div>
            <div className="field"><label>অভিভাবকের নাম</label><input name="guardian" /></div>
            <div className="field"><label>অভিভাবকের NID কার্ড নম্বর *</label><input name="guardianNid" inputMode="numeric" required placeholder="NID নম্বর" /></div>
            <div className="field"><label>অভিভাবকের মোবাইল *</label><input name="guardianMobile" required /></div>
            <div className="field"><label>অভিভাবকের আয়ের উৎস</label><input name="incomeSource" placeholder="চাকরি/ব্যবসা/কৃষি..." /></div>
            <div className="field"><label>মাসিক বেতন দিতে পারবেন?</label><select name="canPay"><option>হ্যাঁ</option><option>না</option><option>যাচাই প্রয়োজন</option></select></div>
            <div className="field"><label>অভিভাবকের ID Card Photo</label><input name="guardianId" type="file" accept="image/*" onChange={(e) => handlePreview(e, setGuardianIdPhoto)} /></div>
            <div className="field"><label>ঠিকানা</label><input name="address" /></div>
            <div className="field"><label>ভর্তি তারিখ</label><input name="admissionDate" type="date" /></div>
            <div className="field"><label>ভর্তি ফি</label><input name="admissionFee" type="number" min="0" defaultValue={0} /></div>
            <div className="field"><label>পুনঃভর্তি ফি</label><input name="renewFee" type="number" min="0" defaultValue={0} /></div>
            <div className="field"><label>ভর্তি ফরম ফি</label><input name="formFee" type="number" min="0" defaultValue={0} /></div>
            <div className="field full"><label>নোট / যাচাই মন্তব্য</label><textarea name="note" /></div>
            <div className="field"><label>Student Photo Preview</label>{studentPhoto && <img src={studentPhoto} className="photo-preview" alt="" />}</div>
            <div className="field"><label>Guardian ID Preview</label>{guardianIdPhoto && <img src={guardianIdPhoto} className="photo-preview" alt="" />}</div>
          </div>
          <div className="actions">
            <button className="btn primary" type="submit" disabled={busy}>{busy ? 'সংরক্ষণ হচ্ছে…' : '💾 ভর্তি সংরক্ষণ + ID তৈরি'}</button>
            <button className="btn" type="reset" onClick={() => { setStudentPhoto(''); setGuardianIdPhoto(''); }}>Reset</button>
          </div>
        </form>
      </div>
    </section>
  );
}
