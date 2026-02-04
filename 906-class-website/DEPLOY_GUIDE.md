# 906 親師平台 - Firebase App Hosting 部署完整教學

## 一、前置準備

1. 確認專案可本地建置成功：
   ```powershell
   cd f:\School\906-class-website
   npm run build
   ```
   若失敗請先修正本地建置問題。

2. 確認程式碼已推送到 GitHub（從 `f:\School` 資料夾）：
   ```powershell
   cd f:\School
   git status
   git add .
   git commit -m "feat: 準備部署"
   git push origin main
   ```

---

## 二、Firebase Console 設定

### 步驟 1：開啟 App Hosting

1. 開啟瀏覽器，前往 https://console.firebase.google.com/
2. 登入 Google 帳號
3. 選擇專案 **cish-906-school**（或你建立的 Firebase 專案）
4. 左側選單點 **Build**（建置）
5. 點 **App Hosting**

### 步驟 2：建立或進入 Backend

- **若尚未建立**：點 **Get started** 或 **Create backend**
- **若已建立**：點你的 backend 名稱進入

### 步驟 3：連接 GitHub（若尚未連接）

1. 選擇 **Connect to GitHub**
2. 授權 Firebase App Hosting 存取你的 GitHub
3. 選擇 **Organization** 或 **User**（你的帳號）
4. 選擇儲存庫（例如 `School` 或 `906-class-website`，依你實際 repo 名稱）
5. 點 **Connect**

### 步驟 4：設定 Root directory（根目錄）

這是**最容易出錯**的設定。

1. 進入 **Settings**（設定）或 **Deployment** 分頁
2. 找到 **Root directory** 或 **App root directory**
3. 依你的 GitHub 儲存庫結構填入：

   | 你的 GitHub 儲存庫結構 | Root directory 填什麼 |
   |------------------------|------------------------|
   | 根目錄有 `906-class-website` 資料夾（即 f:\School 整個 push 上去） | `906-class-website` |
   | 根目錄就是 Next.js 專案（只有 906-class-website 的檔案） | `/` 或留空 |

4. **重要**：不要有多餘空格，只輸入 `906-class-website` 或 `/`
5. 點 **Save** 儲存

### 步驟 5：設定環境變數

1. 在 App Hosting 頁面，找到 **Environment variables** 或 **環境變數**
2. 點 **Add variable** 或 **Edit**
3. 新增以下變數（從 `.env.local` 複製值，或從 Firebase Console 專案設定取得）：

   | 變數名稱 | 可用於 | 範例值 |
   |----------|--------|--------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | BUILD, RUNTIME | AIzaSy... |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | BUILD, RUNTIME | cish-906-school.firebaseapp.com |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | BUILD, RUNTIME | cish-906-school |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | BUILD, RUNTIME | cish-906-school.firebasestorage.app |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | BUILD, RUNTIME | 795413031258 |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | BUILD, RUNTIME | 1:795413031258:web:... |

4. 每個變數都要勾選 **BUILD** 和 **RUNTIME**
5. 儲存

**如何取得 Firebase 設定值：**
- Firebase Console → 專案設定（齒輪圖示）→ 一般 → 你的應用程式 → 設定物件

---

## 三、觸發部署

### 方式 A：Push 到 GitHub 自動部署

1. 修改程式碼後：
   ```powershell
   cd f:\School
   git add .
   git commit -m "fix: 部署修正"
   git push origin main
   ```
2. 回到 Firebase Console → App Hosting
3. 幾分鐘內會看到新的 **Rollout** 開始
4. 等待建置完成（約 5–10 分鐘）

### 方式 B：手動觸發 Rollout

1. Firebase Console → App Hosting → 你的 Backend
2. 點 **Rollouts** 分頁
3. 點 **Create rollout** 或 **Rollout**
4. 選擇分支（通常為 `main`）
5. 確認後開始建置

---

## 四、確認結果

1. 建置成功後，會顯示 **Live** 狀態
2. 點 **Open app** 或複製網址（例如 `https://xxx.apphosting.run`）
3. 在瀏覽器開啟，確認網站可正常使用

---

## 五、常見錯誤與處理

| 錯誤訊息 | 可能原因 | 處理方式 |
|----------|----------|----------|
| No buildpack groups passed detection | Root directory 錯誤或找不到 package.json | 檢查 Root directory 是否正確 |
| Invalid root directory... No buildable app found | Root directory 路徑錯誤或有空格 | 刪除前後空格，確認路徑正確 |
| preparer failed | 環境變數或 apphosting.yaml 設定有誤 | 檢查 apphosting.yaml、環境變數 |
| pack failed (exit 51) | 建置失敗（依賴、Node 版本、lint 等） | 本地 `npm run build` 測試，確認環境變數已設定 |

### 查看詳細錯誤日誌

1. 開啟 https://console.cloud.google.com/
2. 選擇專案 `cish-906-school`
3. 左側選單 → **Cloud Build** → **History**
4. 點開失敗的建置
5. 展開失敗的 Step（如 Step 2 "pack"）
6. 閱讀完整錯誤訊息

---

## 六、你的專案結構對照

若你是從 `f:\School` 推送到 GitHub，儲存庫結構會是：

```
你的-GitHub-repo/
├── 906-class-website/    ← Root directory 填這個
│   ├── package.json
│   ├── apphosting.yaml
│   ├── next.config.ts
│   └── ...
├── .cursor/
├── .cursorrules
└── ...
```

此時 Root directory 應填：**906-class-website**（無空格、無斜線）
