# শিশু কানন মডেল একাডেমি — School Management System

দুইটা আলাদা প্রজেক্ট এখানে আছে:

- **`/web`** — React (Vite) frontend + Vercel Serverless API routes। এটাই মূল ওয়েবসাইট, Vercel-এ ডিপ্লয় হবে। ডেটা Google Sheets-এ থাকে।
- **`/whatsapp-bot`** — একটা ছোট, সবসময়-চালু (always-on) Node.js সার্ভিস যেটা WhatsApp-এ মেসেজ পাঠায়। এটা Render.com-এ ডিপ্লয় হবে (Vercel-এ এটা চলবে না, কারণ WhatsApp সংযোগ সবসময় খোলা রাখতে হয়, আর Vercel-এর Function ১০ সেকেন্ড পর বন্ধ হয়ে যায়)।

সম্পূর্ণ ধাপে ধাপে ইনস্টল/ডিপ্লয় গাইড এর জন্য দেখুন **`SETUP_GUIDE.md`**।
