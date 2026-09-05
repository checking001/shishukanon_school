// প্রতি মেসেজের মাঝে ন্যূনতম বিরতি (ms)। WhatsApp-এর automation-detection এড়াতে
// এটাই আসল সুরক্ষা — frontend থেকে যতই দ্রুত ক্লিক করা হোক, এখানে সব সময় এক এক
// করে, মানুষ যেভাবে টাইপ করে পাঠাত তার কাছাকাছি গতিতে পাঠানো হয়।
const MIN_GAP_MS = 12_000; // মিনিটে সর্বোচ্চ ৫টা মেসেজ

let queue = [];
let running = false;

// এটা ইচ্ছাকৃতভাবে "fire-and-forget" — কলার (HTTP handler) সাথে সাথে queue
// position পেয়ে যায়, প্রকৃত পাঠানো শেষ হওয়া পর্যন্ত অপেক্ষা করতে হয় না। কারণ
// queue-তে আগে থেকে কয়েকটা মেসেজ থাকলে ১২ সেকেন্ড বিরতির নিয়মে প্রকৃত পাঠাতে
// অনেক সময় লেগে যেতে পারে — Vercel-এর ফ্রি প্ল্যানে একটা API request ১০ সেকেন্ডের
// বেশি চলতে পারে না, তাই সাথে সাথে respond করাটাই জরুরি।
export function enqueueSend(sendFn, job, onResult) {
  queue.push({ sendFn, job, onResult });
  const position = queue.length;
  processQueue();
  return position;
}

async function processQueue() {
  if (running) return;
  running = true;
  while (queue.length) {
    const { sendFn, job, onResult } = queue.shift();
    try {
      const result = await sendFn(job);
      onResult?.(null, result);
    } catch (err) {
      onResult?.(err);
    }
    if (queue.length) await sleep(MIN_GAP_MS);
  }
  running = false;
}

export function queueLength() {
  return queue.length;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
