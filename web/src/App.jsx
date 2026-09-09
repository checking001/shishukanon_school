import React, { useEffect, useState } from 'react'
import { LOGO } from './assets/logo.js'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { DataProvider } from './context/DataContext.jsx'
import Login from './pages/Login.jsx'
import AdminRegModal from './components/AdminRegModal.jsx'
import ReportPassModal, {
  isReportsUnlocked
} from './components/ReportPassModal.jsx'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Admission from './pages/Admission.jsx'
import Students from './pages/Students.jsx'
import Verification from './pages/Verification.jsx'
import Fees from './pages/Fees.jsx'
import Attendance from './pages/Attendance.jsx'
import Teachers from './pages/Teachers.jsx'
import TeacherSalary from './pages/TeacherSalary.jsx'
import EmployeeSalary from './pages/EmployeeSalary.jsx'
import Expenses from './pages/Expenses.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'

const PAGES = {
  dashboard: Dashboard,
  admission: Admission,
  students: Students,
  verification: Verification,
  fees: Fees,
  attendance: Attendance,
  teachers: Teachers,
  teacherSalary: TeacherSalary,
  employeeSalary: EmployeeSalary,
  expenses: Expenses,
  reports: Reports,
  settings: Settings
}

// মোবাইলে নিচের bottom navigation bar — অরিজিনালের .mobile-nav-এর হুবহু ৫টা বাটন।
const MOBILE_NAV_ITEMS = [
  ['dashboard', '🏠', 'Home'],
  ['admission', '👨\u200d🎓', 'ভর্তি'],
  ['fees', '💰', 'ফি'],
  ['attendance', '🕘', 'উপস্থিতি'],
  ['reports', '📊', 'রিপোর্ট']
]

function AppShell () {
  const [page, setPage] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [reportsUnlocked, setReportsUnlocked] = useState(isReportsUnlocked)
  const [showReportGate, setShowReportGate] = useState(false)

  function navigate (id) {
    if (id === 'reports' && !reportsUnlocked && !isReportsUnlocked()) {
      setShowReportGate(true)
      return
    }
    setPage(id)
    setMobileOpen(false)
  }

  const Page = PAGES[page] || Dashboard

  return (
    <DataProvider>
      <div className='app' style={{ display: 'block' }}>
        <Sidebar page={page} onNavigate={navigate} mobileOpen={mobileOpen} />
        <main className='main'>
          <Topbar onMenuToggle={() => setMobileOpen(v => !v)} />
          <Page onNavigate={navigate} />
          <footer
            className='no-print'
            style={{
              marginTop: 18,
              padding: 12,
              textAlign: 'center',
              color: '#667085',
              fontSize: 12,
              borderTop: '1px solid #e7ebf0'
            }}
          >
            © 2026 শিশু কানন মডেল একাডেমি | মিরওয়ারিশপুর, বেগমগঞ্জ, নোয়াখালী |
            Developed by shishu kanon (Shamim & Faysal)
          </footer>
        </main>
      </div>
      <div className='mobile-nav'>
        {MOBILE_NAV_ITEMS.map(([id, icon, label]) => (
          <button key={id} onClick={() => navigate(id)}>
            {icon}
            <br />
            {label}
          </button>
        ))}
      </div>
      {showReportGate && (
        <ReportPassModal
          onClose={() => setShowReportGate(false)}
          onUnlock={() => {
            setReportsUnlocked(true)
            setShowReportGate(false)
            setPage('reports')
          }}
        />
      )}
    </DataProvider>
  )
}

function Root () {
  const { admin } = useAuth()
  const [showAdminReg, setShowAdminReg] = useState(false)

  // অরিজিনাল ফাইলে body:after-এর ব্যাকগ্রাউন্ড প্যাটার্নে এই লোগোটাই বসানো ছিল —
  // এখন একটাই কপি থেকে CSS ভ্যারিয়েবলের মাধ্যমে সেট করা হচ্ছে।
  useEffect(() => {
    document.documentElement.style.setProperty('--logo-bg', `url("${LOGO}")`)
  }, [])

  if (!admin) {
    return (
      <>
        <Login onOpenAdminReg={() => setShowAdminReg(true)} />
        {showAdminReg && (
          <AdminRegModal onClose={() => setShowAdminReg(false)} />
        )}
      </>
    )
  }
  return <AppShell />
}

export default function App () {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
