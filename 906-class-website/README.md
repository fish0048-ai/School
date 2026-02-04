# 906 親師溝通平台

Next.js + Firebase 班級親師溝通平台，可部署於 Firebase App Hosting。

## 技術棧

- Next.js 15 + React 19
- Tailwind CSS
- Firebase Auth、Firestore
- 相簿：Google Drive（經 Apps Script）

## 開始使用

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

複製 `.env.local.example` 為 `.env.local`，填入 Firebase 設定（變數前綴為 `NEXT_PUBLIC_`）。

### 3. 本機開發

```bash
npm run dev
```

### 4. 建置

```bash
npm run build
```

## Firebase App Hosting 部署

1. 在 [Firebase Console](https://console.firebase.google.com/) → App Hosting
2. 連接 GitHub 儲存庫
3. 設定環境變數（在 App Hosting 設定頁填入 `NEXT_PUBLIC_FIREBASE_*` 等）
4. 每次 push 到 main 會自動建置並部署

## 傳統 Firebase Hosting（替代）

若使用傳統 Hosting，需先建置靜態輸出：

在 `next.config.ts` 新增 `output: 'export'`，然後執行 `npm run build`，將 `out/` 部署至 Hosting。

## 建立教師/幹部帳號

1. 使用者先在網站登入（Email 或 Google）
2. Firebase Console → Authentication → 複製該使用者的 UID
3. 執行：`node scripts/init-admin-user.js <UID> teacher` 或 `staff`

## 專案結構

```
src/
├── app/           # Next.js App Router 頁面
├── components/    # 共用元件
├── context/       # AuthContext
└── lib/           # firebase, utils

scripts/
├── migrate-sheets-to-firestore.js   # 試算表 → Firestore 遷移
├── init-admin-user.js               # 設定 teacher/staff 角色
└── data/                            # 遷移用 CSV 目錄
```
