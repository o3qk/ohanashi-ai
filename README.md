# お話AI

5歳の孫「はなちゃん」や、近所のおねえさん・頭のいいおじさまとおしゃべりできる Web アプリです。  
Next.js(App Router) + Tailwind CSS + VOICEVOX Web API + Web Speech API で動作します。

## 必要なもの

- Node.js (推奨: 18 以上)
- npm または pnpm / yarn
- OpenAI の API キー
- VOICEVOX Web API（クラウド）のエンドポイントと API キー

## セットアップ手順

1. 依存パッケージのインストール

```bash
npm install
```

2. 環境変数ファイルの作成

プロジェクト直下に `.env.local` ファイルを作成し、次のように設定します。

```bash
OPENAI_API_KEY=あなたのOpenAIのAPIキー
OPENAI_MODEL=gpt-4.1-mini

VOICEVOX_BASE_URL=あなたのVOICEVOX Web APIのベースURL
VOICEVOX_API_KEY=あなたのVOICEVOX APIキー
```

> VOICEVOX の話者 ID はデフォルトで `2` を利用します（計画どおり）。

## 開発サーバーの起動方法

次のコマンドで開発サーバーを起動できます。

```bash
npm run dev
```

起動後、ブラウザで `http://localhost:3000` を開くと「お話AI」が表示されます。

## 画面の使い方

- **キャラクター選択**: 画面上部の大きな3つのボタンから、「はなちゃん」「近所のおねえさん」「おじさま」を選べます。
- **テキストで会話**: 中央のテキスト入力欄に文字を入れて「そうしん」ボタン、または Enter キーで送信できます。
- **音声で会話**: 画面下部の「話す」ボタンを押すと、ブラウザの Web Speech API で音声認識を開始します（対応ブラウザのみ）。
- **返信モード**: 「テキストだけ」「声だけ」「声 + テキスト」から選べます。
- **返答のはやさ**: スライダーで VOICEVOX の `speedScale` を 0.5〜2.0 倍の範囲で変更できます。
- **とめるボタン**: 音声認識中・音声再生中・返答中の処理を途中で止めたいときに使います。

## ファイル構成（主なもの）

- `app/page.tsx` … 画面全体の状態管理とレイアウト
- `app/api/chat/route.ts` … OpenAI を使った会話API
- `app/api/voice/route.ts` … VOICEVOX Web API 経由で音声を生成するAPI
- `components/` … キャラクター表示・入力欄・ボタンなどUIコンポーネント
- `utils/speechRecognition.ts` … Web Speech API を扱うためのラッパー
- `utils/chatClient.ts` … `/api/chat` を呼び出すクライアント
- `utils/voicevoxClient.ts` … `/api/voice` を呼び出して音声を再生するクライアント

## 注意点

- Web Speech API はブラウザ依存です。Chrome など対応ブラウザでの利用を想定しています。
- VOICEVOX Web API の仕様や URL 形式は、利用するサービスに合わせて `app/api/voice/route.ts` を調整してください。

