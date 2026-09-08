import React, { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api.js'

export default function WhatsAppConnect () {
  const [status, setStatus] = useState('loading')
  const [number, setNumber] = useState(null)
  const [qr, setQr] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const pollRef = useRef(null)

  async function refreshStatus () {
    try {
      const data = await api.get('/whatsapp/status')
      setNumber(data.number || null)
      setStatus(data.connected ? 'connected' : 'disconnected')
      return data.connected
    } catch {
      setStatus('unreachable')
      return false
    }
  }

  useEffect(() => {
    refreshStatus()
    return () => clearInterval(pollRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function startConnect () {
    setConnecting(true)
    setQr(null)
    pollRef.current = setInterval(async () => {
      try {
        const data = await api.get('/whatsapp/qr')
        if (data.connected) {
          clearInterval(pollRef.current)
          setConnecting(false)
          setQr(null)
          setStatus('connected')
          setNumber(data.number || null)
        } else if (data.qrDataUrl) {
          setQr(data.qrDataUrl)
        }
      } catch {
        clearInterval(pollRef.current)
        setConnecting(false)
        setStatus('unreachable')
      }
    }, 3000)
  }

  function cancelConnect () {
    clearInterval(pollRef.current)
    setConnecting(false)
    setQr(null)
  }

  async function disconnect () {
    if (
      !confirm(
        'WhatsApp সংযোগ বিচ্ছিন্ন করতে চান? পরে আবার নতুন করে QR স্ক্যান করতে হবে।'
      )
    )
      return
    try {
      await api.post('/whatsapp/logout')
      setStatus('disconnected')
      setNumber(null)
    } catch (err) {
      alert('সংযোগ বিচ্ছিন্ন করা যায়নি: ' + err.message)
    }
  }

  if (status === 'loading')
    return <p className='muted'>WhatsApp সংযোগের অবস্থা দেখা হচ্ছে…</p>

  if (status === 'unreachable') {
    return (
      <div>
        <p style={{ color: 'var(--primary)' }}>
          ⚠️ WhatsApp বট-এর সাথে যোগাযোগ করা যাচ্ছে না। বট ডিপ্লয় করা আছে কিনা
          এবং
          <code> WHATSAPP_BOT_URL</code>/<code>WHATSAPP_BOT_SECRET</code>{' '}
          ঠিকভাবে বসানো আছে কিনা দেখুন।
        </p>
        <button className='btn' onClick={refreshStatus}>
          🔄 আবার চেষ্টা করুন
        </button>
      </div>
    )
  }

  if (status === 'connected') {
    return (
      <div>
        <p style={{ color: 'var(--success)' }}>
          ✅ সংযুক্ত{number ? ` — নম্বর: ${number}` : ''}
        </p>
        <button className='btn warning' onClick={disconnect}>
          🔌 সংযোগ বিচ্ছিন্ন করুন (নতুন নম্বর যোগ করতে)
        </button>
      </div>
    )
  }

  return (
    <div>
      <p className='muted'>এখনো কোনো WhatsApp নম্বর যোগ করা হয়নি।</p>
      {!connecting && (
        <button className='btn primary' onClick={startConnect}>
          🔗 WhatsApp সংযোগ করুন
        </button>
      )}
      {connecting && (
        <div>
          {qr ? (
            <>
              <p>স্কুলের WhatsApp দিয়ে এই QR কোডটা স্ক্যান করুন:</p>
              <p className='muted'>
                WhatsApp খুলুন → Settings → Linked Devices → Link a Device
              </p>
              <img
                src={qr}
                alt='WhatsApp QR'
                style={{
                  width: 240,
                  height: 240,
                  border: '1px solid var(--border)',
                  borderRadius: 12
                }}
              />
            </>
          ) : (
            <p className='muted'>QR তৈরি হচ্ছে…</p>
          )}
          <div className='actions'>
            <button className='btn' onClick={cancelConnect}>
              বাতিল করুন
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
