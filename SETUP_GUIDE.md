# SETUP GUIDE — অংশ ১: Google Sheet Database সেটআপ

এই অংশ শেষ করলে আপনার অ্যাপ যেকোনো ডিভাইস থেকে লগইন করলেই একই ডেটা দেখাবে —
কারণ ডেটা আর ব্রাউজারে (localStorage) না থেকে একটা Google Sheet-এ কেন্দ্রীয়ভাবে থাকবে।

মোট ৪টা ধাপ:

1. Google Sheet তৈরি + ৭টা ট্যাব বসানো
2. Google Cloud-এ প্রজেক্ট + Sheets API + Drive API চালু করা
3. Service Account তৈরি করে JSON key নামানো
4. Sheet আর একটা Drive ফোল্ডার Service Account-এর সাথে শেয়ার করা

---

## ধাপ ১ — Google Sheet তৈরি করা

1. [sheets.google.com](https://sheets.google.com) এ যান, **Blank spreadsheet** থেকে নতুন একটা Sheet খুলুন।
2. উপরে বাম দিকে নাম দিন: **Shishu Kanon Database**
3. নিচে ট্যাব (শীট) থাকে — ডিফল্ট "Sheet1"-কে রিনেম করে, আর নতুন ৬টা ট্যাব যোগ করে
   মোট **৭টা ট্যাব** বানান (নিচের বাম কোণে **+** চিহ্নে ক্লিক করে যোগ করবেন, ট্যাবের নামের
   উপর ডাবল-ক্লিক করে রিনেম করবেন):

   - `Students`
   - `Teachers`
   - `Fees`
   - `Attendance`
   - `Expenses`
   - `Salaries`
   - `Admins`

4. **প্রতিটা ট্যাবের প্রথম সারিতে (Row 1)** নিচের হেডারগুলো হুবহু বসান — বানান/spelling
   একদম মিলতে হবে, নাহলে অ্যাপ সেই কলাম চিনবে না। প্রতিটা লাইন একটা করে সেলে বসবে,
   তাই A1 সেলে ক্লিক করে পুরো লাইনটা paste করলে Google Sheets নিজে থেকেই আলাদা
   কলামে ভাগ করে নেবে (Tab দিয়ে আলাদা করা আছে বলে)।

   **Students ট্যাব — A1 থেকে paste করুন:**

   ```
   id	nameBn	nameEn	name	gender	dob	class	blood	photo	father	mother	guardian	guardianNid	guardianMobile	incomeSource	canPay	guardianId	address	admissionDate	admissionFee	renewFee	formFee	note	due	verified
   ```

   **Teachers ট্যাব:**

   ```
   id	name	role	mobile	nid	address	joinDate	salary	photo	idcard	certificate	type
   ```

   **Fees ট্যাব:**

   ```
   studentId	studentName	date	monthly	newRenew	form	due	exam	mct	semester	books	transport	stationery	certificate	other	method	receipt	total
   ```

   **Attendance ট্যাব:**

   ```
   date	studentId	status	message	to
   ```

   **Expenses ট্যাব:**

   ```
   type	date	amount	description
   ```

   **Salaries ট্যাব:**

   ```
   teacherId	teacherName	role	month	amount	method	receipt	note	staffType	date
   ```

   **Admins ট্যাব:**

   ```
   username	passwordHash	photo
   ```

   ⚠️ **Admins ট্যাবে হেডার ছাড়া আর কিছু লিখবেন না, খালি রাখুন।** প্রথমবার লগইন হবে
   ধাপ-৩-এ যে username/password env variable-এ দেবেন সেটা দিয়ে। পরে "এডমিন
   রেজিস্টার" করলে অ্যাপ নিজে থেকেই এই ট্যাবে একটা লাইন লিখে দেবে (পাসওয়ার্ড
   এনক্রিপ্ট করা অবস্থায়, প্লেইন টেক্সটে না)।

5. ব্রাউজারের ঠিকানা বার (address bar) থেকে **Sheet ID** কপি করে রাখুন — এটা লাগবে পরে।
   URL দেখতে এমন হয়:
   ```
   https://docs.google.com/spreadsheets/d/এই-লম্বা-অংশটাই-Sheet-ID/edit
   ```
   https://docs.google.com/spreadsheets/d/1TlAx-CLOVXWAbjhkUaAeVINkT8jDN8GmJFvBiYFIvMA/edit?gid=1207884125#gid=1207884125

---

## ধাপ ২ — Google Cloud প্রজেক্ট + API চালু করা

1. [console.cloud.google.com](https://console.cloud.google.com) এ যান (যেকোনো Gmail
   দিয়ে লগইন করলেই হবে, আলাদা কোনো পেইড অ্যাকাউন্ট লাগে না — এই প্রজেক্টে যা লাগবে সবই ফ্রি)।
2. উপরে প্রজেক্ট ড্রপডাউন থেকে **New Project** — নাম দিন যেমন `shishu-kanon`, **Create**।
3. প্রজেক্ট তৈরি হলে সেটা সিলেক্ট করা আছে কিনা উপরে দেখে নিন।
4. বাম পাশের মেনু (☰) থেকে **APIs & Services → Library**-তে যান।
5. সার্চ করুন **Google Sheets API** → খুলে **Enable** চাপুন।
6. আবার Library-তে ফিরে সার্চ করুন **Google Drive API** → **Enable** চাপুন।
   (Drive API লাগবে কারণ ছাত্র-ছাত্রী/অভিভাবকের ছবি Sheet-এর ঘরে রাখা যায় না —
   একটা সেলে সর্বোচ্চ ৫০,০০০ ক্যারেক্টার ধরে, বাস্তব ছবির base64 তার চেয়ে অনেক বড়।
   তাই ছবি Drive-এ রাখা হবে, Sheet-এ শুধু তার লিংক থাকবে।)

---

## ধাপ ৩ — Service Account তৈরি + JSON Key

Service Account মানে একটা "রোবট অ্যাকাউন্ট" — আপনার অ্যাপ এই অ্যাকাউন্টের পরিচয়ে
Google Sheet/Drive-এ ঢুকবে, আপনার ব্যক্তিগত Google পাসওয়ার্ড কোথাও লাগবে না।

1. বাম মেনু থেকে **IAM & Admin → Service Accounts**-এ যান।
2. উপরে **+ Create Service Account** চাপুন।
3. **Service account name** এ লিখুন `shishu-kanon-app` — Service account ID নিজে থেকেই বসে যাবে।
4. **Create and Continue** চাপুন। এর পরের ধাপে (role assign) কিছু না বেছে সরাসরি
   **Continue** তারপর **Done** চাপুন — এগুলো আমাদের লাগবে না।
5. তালিকায় আপনার নতুন service account দেখা যাবে — এর ইমেইলটা কপি করে রাখুন,
   দেখতে এমন হবে: `shishu-kanon-app@shishu-kanon-xxxxx.iam.gserviceaccount.com`
   shishu-kanon-app@shishu-kanon.iam.gserviceaccount.com
6. সেই service account-এর নামের উপর ক্লিক করুন → উপরে **Keys** ট্যাবে যান।
7. **Add Key → Create new key** → Key type-এ **JSON** সিলেক্ট করা আছে কিনা দেখে **Create**।
8. একটা `.json` ফাইল ডাউনলোড হয়ে যাবে — **এই ফাইলটা যত্ন করে রাখুন, এটা দ্বিতীয়বার
   ডাউনলোড করা যায় না** (নতুন key বানাতে হবে হারিয়ে ফেললে)। এই ফাইলের ভেতরে
   `client_email` আর `private_key` — এই দুটো মান পরে `.env`-এ বসবে।

---

## ধাপ ৪ — Sheet আর Drive ফোল্ডার শেয়ার করা

Service account শুধু ওই সব Sheet/ফোল্ডারে ঢুকতে পারবে যেগুলো তাকে স্পষ্টভাবে শেয়ার
করা হয়েছে — তাই এই ধাপটা বাদ দিলে অ্যাপ "Permission denied" error দেবে।

**Sheet শেয়ার করা:**

1. ধাপ-১-এ বানানো Google Sheet-টা খুলুন।
2. উপরে ডান দিকে **Share** বাটনে ক্লিক করুন।
3. ধাপ-৩-এর সেই service account ইমেইলটা paste করুন।
4. Role **Editor** আছে কিনা নিশ্চিত করে **Send** (বা **Share**) চাপুন। এটা রোবট
   ইমেইল বলে "no access" মার্ক করে দিলেও চিন্তার কিছু নেই, ওটাই স্বাভাবিক।

**ছবির জন্য Drive ফোল্ডার শেয়ার করা:**

1. [drive.google.com](https://drive.google.com) এ একটা নতুন ফোল্ডার বানান, নাম দিন
   `Shishu Kanon Photos`।
2. ফোল্ডারে right-click → **Share** → আগের মতো সেই service account ইমেইল দিয়ে
   **Editor** এক্সেস দিন।
3. ফোল্ডারের ভেতরে ঢুকে URL থেকে ফোল্ডার ID কপি করুন:
   ```
   https://drive.google.com/drive/folders/এই-অংশটাই-Folder-ID
   ```
   https://drive.google.com/drive/folders/1-3rxoH7MBIhlgkP_17fYQeERVrWhuIGx

---

## এখন হাতে যা যা থাকার কথা

- ✅ Sheet ID (ধাপ ১.৫)
- ✅ Service Account email + `.json` ফাইল (ধাপ ৩)
- ✅ Drive Folder ID (ধাপ ৪)

এই তিনটা মান `web/.env.example`-এর কপি বানিয়ে (নাম দিন `.env`) এভাবে বসাবেন:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=<.json ফাইলের client_email>
GOOGLE_PRIVATE_KEY="<.json ফাইলের private_key — \n সহ হুবহু, quote গুলোসহ>"
GOOGLE_SHEET_ID=<ধাপ ১.৫-এর Sheet ID>
GOOGLE_DRIVE_FOLDER_ID=<ধাপ ৪-এর Folder ID>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<নিজের একটা পাসওয়ার্ড দিন — এটা দিয়েই প্রথমবার লগইন করবেন>
JWT_SECRET=<যেকোনো লম্বা এলোমেলো লেখা, যেমন কীবোর্ডে এলোমেলো চেপে ৪০-৫০ ক্যারেক্টার>
```

`GOOGLE_PRIVATE_KEY` কপি করার সময় `.json` ফাইলে যেভাবে `\n` লেখা আছে সেভাবেই
(literal ব্যাকস্ল্যাশ-n হিসেবে) কপি করবেন, নিজে থেকে নতুন লাইনে ভাঙবেন না — পুরো
জিনিসটা এক লাইনে, দুই পাশে ডাবল-কোট দিয়ে।

এই `.env` ফাইলটা পরে **Vercel-এর Environment Variables**-এও ঠিক এই নাম গুলো দিয়ে
বসাতে হবে (deploy করার সময় সেই ধাপ পরে দেখাবো) — `.env` ফাইল নিজে থেকে GitHub-এ
আপলোড হবে না (এটা ইচ্ছাকৃত, কারণ এতে গোপন তথ্য থাকে), তাই Vercel-এ আলাদা করে বসাতে হয়।

---

# SETUP GUIDE — অংশ ২: নিজের PC-তে চালিয়ে টেস্ট করা

Vercel/Render-এ তোলার আগে নিজের PC-তে সব ঠিকঠাক চলছে কিনা দেখে নেওয়াই ভালো —
সমস্যা হলে এখানেই ধরা সহজ, deploy করার পর ধরা কঠিন।

## প্রথমে — Node.js ইনস্টল আছে কিনা দেখুন

Terminal/Command Prompt খুলে লিখুন:

```
node -v
```

`v20` বা তার বেশি না দেখালে [nodejs.org](https://nodejs.org) থেকে **LTS** ভার্সন
ইনস্টল করে নিন (Windows/Mac দুটোতেই সহজ ইনস্টলার আছে, Next-Next করলেই হয়)।

---

## Part A — মূল ওয়েবসাইট (web/) + Google Sheet টেস্ট

⚠️ এই প্রজেক্টে `/api` ফোল্ডারে যে কোডগুলো আছে (Google Sheet-এর সাথে কথা বলার
কোড) সেগুলো Vercel-এর নিজস্ব "Serverless Function" — শুধু `npm run dev` (Vite)
দিয়ে এগুলো চলবে না, `/api/...` কল করলে 404 আসবে। এজন্য Vercel-এর নিজস্ব CLI
টুল লাগবে, যেটা frontend + api একসাথে, production-এর মতো করেই লোকালি চালায়।

1. **Vercel CLI ইনস্টল করুন** (একবারই লাগবে, সারা কম্পিউটারে কাজ করবে):
   ```
   npm install -g vercel
   ```
2. আগে থেকে Vercel অ্যাকাউন্ট না থাকলে চিন্তা নেই — পরের ধাপে প্রথমবার চালানোর
   সময় ব্রাউজারে খুলে GitHub/Google দিয়ে ফ্রি সাইন-আপ করার লিংক দেখাবে।
3. Terminal-এ প্রজেক্টের `web` ফোল্ডারে ঢুকুন:
   ```
   cd shishu-kanon/web
   npm install
   ```
4. `.env.example` ফাইলের একটা কপি বানিয়ে নাম দিন `.env`, তারপর অংশ-১-এ যোগাড়
   করা মানগুলো (Google Service Account email/key, Sheet ID, Drive Folder ID)
   এবং নিজের একটা `ADMIN_PASSWORD` ও `JWT_SECRET` বসান।
5. এখন চালান:
   ```
   vercel dev
   ```
   - প্রথমবার কিছু প্রশ্ন করবে — সবগুলোতে ডিফল্ট (Enter চেপে) বা "Yes"/"N" যেটা
     স্বাভাবিক মনে হয় সেটা দিলেই হবে ("Set up and develop?" → Yes, "Link to
     existing project?" → No, একটা নাম দিতে বললে `shishu-kanon` লিখুন)।
   - Terminal-এ একটা লোকাল ঠিকানা দেখাবে, সাধারণত `http://localhost:3000`
6. ব্রাউজারে সেই ঠিকানা খুলুন — লগইন স্ক্রিন আসবে। Username: `admin`,
   Password: আপনি `.env`-এ যা দিয়েছেন সেটা।
7. লগইন করে **Admission** পেজ থেকে একটা টেস্ট ছাত্র-ছাত্রী যোগ করুন।
8. এবার আপনার Google Sheet-টা খুলুন (ব্রাউজারের অন্য ট্যাবে) — `Students`
   ট্যাবে সাথে সাথে নতুন লাইনটা চলে এসেছে কিনা দেখুন।

✅ এটা দেখা গেলেই বুঝবেন কেন্দ্রীয় ডেটাবেস কাজ করছে — এখন থেকে যেই ডিভাইস থেকেই
লগইন করুন, একই ডেটা দেখা যাবে, কারণ ডেটা আর ব্রাউজারে না থেকে Sheet-এ থাকছে।

**সমস্যা হলে যা দেখবেন:**

- লগইনেই এরর → `.env`-এ `ADMIN_USERNAME`/`ADMIN_PASSWORD` ঠিকমতো বসেছে কিনা,
  আর `Admins` ট্যাব খালি (শুধু হেডার) আছে কিনা দেখুন।
- "Permission denied" জাতীয় এরর → Sheet আর Drive ফোল্ডার Service Account
  ইমেইলের সাথে **Editor** হিসেবে শেয়ার করা হয়েছে কিনা আবার চেক করুন (অংশ-১,
  ধাপ ৪)।
- `GOOGLE_PRIVATE_KEY` নিয়ে এরর → `.env`-এ পুরো key-টা এক লাইনে, দুই পাশে
  ডাবল-কোটসহ, `\n` গুলো বদলানো ছাড়া বসানো হয়েছে কিনা দেখুন।

---

## Part B — WhatsApp বট লোকালি টেস্ট (ঐচ্ছিক, পরেও করা যায়)

বটের জন্য আগে একটা ফ্রি MongoDB লাগবে (session সংরক্ষণের জন্য)।

### B.1 — MongoDB Atlas ফ্রি ডাটাবেস বানানো

1. [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
   এ ফ্রি সাইন-আপ করুন।
2. একটা নতুন Cluster বানাতে বললে **M0 (Free)** টায়ার বেছে নিন, কাছাকাছি একটা
   Region দিন (যেমন Mumbai/Singapore), **Create**।
3. **Database Access** থেকে একটা user বানান (username + password — password-টা
   আলাদা করে সেভ রাখুন, পরে লাগবে)।
4. **Network Access** থেকে **Add IP Address → Allow Access from Anywhere**
   (0.0.0.0/0) দিন। এতে যেকোনো জায়গা থেকে (নিজের PC, পরে Render থেকেও) কানেক্ট
   করা যাবে — যেহেতু ঢোকার জন্য এখনো username/password লাগবে, এটা নিরাপদ।
5. Cluster রেডি হলে **Connect → Drivers** এ ক্লিক করে connection string কপি
   করুন, দেখতে এমন:
   ```
   mongodb+srv://user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   `<password>` এর জায়গায় ধাপ-৩-এর আসল পাসওয়ার্ড বসান।

### B.2 — বট চালানো

1. নতুন একটা Terminal খুলুন (আগেরটা `vercel dev` চালিয়ে ব্যস্ত থাকবে):
   ```
   cd shishu-kanon/whatsapp-bot
   npm install
   ```
2. `.env.example` কপি করে `.env` বানান, বসান:
   - `MONGODB_URI` — উপরের connection string
   - `BOT_SECRET` — একটা লম্বা এলোমেলো লেখা (আর `web/.env`-এর
     `WHATSAPP_BOT_SECRET`-এও ঠিক এই একই মান বসান, দুই জায়গায় মিলতে হবে)
3. চালান:
   ```
   npm start
   ```
4. ব্রাউজারে খুলুন: `http://localhost:4000/qr?key=আপনার-BOT_SECRET`
   (`.env.example`-এ বটের ডিফল্ট পোর্ট ইচ্ছা করেই 4000 রাখা হয়েছে, যাতে
   `vercel dev`-এর ডিফল্ট 3000-এর সাথে সংঘর্ষ না হয় — দুটো Terminal-এ দুটো
   আলাদা প্রজেক্ট একসাথে চলবে)
5. QR কোড দেখাবে — স্কুলের WhatsApp দিয়ে **Settings → Linked Devices → Link a
   Device** থেকে স্ক্যান করুন।
6. স্ক্যান হয়ে গেলে পেজ রিফ্রেশ করলে "✅ Connected" দেখাবে।
7. এখন `web/.env`-এ `WHATSAPP_BOT_URL=http://localhost:4000` বসিয়ে
   `vercel dev` বন্ধ করে আবার চালু করুন (env পরিবর্তনের পর রিস্টার্ট লাগে),
   Attendance পেজে গিয়ে একজন ছাত্রের Auto Send চেপে দেখুন — সত্যিই WhatsApp-এ
   মেসেজ পৌঁছায় কিনা।

⚠️ **আগের বার্তা মনে করিয়ে দিচ্ছি:** QR স্ক্যান করার সময় যদি সংযোগ না হয়ে
"405 Connection Failure" জাতীয় এরর Terminal-এ দেখেন, সেটা এখন সক্রিয় একটা
পরিচিত সমস্যা — তবে এটা লোকাল PC (বাসা/অফিসের ইন্টারনেট) থেকে চালালে সাধারণত
কাজ করার কথা, যেহেতু সমস্যাটা মূলত cloud-hosting-এর IP নিয়ে। তাই এই ধাপটা
localhost-এ ঠিকভাবে হওয়াটাই Render-এ যাওয়ার আগে সবচেয়ে গুরুত্বপূর্ণ যাচাই।

---

দুটো অংশই লোকালি ঠিকমতো চললে, পরের ধাপে Render (বটের জন্য) আর Vercel
(ওয়েবসাইটের জন্য) — এ আসল ডিপ্লয়মেন্ট দেখাবো।
