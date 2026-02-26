# bonsai cast QAset generator — 仕様書

## 1. プロダクト概要

| 項目 | 内容 |
|---|---|
| プロダクト名 | bonsai cast QAset generator |
| 目的 | 企業URLから動画のQAset（スクリプト含）を自動生成 |
| ターゲットユーザー | マーケター、動画制作者、営業担当者 |
| デプロイ先 | Vercel |
| リポジトリ | `ShinsukeIgami0713/bonsai-cast-QAset-generator` |

---

## 2. 主要機能

| 機能 | 説明 |
|---|---|
| 企業URL入力 | 任意の企業サイトURLを入力 |
| QAset数選択 | コンパクト（5個）/ 詳細版（15個）から選択 |
| 目的選択 | CV最大化 / 理解促進から選択 |
| QAset自動生成 | Claude API を使用したAI生成 |
| テーブル表示 | 生成されたQAsetを一覧表示 |
| インライン編集 | Script / CTA Label / CTA Link を行単位で編集 |
| CSV出力 | 編集済みデータを UTF-8 BOM付きCSVでダウンロード |

---

## 3. 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 18 + Vite 6 |
| AIモデル | Claude API (`claude-sonnet-4-5-20250929`) |
| バックエンド | Vercel Serverless Functions |
| デプロイ | Vercel |
| 依存ライブラリ | `react ^18.3.1`, `react-dom ^18.3.1` |
| 開発依存 | `@vitejs/plugin-react ^4.3.4`, `vite ^6.0.0` |

---

## 4. データフロー

```
ユーザー
  │
  │ 1. URL・設定（QAset数・目的）を入力
  ▼
App.jsx（フロントエンド）
  │
  │ 2. POST /api/fetch-url  { url }
  ▼
api/fetch-url.js
  │  - サイトHTMLを取得
  │  - メインコンテンツ優先抽出（main > article > div[content]）
  │  - 本文5000字・見出し20件・リンク15件を返却
  ▼
App.jsx
  │
  │ 3. POST /api/generate  { model, system, messages }
  ▼
api/generate.js  →  Claude API
  │  - システムプロンプト + サイト情報を送信
  │  - QAset JSONを受け取る
  ▼
App.jsx
  │ 4. JSONをパースしてテーブル表示
  │ 5. ユーザーがインライン編集
  │ 6. CSV出力
  ▼
ユーザー（CSVダウンロード）
```

---

## 5. QAset生成ルール

### コンパクト（5個）

| ノード | type | parent_id | 秒数 |
|---|---|---|---|
| id=1 | `opening` | null | 〜11秒（80文字以内）|
| id=2〜5 | `qa` | "1" | 各8〜12秒 |

### 詳細版（15個）

| ノード | type | parent_id | 秒数 |
|---|---|---|---|
| id=1 | `opening` | null | 〜11秒（80文字以内）|
| id=2〜5 | `qa` | "1" | 各8〜12秒 |
| id=2-1, 2-2 … | `qa_detail` | 親のid | 各10〜15秒 |

> 計算式: 1秒 ≒ 7文字

---

## 6. 目的別プロンプト戦略

### CV最大化
- **トーン**: 行動喚起型・断定的
- 各ノードに必ずCTA（申し込み・問い合わせ・購入・無料相談など）を含める
- ベネフィットは具体的な数字・実績・事例で表現
- 緊急性・限定性のある表現を使用（「今だけ」「先着○名」など）
- Opening で最も強いベネフィットを冒頭提示
- 末端ノードで明確なアクション（フォーム・電話・LINEなど）へ誘導
- **情報源制約**: サイト取得情報のみ使用。不明な場合は「詳しくはサイトをご覧ください」

### 理解促進
- **トーン**: 教育的・フレンドリー
- 専門用語を噛み砕いて説明
- 図解・例え話・ステップ構成を意識
- 「なぜ？→どうやって？→具体的には？」の順で展開
- Opening で視聴者の疑問を代弁
- 各分岐で機能・特徴・仕組みを掘り下げ
- CTAは詳細ページ・導入事例・ヘルプガイドへ誘導
- **情報源制約**: サイト取得情報のみ使用。不明な場合は「詳しくはサイトをご覧ください」

---

## 7. UI/UX仕様

### カラーテーマ（盆栽グリーン）

| 用途 | カラーコード |
|---|---|
| メインアクセント（ボタン・バッジ） | `#2D5016` |
| ホバー・セカンダリ | `#4A7C2C` |
| アクティブボタン背景 | `#1a1f15` |
| リンク色 | `#6B9D3E` |
| アプリ背景 | `#0d0d0d` |
| パネル背景 | `#141414` |

### レイアウト
- シングルページアプリケーション（SPA）
- 最大幅 1440px・中央揃え
- ダークテーマ固定

### 編集機能
- 編集対象フィールド: `Script`（textarea）、`CTA Label`（input）、`CTA Link`（input）
- 行単位の編集モード（同時に複数行は編集不可）
- 編集中セルは背景色 `rgba(45,80,22,.08)` でハイライト
- 保存: ローカルstateを更新（APIへの送信なし）

### リアルタイム計算
- 文字数: `script.length`
- 秒数: `Math.ceil(script.length / 7)`
- 編集中はtextareaの入力値からリアルタイム更新

---

## 8. API仕様

### POST `/api/fetch-url`

**リクエスト**
```json
{ "url": "https://example.co.jp" }
```

**レスポンス**
```json
{
  "url": "https://example.co.jp",
  "title": "ページタイトル",
  "ogTitle": "OGタイトル",
  "metaDescription": "メタ説明文",
  "ogDescription": "OG説明文",
  "keywords": "キーワード",
  "headings": ["見出し1", "見出し2", "..."],
  "links": [{ "text": "リンクテキスト", "href": "https://..." }],
  "bodyText": "本文テキスト（最大5000文字）"
}
```

**本文抽出優先順位**
1. `<main>` タグ内
2. `<article>` タグ内
3. `id` / `class` に "content" を含む要素内
4. フォールバック: body全体

---

### POST `/api/generate`

**リクエスト**
```json
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 4000,
  "system": "（システムプロンプト）",
  "messages": [{ "role": "user", "content": "サイト情報テキスト" }]
}
```

**レスポンス（Claude APIをそのままプロキシ）**
```json
{
  "content": [{ "type": "text", "text": "{...QAset JSON...}" }]
}
```

**生成JSONスキーマ**
```json
{
  "company_name": "企業名",
  "brand_color": "#HEX",
  "nodes": [
    {
      "id": "1",
      "parent_id": null,
      "type": "opening",
      "label": "Opening",
      "question": "Opening",
      "script": "スクリプト本文",
      "chars": 80,
      "seconds": 11,
      "cta_label": "CTA文言",
      "cta_link": "https://...",
      "detail_label": null,
      "detail_link": null
    }
  ]
}
```

---

## 9. ファイル構成

```
bonsai-cast-QAset-generator/
│
├── App.jsx              # メインアプリ（UI・ロジック全体）
├── index.html           # HTMLエントリーポイント
├── package.json         # 依存関係定義
├── vite.config.js       # Viteビルド設定
├── vercel.json          # Vercelデプロイ設定
├── SPEC.md              # 本仕様書
│
├── src/
│   └── main.jsx         # Reactルート（ReactDOM.render）
│
└── api/                 # Vercel Serverless Functions
    ├── fetch-url.js     # 企業サイトURL取得・解析
    └── generate.js      # Claude API呼び出しプロキシ
```

---

## 10. 環境変数

| 変数名 | 説明 | 設定場所 |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API キー | Vercel 環境変数 |

---

## 11. デプロイ手順

```bash
# 1. GitHubにプッシュ
git push origin main

# 2. Vercelが自動デプロイ（GitHub連携済みの場合）

# ローカル開発
npm install
npm run dev
```
