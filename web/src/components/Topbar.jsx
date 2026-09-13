import React, { useEffect, useRef, useState } from 'react'
import { LOGO } from '../assets/logo.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatHeaderDate, formatHeaderTime } from '../lib/helpers.js'
import AdminRegModal from './AdminRegModal.jsx'

export default function Topbar ({ onMenuToggle }) {
  const { admin, logout } = useAuth()
  const [now, setNow] = useState(new Date())
  const [menuOpen, setMenuOpen] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    function onOutsideClick (e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false)
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  return (
    <div className='topbar'>
      <div className='topbar-left'>
        <button
          className='topbar-menu'
          type='button'
          aria-label='Menu'
          onClick={onMenuToggle}
        >
          ☰
        </button>
        <img
          className='topbar-logo'
          src={LOGO}
          alt='শিশু কানন মডেল একাডেমি Logo'
        />
        <div className='school-head'>
          <div className='bn'>শিশু কানন মডেল একাডেমি</div>
          <div className='addr'>মিরওয়ারিশপুর, বেগমগঞ্জ, নোয়াখালী</div>
        </div>
      </div>
      <div className='topbar-right'>
        <div className='date-chip'>
          <span className='cal'>▣</span>
          <div>
            <b>{formatHeaderDate(now)}</b>
            <br />
            <span>{formatHeaderTime(now)}</span>
          </div>
        </div>
        <div
          className='account-chip'
          ref={menuRef}
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setMenuOpen(v => !v)}
        >
          <div className='account-text'>
            <b>{admin?.username}</b>
            <br />
            <span>Administrator</span>
          </div>
          <div className='avatar'>
            {admin?.photo ? (
              <img
                src={admin.photo}
                alt=''
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              '👤'
            )}
          </div>
          <span>⌄</span>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                background: '#fff',
                border: '1px solid var(--border)',
                borderRadius: 10,
                boxShadow: '0 8px 24px #0002',
                minWidth: 200,
                zIndex: 50,
                overflow: 'hidden'
              }}
            >
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  setShowPasswordModal(true)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  border: 0,
                  background: 'none',
                  cursor: 'pointer'
                }}
              >
                🔑 পাসওয়ার্ড / নাম পরিবর্তন
              </button>
              <button
                type='button'
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  logout()
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  border: 0,
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--primary)'
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {showPasswordModal && (
        <AdminRegModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  )
}
