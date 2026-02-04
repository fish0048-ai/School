# 906 親師溝通平台

React + Firebase 班級親師溝通平台，取代原 Google Sites + 試算表架構。

## 技術棧

- React 18 + Vite + TypeScript
- Tailwind CSS
- Firebase Auth、Firestore
- 相簿：Google Drive（經 Apps Script）

## 開始使用

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定 Firebase

1. 在 [Firebase Console](https://console.firebase.google.com/) 建立專案
2. 啟用 Authentication、Firestore Database、Hosting
3. 複製 `.env.local.example` 為 `.env.local`，填入 Firebase 設定

### 3. 本機開發

```bash
npm run dev
```

### 4. 建置

```bash
npm run build
```

### 5. 部署至 Firebase Hosting

```bash
npm i -g firebase-tools
firebase login
firebase use YOUR_PROJECT_ID
firebase deploy
```

## 試算表遷移

1. 從 Google 試算表匯出 CSV
2. 將 CSV 放入 `scripts/data/`
3. 安裝 firebase-admin：`npm install firebase-admin`
4. 設定 `GOOGLE_APPLICATION_CREDENTIALS` 指向服務帳戶金鑰
5. 執行：`node scripts/migrate-sheets-to-firestore.js`

## 專案結構

```
src/
├── components/   # 共用元件
├── context/      # AuthContext
├── lib/          # firebase.ts, utils
├── pages/        # 各功能頁面
└── App.tsx
scripts/
└── migrate-sheets-to-firestore.js
```

## 授權網域

在 Firebase Console → Authentication → 授權網域，新增部署網域（如 `*.web.app`、自訂網域）。
