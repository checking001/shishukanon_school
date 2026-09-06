export function money (n) {
  return '৳' + Number(n || 0).toLocaleString('bn-BD')
}

export function genId (prefix) {
  return prefix + Date.now().toString().slice(-6)
}

export function fileToDataUri (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
// ছবি resize + compress করে ছোট JPEG data URI বানায়, সরাসরি Google Sheet-এর
// ঘরে রাখার জন্য। Drive ব্যবহার করা হচ্ছে না কারণ Service Account-এর নিজস্ব
// storage quota নেই (personal Gmail-এ এটা Google-এরই সীমাবদ্ধতা)।
export function compressImage (
  file,
  { maxWidth = 220, maxHeight = 260, quality = 0.7 } = {}
) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img
        const scale = Math.min(maxWidth / width, maxHeight / height, 1)
        width = Math.max(1, Math.round(width * scale))
        height = Math.max(1, Math.round(height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export function defaultMessage (student, status, dateStr) {
  const name = student?.name || student?.nameBn || student?.nameEn || ''
  if (status === 'অনুপস্থিত') {
    return `সম্মানিত অভিভাবক, ${name} আজ (${dateStr}) স্কুলে অনুপস্থিত ছিল। অনুগ্রহ করে অনুপস্থিতির কারণ স্কুল কর্তৃপক্ষকে জানান। — শিশু কানন মডেল একাডেমি`
  }
  if (status === 'উপস্থিত') {
    return `সম্মানিত অভিভাবক, ${name} আজ (${dateStr}) স্কুলে উপস্থিত হয়েছে। ধন্যবাদ। — শিশু কানন মডেল একাডেমি`
  }
  if (status === 'দেরি') {
    return `সম্মানিত অভিভাবক, ${name} আজ (${dateStr}) স্কুলে দেরিতে উপস্থিত হয়েছে। — শিশু কানন মডেল একাডেমি`
  }
  return `সম্মানিত অভিভাবক, ${name} আজ (${dateStr}) ছুটিতে আছে। — শিশু কানন মডেল একাডেমি`
}

export function formatHeaderDate (now = new Date()) {
  return new Intl.DateTimeFormat('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(now)
}
export function formatHeaderTime (now = new Date()) {
  return new Intl.DateTimeFormat('bn-BD', {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(now)
}

export function todayISO () {
  return new Date().toISOString().slice(0, 10)
}

export function escapeHtml (x) {
  return String(x || '').replace(
    /[&<>"']/g,
    m =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[
        m
      ])
  )
}

// অরিজিনালের salaryIsType()-এর সমতুল্য — staffType ফিল্ড না থাকলে ID-এর prefix
// (TC-/EMP-) দিয়ে অনুমান করে, পুরনো রেকর্ডের সাথে সামঞ্জস্য রাখার জন্য।
export function salaryIsType (x, type) {
  return (
    x.staffType === type ||
    (!x.staffType &&
      String(x.teacherId || '').startsWith(type === 'teacher' ? 'TC-' : 'EMP-'))
  )
}

// Loaded via <script> tag in index.html (same CDN the original file used).
export function getXLSX () {
  return window.XLSX
}

// অরিজিনাল ফাইলের exportExcel()-এর হুবহু কলাম/শীট গঠন — প্রতিটা কালেকশন
// নিজের বাংলা কলাম-নাম সহ আলাদা শীটে, একটাই .xlsx ব্যাকআপ ফাইলে।
export function exportAllExcel (data) {
  const XLSX = getXLSX()
  if (!XLSX) {
    alert(
      'Excel library load হয়নি। Internet connection চালু করে আবার চেষ্টা করুন।'
    )
    return
  }
  const wb = XLSX.utils.book_new()
  const sheets = {
    'ভর্তি ও ছাত্র-ছাত্রী': (data.Students || []).map(s => ({
      Student_ID: s.id,
      নাম_বাংলা: s.nameBn || s.name,
      নাম_English: s.nameEn || '',
      লিঙ্গ: s.gender,
      জন্মতারিখ: s.dob,
      শ্রেণী: s.class,
      Blood_Group: s.blood,
      পিতার_নাম: s.father,
      মাতার_নাম: s.mother,
      অভিভাবক: s.guardian,
      Guardian_Mobile: s.guardianMobile,
      Guardian_NID: s.guardianNid,
      আয়ের_উৎস: s.incomeSource,
      মাসিক_বেতন_দিতে_পারবেন: s.canPay,
      ঠিকানা: s.address,
      ভর্তি_তারিখ: s.admissionDate,
      ভর্তি_ফি: s.admissionFee,
      পুনঃভর্তি_ফি: s.renewFee,
      ফরম_ফি: s.formFee,
      বকেয়া: s.due,
      Verified: s.verified ? 'হ্যাঁ' : 'না'
    })),
    'Fee Collection': data.Fees || [],
    Attendance: data.Attendance || [],
    'Teachers Employees': (data.Teachers || []).map(t => ({
      ID: t.id,
      নাম: t.name,
      পদবি: t.role,
      মোবাইল: t.mobile,
      ঠিকানা: t.address,
      যোগদানের_তারিখ: t.joinDate,
      বেতন: t.salary
    })),
    'Teacher Salary': (data.Salaries || []).filter(x =>
      salaryIsType(x, 'teacher')
    ),
    'Employee Salary': (data.Salaries || []).filter(x =>
      salaryIsType(x, 'employee')
    ),
    'Other Expenses': data.Expenses || []
  }
  Object.entries(sheets).forEach(([name, rows]) => {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(rows),
      name.slice(0, 31)
    )
  })
  XLSX.writeFile(wb, 'Shishu_Kanon_School_Data_' + todayISO() + '.xlsx')
}

function openPrintWindow (html, opts) {
  const w = window.open('', '_blank', opts || '')
  if (!w) {
    alert('Print window blocked. Browser-এ Pop-up Allow করুন।')
    return null
  }
  w.document.write(html)
  w.document.close()
  return w
}

export function reportStudents (students) {
  const rows = (students || [])
    .map(
      s =>
        `<tr><td>${s.id}</td><td>${s.nameBn || s.name || ''}<br>${
          s.nameEn || ''
        }</td><td>${s.father || ''}</td>` +
        `<td>${s.mother || ''}</td><td>${s.class}</td><td>${
          s.guardianMobile || ''
        }</td><td>${money(s.due)}</td></tr>`
    )
    .join('')
  openPrintWindow(
    '<html><body><h2>ছাত্র-ছাত্রী রিপোর্ট — শিশু কানন মডেল একাডেমি</h2>' +
      '<table border="1" cellpadding="7" cellspacing="0"><tr><th>ID</th><th>নাম</th><th>পিতা</th><th>মাতা</th>' +
      `<th>শ্রেণী</th><th>মোবাইল</th><th>বকেয়া</th></tr>${rows}</table><script>window.print()<\/script></body></html>`
  )
}

export function reportFees (fees) {
  const total = (fees || []).reduce((a, x) => a + Number(x.total || 0), 0)
  const rows = (fees || [])
    .map(
      x =>
        `<tr><td>${x.receipt}</td><td>${x.studentName || x.studentId}</td><td>${
          x.date || ''
        }</td>` + `<td>${x.method}</td><td>${money(x.total)}</td></tr>`
    )
    .join('')
  openPrintWindow(
    `<html><body><h2>Fee Report — শিশু কানন মডেল একাডেমি</h2><p>সর্বমোট গ্রহণ: <b>${money(
      total
    )}</b></p>` +
      `<table border="1" cellpadding="7"><tr><th>Receipt</th><th>Student</th><th>Date</th><th>Method</th><th>Total</th></tr>${rows}</table>` +
      '<script>window.print()</script></body></html>'
  )
}

export function reportFinance ({ Fees, Salaries, Expenses }) {
  const income = (Fees || []).reduce((a, x) => a + Number(x.total || 0), 0)
  const teacherSalary = (Salaries || [])
    .filter(x => salaryIsType(x, 'teacher'))
    .reduce((a, x) => a + Number(x.amount || 0), 0)
  const employeeSalary = (Salaries || [])
    .filter(x => salaryIsType(x, 'employee'))
    .reduce((a, x) => a + Number(x.amount || 0), 0)
  const expense = (Expenses || []).reduce(
    (a, x) => a + Number(x.amount || 0),
    0
  )
  const salary = teacherSalary + employeeSalary
  openPrintWindow(
    `<html><body><h2>Financial Report — শিশু কানন মডেল একাডেমি</h2><p>Fee Income: <b>${money(
      income
    )}</b></p>` +
      `<p>শিক্ষকের বেতন: <b>${money(
        teacherSalary
      )}</b></p><p>কর্মচারীর বেতন: <b>${money(employeeSalary)}</b></p>` +
      `<p>অন্যান্য খরচ: <b>${money(expense)}</b></p><p>Net: <b>${money(
        income - salary - expense
      )}</b></p>` +
      '<script>window.print()</script></body></html>'
  )
}
