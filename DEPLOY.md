# GitHub へのプッシュと Vercel での公開手順

このプロジェクトはすでに Git の初期コミットまで完了しています。  
以下の手順を**ご自身の環境（ターミナル）**で実行すると、GitHub へのプッシュと Vercel での公開ができます。

---

## 1. GitHub に新しいリポジトリを作成

1. [GitHub](https://github.com/new) にアクセスしてログインします。
2. **Repository name** に `ohanashi-ai` と入力します。
3. **Public** を選択し、**「Add a README file」などは追加せず**に、**Create repository** をクリックします。
   - 空のリポジトリのままにしてください。

---

## 2. リモートの URL をあなたのアカウントに合わせる

このプロジェクトにはすでに `origin` が次のように設定されています。

- `https://github.com/o3qk/ohanashi-ai.git`

別のアカウントでプッシュする場合のみ、次のコマンドで URL を書き換えてください。

```bash
cd /Users/zero/Desktop/Ohanashi-AI
git remote set-url origin https://github.com/<あなたのGitHubユーザー名>/ohanashi-ai.git
```

---

## 3. GitHub にプッシュする

ターミナルでプロジェクトフォルダに移動し、次のコマンドを実行します。

```bash
cd /Users/zero/Desktop/Ohanashi-AI
git push -u origin main
```

- 認証を求められたら、GitHub のユーザー名と **Personal Access Token（パスワードの代わり）** を入力するか、SSH を使っている場合はそのままプッシュできます。
- 初回プッシュが成功すると、GitHub の `https://github.com/<ユーザー名>/ohanashi-ai` にコードが反映されます。

---

## 4. Vercel でプロジェクトとして連携し、デプロイする

1. [Vercel](https://vercel.com) にログインし、**Add New…** → **Project** を選択します。
2. **Import Git Repository** で、GitHub の **ohanashi-ai** リポジトリを選択します。
3. **Configure Project** で次のように設定します。
   - **Framework Preset**: Next.js のまま
   - **Root Directory**: そのまま（変更不要）
   - **Environment Variables** で以下を追加します（本番用）:
     - `GEMINI_API_KEY` = あなたの Google Gemini API キー（[Google AI Studio](https://aistudio.google.com/apikey) で無料発行）
     - `VOICEVOX_BASE_URL` = VOICEVOX Web API のベース URL
     - `VOICEVOX_API_KEY` = VOICEVOX API キー
4. **Deploy** をクリックしてデプロイを開始します。
5. ビルドが完了すると、**Congratulations** 画面に **公開URL** が表示されます。
   - 例: `https://ohanashi-ai-xxxx.vercel.app`
   - この URL が「お話AI」の公開アドレスです。

---

## 5. 公開URLの確認

- Vercel のダッシュボード → 対象プロジェクト → **Domains** またはデプロイ完了画面で、表示された URL をコピーしてブラウザで開くと、公開された「お話AI」を確認できます。
- 今後、`main` ブランチにプッシュするたびに、Vercel が自動で再デプロイします。

---

## トラブルシューティング

- **プッシュ時に認証エラーになる**  
  GitHub の **Settings → Developer settings → Personal access tokens** でトークンを作成し、パスワードの代わりにそのトークンを入力してください。
- **Vercel のビルドが失敗する**  
  **Environment Variables** に上記3つ（`GEMINI_API_KEY`、`VOICEVOX_BASE_URL`、`VOICEVOX_API_KEY`）が正しく設定されているか確認し、**Redeploy** を試してください。
