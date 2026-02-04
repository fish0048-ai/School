# 遷移資料目錄

請從 Google 試算表匯出 CSV 並放入此目錄，檔名對應如下：

| CSV 檔名 | Firestore 集合 | 試算表 |
|----------|----------------|--------|
| bulletin.csv | announcements | BULLETIN |
| homework.csv | homework | HOMEWORK |
| countdown.csv | countdown_events | COUNTDOWN |
| links.csv | links | EXTERNAL |
| stories.csv | stories | STORIES |
| honor_roll.csv | honor_roll | HONOR_ROLL |
| violations.csv | violations | VIOLATIONS |
| gallery.csv | gallery_photos | GALLERY |
| schedules.csv | schedules | SCHEDULE (gid=0 班級) |
| schedules_teacher.csv | schedules_teacher | SCHEDULE (gid=1988816131 教師) |
| class_fund.csv | class_fund | CLASS_FUND |
| polls.csv | polls | POLLS |

匯出方式：Google 試算表 → 檔案 → 下載 → 逗號分隔值 (.csv)

執行遷移前請：
1. 設定 GOOGLE_APPLICATION_CREDENTIALS 指向服務帳戶金鑰 JSON
2. 執行 `npm run migrate`
