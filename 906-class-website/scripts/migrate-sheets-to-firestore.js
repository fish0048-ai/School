/**
 * 試算表遷移腳本：從 CSV 匯入 Firestore
 *
 * 使用方式：
 * 1. 從各 Google 試算表匯出 CSV（檔案 → 下載 → 逗號分隔值）
 * 2. 將 CSV 放入 scripts/data/ 目錄（檔名見下方 mappings）
 * 3. Firebase Console → 專案設定 → 服務帳戶 → 產生新的私密金鑰 → 儲存為 serviceAccountKey.json
 * 4. 設定：set GOOGLE_APPLICATION_CREDENTIALS=scripts/serviceAccountKey.json
 * 5. 執行：npm run migrate
 *
 * 試算表 ID 對照（匯出時用）：
 * BULLETIN: 1qzPmxx8rAF4J8XKzYDm5nHyjSgFgyKjmEGFb-L-hOgI
 * HOMEWORK: 1EIsNhRF2FzbZA1YNWI_0KMSo1MRJWjypy_soeABdEeU
 * COUNTDOWN: 1zGH7zE_0Eu2e4rzOozEUSmCR6obYjTON1Y3Qbrfsk0c
 * LINKS: 1dNqibbKUvdW7Xp0S5k1q8vuS71b8G4m9_jWmwJVXC3Y
 * STORIES: 1yNnxYtq_tlrTM24wYC8bvxHc08Y1t8zd9vFub5kUSV8
 * HONOR_ROLL: 1duSPQtXu3boLwPpnrQ_05ToMYLoZWgBnn1idFv4aKlE
 * VIOLATIONS: 1Il-ImSL6y4-H3lG8h8EcwrmJCgl9ywmryqXwPoY5-3E
 * SEATING: 1ME-7985DEef46m_skJJqLfOnR_emHr9n6ySRCCz1zHk
 * GALLERY: 11b03-UlYzI5_9vDTOkzFK2y3v3VwlykFyhIq_RkBrlA
 * SCHEDULE: 1ns4zJ8YSSr0p_xJT8Z9eG6fA0Tic42jEAajt48cBQb4 (gid=0 班級, gid=1988816131 教師)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, 'data');
const PROJECT_ID = process.env.GCLOUD_PROJECT || 'cish-906-school';

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

function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
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
    admin.initializeApp({ projectId: PROJECT_ID });
  }
  const db = admin.firestore();
  const { Timestamp } = admin.firestore;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(DATA_DIR, 'README.md'),
      `# 遷移資料目錄\n\n請從 Google 試算表匯出 CSV 並放入此目錄：\n\n- bulletin.csv → announcements\n- homework.csv → homework\n- countdown.csv → countdown_events\n- links.csv → links\n- stories.csv → stories\n- honor_roll.csv → honor_roll\n- violations.csv → violations\n- gallery.csv → gallery_photos\n- schedules.csv → schedules (班級)\n- schedules_teacher.csv → schedules_teacher (教師)\n- class_fund.csv → class_fund\n- polls.csv → polls\n`
    );
    console.log('已建立 scripts/data/ 目錄，請將 CSV 檔案放入後重新執行 npm run migrate');
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
          date: date ? Timestamp.fromDate(date) : null,
          end: end ? Timestamp.fromDate(end) : null,
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
    {
      file: 'honor_roll.csv',
      collection: 'honor_roll',
      transform: (row) => ({
        progress_title: row[0] || '進步獎',
        progress_winners: (row[1] || '').split(/[,，、]/).map((s) => s.trim()).filter(Boolean),
        rank_title: row[2] || '前三名',
        rank_winners: (row[3] || '').split(/[,，、]/).map((s) => s.trim()).filter(Boolean),
      }),
    },
    {
      file: 'violations.csv',
      collection: 'violations',
      transform: (row) => ({
        date: row[0] || '',
        seat: row[1] || '',
        reason: row[4] || '',
        subject: row[5] || '',
        period: row[6] || '',
        score: row[7] || '',
        status: row[9] || '',
      }),
    },
    {
      file: 'gallery.csv',
      collection: 'gallery_photos',
      transform: (row) => ({
        url: row[0] || '',
        title: row[1] || '',
        album: row[2] || '',
        desc: row[3] || '',
        date: row[4] || '',
        uploader: row[5] || '',
      }),
    },
    {
      file: 'schedules.csv',
      collection: 'schedules',
      transform: (row) => ({
        period: parseInt(row[0], 10) || 0,
        mon: row[1] || '',
        tue: row[2] || '',
        wed: row[3] || '',
        thu: row[4] || '',
        fri: row[5] || '',
      }),
    },
    {
      file: 'schedules_teacher.csv',
      collection: 'schedules_teacher',
      transform: (row) => ({
        period: parseInt(row[0], 10) || 0,
        mon: row[1] || '',
        tue: row[2] || '',
        wed: row[3] || '',
        thu: row[4] || '',
        fri: row[5] || '',
      }),
    },
    {
      file: 'class_fund.csv',
      collection: 'class_fund',
      transform: (row) => ({
        date: row[0] || '',
        item: row[1] || '',
        income: parseFloat(row[2]) || 0,
        expense: parseFloat(row[3]) || 0,
        note: row[4] || '',
      }),
    },
    {
      file: 'polls.csv',
      collection: 'polls',
      transform: (row) => ({
        due: row[0] || '',
        title: row[1] || '',
        formUrl: row[2] || '',
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
    const allRows = parseCSV(text);
    const rows = allRows.length > 1 ? allRows.slice(1) : allRows;
    const BATCH_SIZE = 500;
    let total = 0;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = rows.slice(i, i + BATCH_SIZE);
      for (const row of chunk) {
        if (!row.some((c) => c)) continue;
        const data = m.transform(row);
        const ref = db.collection(m.collection).doc();
        batch.set(ref, data);
        total++;
      }
      await batch.commit();
    }
    if (total > 0) console.log(`${m.collection}: 寫入 ${total} 筆`);
  }

  console.log('遷移完成');
}

main().catch(console.error);
