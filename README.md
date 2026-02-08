# WordPress開発環境テンプレート

Vite + FLOCSS + WordPress を使用したモダンなWordPressテーマ開発環境です。静的サイト開発にも対応していますが、**WordPress開発を主な用途として想定**しています。

---

## 目次

- [クイックスタート](#クイックスタート)
- [必要環境](#必要環境)
- [WordPress開発の流れ](#wordpress開発の流れ)
- [開発コマンド一覧](#開発コマンド一覧)
- [ガイドライン・ドキュメント](#ガイドラインドキュメント)
- [よくある問題と解決方法](#よくある問題と解決方法)
- [ライセンス](#ライセンス)

---

## クイックスタート

### 初回セットアップ（WordPress開発）

1. **依存関係のインストール**

   ```**bash**
   yarn
   ```

2. **Docker Desktopの起動**

   - [Docker Desktop](https://matsuand.github.io/docs.docker.jp.onthefly/get-docker/)をインストール
   - Docker Desktopアプリを起動し、ステータスバーに`running`と表示されていることを確認
   - **重要**: このプロジェクトは`@wordpress/env` 10を使用しており、**Docker Compose V2が必須**です

3. **WordPress環境の起動**

   ```bash
   yarn wp-start
   ```

   - 初回はWordPressコアとプラグインのダウンロードに時間がかかります（5-10分程度）
   - 完了すると `http://localhost:8888` でWordPressにアクセスできます
   - **言語設定は自動的に日本語になります**（`.wp-env.json` の `WPLANG: "ja"` 設定により）

4. **WordPress初期設定の適用**（初回のみ）

   ```bash
   yarn wp-init
   ```

   - タイムゾーン、パーマリンク、フロントページ、シード投稿を自動設定
   - **テーマの有効化も自動で実行されます**（手動操作不要）
   - 設定は `config/wp-options.json` でカスタマイズ可能

5. **開発サーバーの起動**（別ターミナル）

   ```bash
   yarn dev
   ```

   - `http://localhost:5173` でVite開発サーバーが起動します
   - このサーバーは起動したままでOKです

6. **WordPress管理画面にログイン**（初回のみ）

   - URL: `http://localhost:8888/wp-admin/`
   - ID: `admin`
   - パスワード: `password`
   - **言語設定は既に日本語になっています**

---

## 必要環境

### 共通

- **Node.js**: v20.19.0以上（推奨: v22.12.0以上）
- **パッケージマネージャー**: Yarn（npmは使用禁止）

### WordPress開発の場合のみ

- **Docker Desktop**: 必須（**最新版推奨**）
  - [インストール方法](https://www.docker.com/products/docker-desktop/)
  - アプリを起動し、ステータスバーに`running`と表示されていることを確認
  - **重要**: **Docker Compose V2が必要です**（Docker Desktop 4.4.2以降に標準で含まれています）

### Windows環境での動作について

このプロジェクトは**Windows環境でも正しく動作します**。

- すべてのスクリプトはクロスプラットフォーム対応（Node.jsスクリプトを使用）
- パスの扱いは`path.resolve`や`path.join`を使用しており、Windowsでも正しく動作
- Docker DesktopはWindowsでも動作します

**注意事項**:

- Windows環境でも`yarn`コマンドを使用してください（`npm`は使用禁止）
- PowerShell、コマンドプロンプト、Git Bashのいずれでも動作します

---

## WordPress開発の流れ

### プロジェクト全体の構築フロー

```
1. 環境準備
   ├─ Node.js v20.19.0以上をインストール
   ├─ Docker Desktopをインストール・起動（Docker Compose V2が必要）
   └─ プロジェクトをクローン or ZIP展開

2. 依存関係のインストール
   └─ yarn

3. WordPress環境の構築
   ├─ yarn wp-start（WordPress環境起動）
   ├─ yarn wp-init（初期設定・テーマ有効化）
   └─ yarn dev（開発サーバー起動）

4. 開発作業
   ├─ src/ フォルダでHTML/SCSS/JavaScript編集
   ├─ wordpress/themes/{THEME_NAME}/ でPHP/テンプレート編集
   ├─ WordPress管理画面でコンテンツ作成
   └─ ブラウザで確認（localhost:8888）

5. ビルド・デプロイ
   └─ yarn build:wp（WordPress用ビルド）
```

### 開発作業の流れ

1. **WordPress環境の起動**

   ```bash
   yarn wp-start
   ```

2. **開発サーバーの起動**（別ターミナル）

   ```bash
   yarn dev
   ```

3. **開発作業**

   - **フロントエンド**: `src/` フォルダ内でHTML/SCSS/JavaScriptを編集
   - **WordPressテーマ**: `wordpress/themes/{THEME_NAME}/` でPHP/テンプレートを編集
   - **コンテンツ**: WordPress管理画面（`http://localhost:8888/wp-admin/`）でコンテンツを作成
   - **確認**: `http://localhost:8888` で確認しながら開発

4. **変更の反映**

   - SCSS/JavaScript/PHP: 自動的に反映されます（HMR対応）

5. **終了時**

   ```bash
   yarn wp-stop
   ```

### 重要なポイント

- **テーマ有効化**: `yarn wp-init` で自動実行されるため、管理画面での手動操作は不要です
- **開発サーバー**: `yarn dev` は起動したままでOKです。WordPress環境と併用できます
- **ファイル編集**: `src/` フォルダ内のファイルを編集すると、自動的にWordPressテーマに反映されます
- **ビルド**: 本番環境用のビルドは `yarn build:wp` で実行します
- **言語設定**: `.wp-env.json` の `WPLANG: "ja"` 設定により、`yarn wp-start` 時に自動的に日本語版WordPressがインストールされ、言語設定も日本語になります

---

## 開発コマンド一覧

| 種別   | コマンド                          | 説明 |
|--------|-----------------------------------|------|
| 開発   | `yarn dev`                        | 開発サーバー起動（Vite + SCSS監視）→ `localhost:5173` |
| ビルド | `yarn build:wp`                   | WordPress用ビルド → `wordpress/themes/{THEME_NAME}/` |
| WP環境 | `yarn wp-start` / `yarn wp-stop`  | WordPress起動・停止 → `localhost:8888` |
| WP環境 | `yarn wp-init`                    | WordPress初期設定（タイムゾーン・パーマリンク・フロントページ・シード投稿・**テーマ有効化**）。起動後に実行 |
| WP環境 | `yarn wp-contents:export` / `import` | コンテンツのエクスポート・インポート |
| WP環境 | `yarn update:wp-config`           | テーマ名・ディレクトリをプロジェクト名に合わせて更新 |
| WP環境 | `yarn wp-post:create`              | 投稿の一括作成（`post-data/` のJSONファイルを使用） |
| 品質   | `yarn format`                     | リント・フォーマット一括（自動修正） |
| 品質   | `yarn format:check`               | チェックのみ |
| 品質   | `yarn validate:acf`               | ACF-JSON のバリデーション |

`update:wp-config` のオプション: `--wp-env` / `--style-css` / `--db`。詳細は [bin/README.md](./bin/README.md) を参照。

品質チェックは手動で `yarn format`（自動修正）または `yarn format:check`（チェックのみ）を実行してください。

---

## ガイドライン・ドキュメント

| ドキュメント | 内容 |
|--------------|------|
| [doc/README.md](./doc/README.md) | doc 一覧・読み方 |
| [doc/TEMPLATE_GUIDE.md](./doc/TEMPLATE_GUIDE.md) | テンプレート使い分け・パーツ構成 |
| [doc/WORDPRESS_SETUP.md](./doc/WORDPRESS_SETUP.md) | WordPress 初期設定・プラグイン設定 |
| [doc/ACF_GUIDE.md](./doc/ACF_GUIDE.md) | ACF（Advanced Custom Fields）設定 |
| [doc/coding-guidelines.md](./doc/coding-guidelines.md) | コーディング規則 |
| [doc/pr-issue-guidelines.md](./doc/pr-issue-guidelines.md) | PR・Issueガイドライン（任意） |
| [bin/README.md](./bin/README.md) | スクリプト・プラグインの詳細 |

**説明動画**: [こちら](https://defiant-crow-3a6.notion.site/1cd5a20fea11451aa4c16f1490afeea8?pvs=4)

---

## 画像の格納先と読み込み方

画像は **`src/assets/images/`** に配置します。開発時は PNG/JPG が WebP/AVIF に変換されます。

- **HTML**: `<img src="/assets/images/logo.svg" alt="" width="200" height="200" />`
- **JS**: `import src from "/assets/images/logo.svg";` で読み込み
- **WordPress(PHP)**: `img_path('/logo.svg')` または `get_template_directory_uri() . '/assets/images/logo.svg'`（テーマの `functions-lib/func-url.php` で `img_path` を定義）

OGP・favicon は管理画面（外観→カスタマイズ / SEO Simple Pack）で設定。

---

## ビルドとWordPress

- **WordPress用ビルド**: `yarn build:wp` → `wordpress/themes/{THEME_NAME}/assets/` に出力（`{THEME_NAME}` はプロジェクトルート名）
- **開発時**（`WP_DEBUG=true`）: Vite（`localhost:5173`）から資産を読み込み
- **本番時**: 上記ビルド済み資産を読み込み。納品時はデバッグ用記述の削除を推奨

**管理画面**: `http://localhost:8888/wp-admin/`（ID: `admin` / パス: `password`）

**言語設定**: `.wp-env.json` の `WPLANG: "ja"` 設定により、`yarn wp-start` 時に自動的に日本語版WordPressがインストールされ、言語設定も日本語になります。

**コンテンツ同期**: `yarn wp-contents:export` / `yarn wp-contents:import`（単一バックアップ。PRで変更内容を記載推奨）

---

## よくある問題と解決方法

### Node.jsのバージョンエラー

**症状**: `yarn`や`yarn dev`を実行するとNode.jsのバージョンエラーが出る

**解決方法**:

1. Node.jsのバージョンを確認: `node --version`
2. Node.js v20.19.0以上が必要です（推奨: v22.12.0以上）
3. [Node.js公式サイト](https://nodejs.org/)から最新のLTS版をインストール
4. インストール後、ターミナルを再起動してから再度`yarn`を実行

### Docker Compose V2が必要です

**症状**: `yarn wp-start`を実行すると`docker-compose`コマンドが見つからない、またはエラーが出る

**原因**: このプロジェクトは`@wordpress/env` 10を使用しており、Docker Compose V2が必要です。Docker Compose V1は2023年7月に更新が停止され、現在はサポートされていません。

**解決方法**:

1. **Docker Desktopを最新版にアップデート**
   - [Docker Desktop公式サイト](https://www.docker.com/products/docker-desktop/)から最新版をダウンロード・インストール
   - Docker Desktop 4.4.2以降には、Docker Compose V2が標準で含まれています
   - インストール後、Docker Desktopを再起動してください

2. **Docker Compose V2がインストールされているか確認**
   ```bash
   docker compose version
   ```
   - 正常に動作する場合: `Docker Compose version v2.x.x` と表示されます
   - エラーが出る場合: Docker Desktopを最新版にアップデートしてください

3. **注意事項**
   - Docker Compose V2では、コマンドが`docker-compose`（ハイフンあり）から`docker compose`（スペース区切り）に変更されました
   - ただし、Docker Desktop 4.4.2以降では、`docker-compose`コマンドが自動的に`docker compose`にエイリアスされるため、既存のスクリプトでも動作します
   - `@wordpress/env`は内部で`docker compose`コマンドを使用するため、特に設定変更は不要です

### WordPress環境が起動しない

**症状**: `yarn wp-start`を実行してもエラーが出る

**解決方法**:

1. Docker Desktopが起動しているか確認（ステータスバーに`running`と表示されていること）
2. Docker Compose V2がインストールされているか確認（上記の「Docker Compose V2が必要です」を参照）
3. ポート8888が使用されていないか確認
4. 一度`yarn wp-stop`を実行してから、再度`yarn wp-start`を実行

### wp-initが失敗する

**症状**: `yarn wp-init`を実行すると「WordPress が起動しませんでした」というエラーが出る

**解決方法**:

1. **WordPress環境が起動しているか確認**
   ```bash
   yarn wp-start
   ```
   - 起動に時間がかかる場合があります（初回は5-10分程度）

2. **少し待ってから再実行**
   ```bash
   yarn wp-init
   ```
   - 初回起動時は時間がかかる場合があります

3. **それでも失敗する場合**
   - Docker Desktopを再起動
   - `yarn wp-stop` → `yarn wp-start` を再度実行
   - 数分待ってから `yarn wp-init` を再実行

### テーマが表示されない

**症状**: WordPress管理画面でテーマが表示されない

**解決方法**:

1. `yarn wp-start`実行時にテーマパスが正しく更新されているか確認
2. `wordpress/themes/{THEME_NAME}/style.css`が存在するか確認
3. `yarn wp-init`を実行してテーマを自動有効化（手動操作不要）
4. それでも表示されない場合は、管理画面の「外観」→「テーマ」で手動有効化

### SCSSの変更が反映されない

**症状**: SCSSファイルを編集しても変更が反映されない

**解決方法**:

1. `yarn dev`が起動しているか確認
2. `bin/watch-scss-globs.js`がバックグラウンドで実行されているか確認
3. Viteサーバーを再起動

### PHPファイルの変更が反映されない、または反映が遅い

**症状**: PHPファイルを編集しても変更が反映されない、または反映が遅い

**解決方法**:

1. **監視対象の確認**: `vite.config.js` で監視対象が正しく設定されているか確認
   - ルートPHPファイル（`*.php`）
   - テンプレートパーツ（`template-parts/**/*.php`）
   - 機能別関数ファイル（`functions-lib/**/*.php`、ただし`functions-lib/lib/`は除外）
2. **パフォーマンス改善**: 
   - ライブラリファイル（`functions-lib/lib/`）は監視対象外のため、変更してもリロードされません。必要に応じて手動リロードしてください
   - 監視対象を絞ることで、ファイル変更の検知が高速化されます
3. **キャッシュクリアと再起動**:
   - ブラウザのキャッシュをクリアして再読み込み
   - `yarn dev`を停止してから、`yarn`で依存関係を再インストール
   - `yarn dev`を再度起動して確認
4. **Viteサーバーの再起動**: 上記で解決しない場合は、`yarn dev`を再起動

### Sassの警告が出る

**症状**: `@use "layouts/**";` などで `The default namespace "**" is not a valid Sass identifier.` が表示される

**説明**:

- `vite-plugin-sass-glob-import` が解決するため実害はありません
- **警告は無視してOK** という運用です

### 画像が表示されない

**症状**: 画像が表示されない、または404エラーが出る

**解決方法**:

1. 画像の配置場所を確認: `src/assets/images/`
2. WordPress開発時は、PHPから画像を読み込む場合は`img_path()`関数を使用
3. ビルド後に画像が出力されているか確認（`wordpress/themes/{THEME_NAME}/assets/images/`）

### プラグインがインストールされない

**症状**: `yarn wp-start`実行後、プラグインがインストールされない

**解決方法**:

1. `.wp-env.json`の`plugins`配列を確認
2. プラグインのURLが正しいか確認
3. 初回起動時はプラグインのダウンロードに時間がかかります（5-10分程度）
4. ネットワーク接続を確認

---

## 静的サイト開発について（補足）

このテンプレートは静的サイト開発にも対応していますが、**WordPress開発を主な用途として想定**しています。

静的サイト開発を行う場合:

1. **依存関係のインストール**

   ```bash
   yarn
   ```

2. **開発サーバーの起動**

   ```bash
   yarn dev
   ```

3. **ブラウザで確認**: `http://localhost:5173` にアクセス

詳細は各ドキュメントを参照してください。

---

## ライセンス

このプロジェクトのライセンスについては、[LICENSE](./LICENSE) ファイルを参照してください。

**概要:**
- 個人・法人での実案件使用は許可
- 改変・カスタマイズは自由
- 成果物の商用利用は許可
- テンプレート自体の再配布・再販売は禁止

詳細は [LICENSE](./LICENSE) ファイルをご確認ください。
