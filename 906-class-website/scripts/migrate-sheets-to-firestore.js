/**
 * 試算表遷移腳本：從 Google 試算表 CSV 匯入 Firestore
 *
 * 使用方式：
 * 1. 從各試算表匯出 CSV（檔案 → 下載 → 逗號分隔值）
 * 2. 將 CSV 放入 scripts/data/ 目錄
 * 3. 安裝依賴：npm install firebase-admin
 * 4. 設定環境變數：GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
 * 5. 執行：node scripts/migrate-sheets-to-firestore.js
 *
 * 或使用 fetch 從 gviz/tq?tqx=out:csv 取得 CSV（需在瀏覽器或支援 fetch 的環境）
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

function parseCSV(text) {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') {
        value += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        value += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') {
        row.push(value.trim());
        value = '';
      } else if (c === '\n' || (c === '\r' && next === '\n')) {
        if (c === '\r') i++;
        row.push(value.trim());
        rows.push(row);
        row = [];
        value = '';
      } else if (c !== '\r') value += c;
    }
  }
  if (value || row.length) {
    row.push(value.trim());
    rows.push(row);
  }
  return rows;
}

function parseDate(str) {
  if (!str || !str.trim()) return null;
  const s = str.trim().replace(/-/g, '/').replace(/\./g, '/');
  const parts = s.split('/');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    if (y > 1900) return new Date(y, m - 1, d);
    if (d > 1900) return new Date(d, parseInt(parts[0], 10) - 1, parseInt(parts[1], 10));
    if (y < 1900 && y > 0) return new Date(y + 1911, m - 1, d);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  let admin;
  try {
    admin = require('firebase-admin');
  } catch (e) {
    console.error('請先安裝 firebase-admin: npm install firebase-admin');
    console.error('並設定 GOOGLE_APPLICATION_CREDENTIALS 指向服務帳戶金鑰 JSON');
    process.exit(1);
  }

  if (!admin.apps.length) {
    admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT || 'YOUR_PROJECT_ID' });
  }
  const db = admin.firestore();

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('已建立 scripts/data/ 目錄，請將 CSV 檔案放入後重新執行');
    console.log('檔案對應：');
    console.log('  bulletin.csv -> announcements');
    console.log('  homework.csv -> homework');
    console.log('  countdown.csv -> countdown_events');
    console.log('  等');
    return;
  }

  const mappings = [
    {
      file: 'announcements.csv',
      collection: 'announcements',
      transform: (row) => ({
        imp: row[0] || '1',
        cat: row[1] || '',
        date: row[2] || '',
        title: row[3] || '',
        due: row[4] || '',
        content: row[5] || '',
      }),
    },
    {
      file: 'homework.csv',
      collection: 'homework',
      transform: (row) => ({
        item: row[0] || '',
        status: row[1] || '',
        missing_count: parseInt(row[2], 10) || 0,
        missing_seats: row[3] || '',
      }),
    },
    {
      file: 'countdown.csv',
      collection: 'countdown_events',
      transform: (row) => {
        const date = parseDate(row[2]);
        const end = parseDate(row[3]);
        return {
          rating: parseInt(row[0], 10) || 1,
          title: row[1] || '',
          date: date ? admin.firestore.Timestamp.fromDate(date) : null,
          end: end ? admin.firestore.Timestamp.fromDate(end) : null,
          subj1: row[4] || '',
          subj2: row[5] || '',
        };
      },
    },
    {
      file: 'links.csv',
      collection: 'links',
      transform: (row) => ({ cat: row[0] || '', title: row[1] || '', url: row[2] || '' }),
    },
    {
      file: 'stories.csv',
      collection: 'stories',
      transform: (row) => ({
        cat: row[0] || '',
        title: row[1] || '',
        content: row[2] || '',
        oneLiner: row[3] || '',
      }),
    },
  ];

  for (const m of mappings) {
    const filePath = path.join(DATA_DIR, m.file);
    if (!fs.existsSync(filePath)) {
      console.log(`跳過 ${m.file}（檔案不存在）`);
      continue;
    }
    const text = fs.readFileSync(filePath, 'utf-8');
    const rows = parseCSV(text).slice(1);
    const batch = db.batch();
    let count = 0;
    for (const row of rows) {
      if (!row.some((c) => c)) continue;
      const data = m.transform(row);
      const ref = db.collection(m.collection).doc();
      batch.set(ref, data);
      count++;
    }
    await batch.commit();
    console.log(`${m.collection}: 寫入 ${count} 筆`);
  }

  console.log('遷移完成');
}

main().catch(console.error);
