import React, { useState } from 'react'
import { useData } from '../context/DataContext.jsx'
import { exportAllExcel } from '../lib/helpers.js'
import WhatsAppConnect from '../components/WhatsAppConnect.jsx'

const NKEY = 'sk_notify_settings'

function loadSaved () {
  try {
    return JSON.parse(localStorage.getItem(NKEY) || '{}')
  } catch {
    return {}
  }
}

export default function Settings () {
  const data = useData()
  const [form, setForm] = useState(loadSaved)

  function set (field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  function save () {
    localStorage.setItem(NKEY, JSON.stringify(form))
    alert('Notification settings saved.')
  }

  function reload () {
    setForm(loadSaved())
  }

  return (
    <section className='page active'>
      <div className='card'>
        <h3>School & Notification Settings</h3>
        <p>
          <b>প্রতিষ্ঠান:</b> শিশু কানন মডেল একাডেমি
        </p>
        <p>
          <b>ঠিকানা:</b> মিরওয়ারিশপুর, বেগমগঞ্জ, নোয়াখালী
        </p>
        <hr />
        <h3>📱 WhatsApp সংযোগ</h3>
        <WhatsAppConnect />
        <hr />
        <h3>⚙️ WhatsApp / SMS API (অতিরিক্ত, সাধারণত দরকার হয় না)</h3>
        <div className='api-grid'>
          <div className='field'>
            <label>WhatsApp API Endpoint</label>
            <input
              value={form.waEndpoint || ''}
              onChange={set('waEndpoint')}
              placeholder='https://your-server.example/api/whatsapp'
            />
          </div>
          <div className='field'>
            <label>WhatsApp API Token</label>
            <input
              type='password'
              value={form.waToken || ''}
              onChange={set('waToken')}
              placeholder='Server-side token'
            />
          </div>
          <div className='field'>
            <label>SMS API Endpoint</label>
            <input
              value={form.smsEndpoint || ''}
              onChange={set('smsEndpoint')}
              placeholder='https://your-server.example/api/sms'
            />
          </div>
          <div className='field'>
            <label>SMS API Key</label>
            <input
              type='password'
              value={form.smsKey || ''}
              onChange={set('smsKey')}
              placeholder='Server-side API key'
            />
          </div>
          <div className='field'>
            <label>WhatsApp From</label>
            <input
              value={form.waFrom || ''}
              onChange={set('waFrom')}
              placeholder='Business number / Phone ID'
            />
          </div>
          <div className='field'>
            <label>SMS From</label>
            <input
              value={form.smsFrom || ''}
              onChange={set('smsFrom')}
              placeholder='Sender ID'
            />
          </div>
        </div>
        <div className='actions'>
          <button className='btn primary' onClick={save}>
            💾 Notification Settings Save
          </button>
          <button className='btn' onClick={reload}>
            Reload
          </button>
        </div>
        <p className='muted'>
          WhatsApp Auto Send এখন স্কুলের নিজস্ব built-in বট ব্যবহার করে — উপরের
          WhatsApp Endpoint/Token ছাড়াই কাজ করে। SMS Auto Send এখনো একটা
          backend endpoint চায়; দিলে সেটাই ব্যবহার হবে, না দিলে Attendance
          পেজের &quot;SMS&quot; বাটন মোবাইলের নিজের SMS অ্যাপ খুলে দেবে।
        </p>
        <hr />
        <h3>📥 Excel Data</h3>
        <p className='muted'>
          ভর্তি, ছাত্র-ছাত্রী, guardian, fee, attendance, teacher, salary ও
          expenses আলাদা worksheet-এ Excel ফাইলে সংরক্ষণ হবে।
        </p>
        <button className='btn success' onClick={() => exportAllExcel(data)}>
          📥 সব ডাটা Excel-এ Export
        </button>
      </div>
    </section>
  )
}
