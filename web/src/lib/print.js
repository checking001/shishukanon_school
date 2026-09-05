import { LOGO } from '../assets/logo.js';
import { money, escapeHtml } from './helpers.js';

function openWin(html) {
  const w = window.open('', '_blank');
  if (!w) { alert('Print window blocked। Browser-এ Pop-up Allow করুন।'); return null; }
  w.document.write(html);
  w.document.close();
  return w;
}

export function printStudentCard(s) {
  openWin(`<html><head><title>Student ID Card</title><style>body{font-family:Arial;padding:30px}.id{width:350px;border:2px solid #111;border-radius:14px;overflow:hidden}.h{background:#d71920;color:white;text-align:center;padding:12px}.b{padding:15px;display:flex;gap:12px}.b img{width:90px;height:110px;object-fit:cover;border:1px solid #111}.b p{font-size:12px;margin:5px 0}</style></head><body><div class="id"><div class="h"><img src="${LOGO}" style="width:58px;height:58px;object-fit:contain;background:#fff;border-radius:50%;display:block;margin:0 auto 6px"><b>শিশু কানন মডেল একাডেমি</b><br>Student ID Card</div><div class="b"><img src="${s.photo || ''}"><div><p><b>ID:</b> ${s.id}</p><p><b>নাম (বাংলা):</b> ${s.nameBn || s.name}</p><p><b>Name (English):</b> ${s.nameEn || ''}</p><p><b>পিতা:</b> ${s.father}</p><p><b>মাতা:</b> ${s.mother}</p><p><b>শ্রেণী:</b> ${s.class}</p><p><b>Blood:</b> ${s.blood || '—'}</p><p><b>Guardian:</b> ${s.guardianMobile}</p><p><b>Guardian NID:</b> ${s.guardianNid || ''}</p></div></div></div><script>window.print()<\/script></body></html>`);
}

export function printTeacherCard(t) {
  const isEmployee = t.type === 'employee';
  const title = isEmployee ? 'Employees ID Card' : 'Teacher ID Card';
  openWin(`<!doctype html><html><head><meta charset="UTF-8"><title>${title}</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f4f6;font-family:Arial,"Noto Sans Bengali",sans-serif;display:flex;justify-content:center;align-items:flex-start;padding:30px}.card{width:360px;border:2px solid #d71920;border-radius:16px;background:#fff;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,.12)}.head{text-align:center;padding:14px 12px 10px;background:#fff}.logo{width:70px;height:70px;object-fit:contain;display:block;margin:0 auto 7px}.school{font-size:18px;font-weight:800;color:#c5161d}.addr{font-size:12px;margin-top:3px;color:#333}.type{margin-top:10px;display:inline-block;background:#d71920;color:#fff;padding:6px 18px;border-radius:999px;font-weight:800;font-size:15px}.body{padding:15px;display:flex;gap:14px;align-items:center}.photo{width:100px;height:120px;object-fit:cover;border:2px solid #d71920;border-radius:8px;background:#eee}.info{font-size:13px;line-height:1.7}.info b{display:inline-block;min-width:55px}.foot{text-align:center;background:#f8f8f8;padding:9px;font-size:11px;color:#555;border-top:1px solid #eee}@media print{body{padding:0;background:#fff}.card{box-shadow:none}}</style></head><body><div class="card"><div class="head"><img class="logo" src="${LOGO}"><div class="school">শিশু কানন মডেল একাডেমি</div><div class="addr">মিরওয়ারিশপুর, বেগমগঞ্জ, নোয়াখালী</div><div class="type">${title}</div></div><div class="body"><img class="photo" src="${t.photo || LOGO}"><div class="info"><div><b>ID:</b> ${t.id}</div><div><b>নাম:</b> ${t.name || ''}</div><div><b>পদবি:</b> ${t.role || ''}</div><div><b>মোবাইল:</b> ${t.mobile || ''}</div></div></div><div class="foot">${title}</div></div><script>window.onload=function(){setTimeout(function(){window.print()},350)}<\/script></body></html>`);
}

const FEE_ROWS = [
  ['মাসিক বেতন', 'monthly'], ['নতুন/পুনঃ ভর্তি', 'newRenew'], ['ভর্তি ফরম', 'form'],
  ['অগ্রিম/বকেয়া', 'due'], ['পরীক্ষা', 'exam'], ['MCT', 'mct'], ['সেমিস্টার', 'semester'],
  ['বই', 'books'], ['Transport', 'transport'], ['Stationery', 'stationery'],
  ['প্রশংসা পত্র', 'certificate'], ['অন্যান্য', 'other'],
];

export function receiptHTML(o) {
  const rows = FEE_ROWS.filter(([, k]) => Number(o[k] || 0) > 0)
    .map(([label, k]) => `<tr><td>${label}</td><td>${money(o[k])}</td></tr>`).join('');
  return `<div class="receipt"><img class="receipt-logo" src="${LOGO}"><h2>শিশু কানন মডেল একাডেমি</h2><p style="text-align:center">মিরওয়ারিশপুর, বেগমগঞ্জ, নোয়াখালী</p><hr><p><b>রসিদ নং:</b> ${o.receipt} &nbsp; <b>তারিখ:</b> ${o.date || ''}</p><p><b>Student ID:</b> ${o.studentId} &nbsp; <b>নাম:</b> ${o.studentName || ''}</p><table><tr><th>ফি</th><th>Amount</th></tr>${rows}</table><p><b>Payment:</b> ${o.method}</p><div class="receipt-total">সর্বমোট: ${money(o.total)}</div><p style="margin-top:35px">গ্রহণকারীর স্বাক্ষর: __________________</p></div>`;
}

export function printFeeReceipt(o) {
  const w = window.open('', '_blank', 'width=850,height=900');
  if (!w) { alert('Print window blocked. Browser-এ Pop-up Allow করুন।'); return; }
  w.document.write(`<html><head><title>Fee Receipt ${o.receipt}</title><style>body{font-family:"Noto Sans Bengali",Arial,sans-serif;padding:25px}.receipt{max-width:760px;margin:auto}.receipt-logo{width:95px;height:95px;object-fit:contain;display:block;margin:0 auto 5px}.receipt h2{text-align:center;margin:4px}.receipt p{text-align:left}.receipt table{width:100%;border-collapse:collapse}.receipt th,.receipt td{border:1px solid #111;padding:8px}.receipt-total{font-size:24px;font-weight:800;text-align:right;margin-top:12px}@media print{body{padding:0}}</style></head><body>${receiptHTML(o)}<script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script></body></html>`);
  w.document.close();
}

export function salaryReceiptHTML(o) {
  return `<div class="salary-receipt" id="salaryReceiptPrintable"><div class="salary-school-head"><img class="salary-receipt-logo" src="${LOGO}"><h2 style="margin:4px 0">শিশু কানন মডেল একাডেমি</h2><div>মিরওয়ারিশপুর, বেগমগঞ্জ, নোয়াখালী</div><h3 style="margin:12px 0">${o.staffType === 'employee' ? 'কর্মচারীর বেতন গ্রহণ রশিদ' : 'শিক্ষকের বেতন গ্রহণ রশিদ'}</h3></div><hr><p><b>রশিদ নং:</b> ${o.receipt} &nbsp;&nbsp; <b>তারিখ:</b> ${o.date}</p><p><b>${o.staffType === 'employee' ? 'কর্মচারী ID' : 'শিক্ষক ID'}:</b> ${o.teacherId}</p><p><b>নাম:</b> ${o.teacherName || ''} &nbsp;&nbsp; <b>পদবি:</b> ${o.role || ''}</p><p><b>বেতন মাস:</b> ${o.month || ''}</p><table><tr><th>বিবরণ</th><th>পরিমাণ</th></tr><tr><td>${escapeHtml(o.note || 'মাসিক বেতন')}</td><td>${money(o.amount)}</td></tr></table><p><b>Payment Method:</b> ${o.method}</p><div class="total">সর্বমোট: ${money(o.amount)}</div><p style="margin-top:45px">গ্রহণকারীর স্বাক্ষর: ____________________</p></div>`;
}

export function printSalaryReceipt() {
  document.body.classList.add('salary-print-mode');
  setTimeout(() => {
    window.print();
    setTimeout(() => document.body.classList.remove('salary-print-mode'), 500);
  }, 100);
}

export function downloadSalaryPDF(o) {
  if (!window.jspdf) { alert('PDF library load হয়নি। PDF তৈরি করতে Internet connection চালু রাখুন।'); return; }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const img = new Image();
  img.onload = () => {
    pdf.addImage(img, 'JPEG', 90, 10, 30, 30);
    pdf.setFontSize(16);
    pdf.text('Shishu Kanon Model Academy', 105, 48, { align: 'center' });
    pdf.setFontSize(11);
    pdf.text('Mirwarishpur, Begumganj, Noakhali', 105, 56, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('Teacher / Employee Salary Receipt', 105, 70, { align: 'center' });
    pdf.line(15, 76, 195, 76);
    pdf.setFontSize(11);
    let y = 89;
    [
      'Receipt No: ' + o.receipt, 'Date: ' + o.date, 'Teacher/Employee ID: ' + o.teacherId,
      'Name: ' + (o.teacherName || ''), 'Designation: ' + (o.role || ''), 'Salary Month: ' + (o.month || ''),
      'Payment Method: ' + o.method, 'Description: ' + (o.note || 'Monthly Salary'), 'TOTAL AMOUNT: ' + money(o.amount),
    ].forEach((t) => { pdf.text(String(t), 20, y); y += 10; });
    pdf.line(15, y + 3, 195, y + 3);
    pdf.text('Receiver Signature: ______________________________', 20, y + 18);
    pdf.save((o.receipt || 'salary-receipt') + '.pdf');
  };
  img.onerror = () => alert('স্কুলের Logo PDF-এ লোড করা যায়নি।');
  img.src = LOGO;
}
