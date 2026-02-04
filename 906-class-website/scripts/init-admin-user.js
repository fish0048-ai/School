/**
 * 建立 teacher/staff 使用者角色
 *
 * 使用方式：
 * 1. 使用者先在網站用 Email 或 Google 登入
 * 2. Firebase Console → Authentication → 複製該使用者的 UID
 * 3. 設定 GOOGLE_APPLICATION_CREDENTIALS
 * 4. 執行：node scripts/init-admin-user.js <UID> [role]
 *    例：node scripts/init-admin-user.js abc123xyz teacher
 *    例：node scripts/init-admin-user.js abc123xyz staff
 */

const admin = require('firebase-admin');
const PROJECT_ID = process.env.GCLOUD_PROJECT || 'cish-906-school';

async function main() {
  const uid = process.argv[2];
  const role = (process.argv[3] || 'teacher').toLowerCase();
  if (!uid) {
    console.error('用法: node scripts/init-admin-user.js <UID> [teacher|staff]');
    process.exit(1);
  }
  if (!['teacher', 'staff', 'student'].includes(role)) {
    console.error('role 必須為 teacher, staff 或 student');
    process.exit(1);
  }
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: PROJECT_ID });
  }
  const db = admin.firestore();
  await db.collection('users').doc(uid).set({ role }, { merge: true });
  console.log(`已設定 users/${uid} 角色為 ${role}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
