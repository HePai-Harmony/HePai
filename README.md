# HePai｜合拍

面向四部和聲學習者的互動式批改 prototype。使用者可體驗拍攝／上傳譜面、辨識檢閱、錯誤定位、中文規則解釋、改寫建議、作品庫與學習報告等流程。

## 歷屆試題題庫

題庫頁已整合 HePaiMobileApp 的正式資料：114、113、112 與 112 補考，共 4 份試題、90 題及 18 張譜例。支援依試題、題組、關鍵字與是否含譜例篩選，並可完成作答、判分與解析流程。

- 資料：`src/data/hepai_exam_question_bank.json`
- 資料轉換：`src/data/examQuestionBank.ts`
- 譜例：`public/question-bank-assets/`

## 決賽展示模式

啟動開發伺服器後開啟：

```text
http://localhost:8080/?demo=1
```

`demo=1` 會略過首次 onboarding，直接進入批改首頁。批改流程使用預先驗證的範例樂譜與錯誤資料，適合在無網路或即時 OMR 尚未完成時穩定展示；畫面中的信心度也明確標示為「範例辨識信心度」。

## 本機執行

```bash
npm ci
npm run dev
```

## 品質檢查

```bash
npm test
npm run lint
npm run build
```

## 技術架構

- React 18、TypeScript、Vite
- Tailwind CSS、shadcn/ui、Framer Motion
- React Router
- Vitest、Testing Library、Playwright

## 目前產品邊界

- 已完成：完整可點擊的批改與學習介面、固定範例流程、錯誤定位與解釋、作品紀錄。
- 尚未完成：真實 OMR API／端側模型串接、使用者帳號後端、雲端資料同步。
- 對外展示時應稱為「互動式功能 prototype」；不可把固定範例結果宣稱為任意樂譜的即時 AI 分析。
