import { initAuthCreds, BufferJSON, proto } from '@whiskeysockets/baileys';

/**
 * অরিজিনাল Baileys-এর useMultiFileAuthState() লোকাল ফাইলে session (creds + crypto
 * keys) রাখে — Render-এর ফ্রি প্ল্যানে সার্ভিস ঘুমিয়ে গেলে/রিস্টার্ট হলে সেই ফাইল
 * মুছে যায়, ফলে প্রতিবার নতুন করে QR স্ক্যান করা লাগত। এখানে একই জিনিস MongoDB Atlas
 * (ফ্রি, স্থায়ী) কালেকশনে রাখা হচ্ছে, তাই একবার স্ক্যান করলেই চলবে।
 */
export async function useMongoAuthState(collection) {
  async function readData(id) {
    const doc = await collection.findOne({ _id: id });
    if (!doc) return null;
    try {
      return JSON.parse(doc.json, BufferJSON.reviver);
    } catch {
      return null;
    }
  }

  async function writeData(id, data) {
    await collection.updateOne(
      { _id: id },
      { $set: { json: JSON.stringify(data, BufferJSON.replacer) } },
      { upsert: true }
    );
  }

  async function removeData(id) {
    await collection.deleteOne({ _id: id });
  }

  const creds = (await readData('creds')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const ops = [];
          for (const category of Object.keys(data)) {
            for (const id of Object.keys(data[category])) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              ops.push(value ? writeData(key, value) : removeData(key));
            }
          }
          await Promise.all(ops);
        },
      },
    },
    saveCreds: () => writeData('creds', creds),
    // লগআউট করলে (বা নম্বর অন্য জায়গায় লিঙ্ক হয়ে গেলে) সম্পূর্ণ session মুছে
    // নতুন করে QR স্ক্যান করানোর জন্য।
    clearState: () => collection.deleteMany({}),
  };
}
