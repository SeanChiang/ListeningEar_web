# 🎧 傾聽耳 (Listening Ear) - Safe from Harm 會談安全紀錄系統

**傾聽耳 (Listening Ear)** 是專為世界童軍運動組織（WOSM）「免受傷害（Safe from Harm, SfH）」政策打造的高保密性會談安全紀錄與 AI 檢傷分類 Web 系統。

本系統協助傾聽耳志工在陪伴與會談過程中進行結構化紀錄，結合 **Google Gemini AI** 進行即時檢傷風險評估與處置建議，並支援自動備份至 **Google Sheets** 雲端試算表及一鍵匯出 **PDF 機密報告**。

---

## ✨ 核心功能 (Features)

### 1. 📋 引導式多步驟會談紀錄表單 (5-Step Form Flow)
* **Step 1: 基本資訊 (Info)**
  * 會談時間、志工資訊（姓名、職務、電話、Email）。
  * 當事人求助者資訊（支援化名、電話、地址）。
  * 家長/監護人資訊（提供「同當事人地址」一鍵帶入功能）。
  * 會談來源（自行求助 / 他人轉介及原因）。
* **Step 2: 環境設定與開放對話 (Shelter & Communication)**
  * **Shelter (會談地點)**：大會靜心室/安全空間、營地帳篷、醫療站或自訂地點。
  * **Communication (主訴內容)**：引導使用當事人原話/逐字稿記錄。
* **Step 3: 觀察與理解 (Observation & Understanding)**
  * **Observation (觀察指標)**：外傷狀況（無外傷 / 已處理之外傷）、睡眠狀況、食慾現況、能量與興趣、情緒困擾與行為表現。
  * **Understand (理解與澄清摘要)**：志工總結與確認個案核心焦慮來源。
* **Step 4: AI 輔助檢傷分類與人工覆核 (Triage)**
  * **AI 檢傷分級**：
    * 🟢 **Mild (輕度)**：陪伴安撫、提供安全空間。
    * 🟡 **Moderate (中度)**：通報 SfH 安全防護團隊評估。
    * 🔴 **Severe (重度/法律紅線)**：觸發法律紅線警示框（涉及性騷擾、偷拍、暴力、兒少保護等，提醒「知悉即通報（24小時內）」與「切勿私下查證」原則）。
  * 志工人工覆核確認最終分類與後續轉介處置，並簽署 WOSM 保密條款。
* **Step 5: 送出與加密匯出**
  * 生成唯一紀錄序號 (如 `LE-XXXXXX-XX`)。
  * 自動備份寫入 Google Sheets 雲端試算表。
  * 提供「**匯出 PDF 下載**」功能生成 A4 機密格式報告。

### 2. 🧪 測試模式 (Test Mode Switch)
* 右上角切換開關，開啟後解除必填限制並可自由跳轉步驟 (1~4)，方便簡報展示與開發測試。

---

## 🛠️ 技術棧 (Tech Stack)

* **前端框架**：[Next.js 16 (App Router)](https://nextjs.org/) + React 19 + TypeScript
* **介面設計**：CSS Modules + Glassmorphism 現代化視覺
* **AI 核心**：`@google/generative-ai` (Gemini 2.5 Flash / JSON Mode)
* **後端備份**：`googleapis` (Google Sheets API v4 透過 Service Account 寫入)
* **報告匯出**：`html2pdf.js`

---

## 🔑 環境變數設定 (`.env.local`)

請在專案根目錄建立 `.env.local` 檔案並填入以下資訊：

```env
# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Google Sheets API (Service Account)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id_here
```

---

## 🚀 本地開發指南 (Getting Started)

### 1. 安裝套件
```bash
npm install
```

### 2. 啟動開發伺服器
```bash
npm run dev
```

開啟瀏覽器造訪 [http://localhost:3000](http://localhost:3000)。

### 3. 建置與部署
```bash
# 產出生產環境版本
npm run build

# 啟動生產環境伺服器
npm run start
```

---

## 🔒 機密性與安全宣告

本系統所紀錄之內容包含高度個人隱私資訊，請使用者與維護團隊嚴格遵循 **WOSM Safe from Harm** 安全防護保密條款，嚴禁未授權外流。
