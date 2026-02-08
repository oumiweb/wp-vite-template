# bin/ ディレクトリ

WordPress 開発環境のビルドと運用を支援するスクリプト・プラグインを格納しています。  
テーマ名（`{THEME_NAME}`）はプロジェクトルートのディレクトリ名（例: `wp-template`）です。

---

## 各スクリプトの役割

| ファイル | 種類 | 役割 |
|----------|------|------|
| `create-post.js` | CLI | WordPress に投稿を一括作成（`yarn wp-post:create`） |
| `init-wp-options.js` | CLI | **WordPress の中身**の初期設定（オプション・固定ページ・シード投稿） |
| `update-wp-config.js` | CLI / Vite Plugin | **テーマまわり・設定ファイル**の同期（.wp-env、style.css、DB のテーマ名） |
| `validate-acf-json.js` | CLI | ACF フィールドグループ JSON の検証（`yarn validate:acf`） |
| `vite-plugin-convert-images.js` | Plugin | 開発時に画像を WebP/AVIF に変換（src と WordPress 双方へ出力） |
| `watch-scss-globs.js` | CLI | SCSS の追加・削除を監視し、Vite の glob 展開を促す |

### utils/

| ファイル | 役割 |
|----------|------|
| `paths.js` | プロジェクトルート・テーマ名・よく使うパスの定義 |
| `logger.js` | ログ出力の統一 |
| `fs-utils.js` | ファイル操作の共通化 |
| `wp-env.js` | wp-env 関連ユーティリティ（起動判定・CLIコンテナ管理） |

---

## wp-init と update-wp-config の違い

| 観点 | **init-wp-options**（`yarn wp-init`） | **update-wp-config**（`yarn update:wp-config`） |
|------|--------------------------------------|-----------------------------------------------|
| **何を扱うか** | **WordPress の「中身」**（DB のオプション・固定ページ・投稿） | **テーマ名まわりと設定ファイル**（.wp-env、style.css、DB のテーマ名） |
| **いつ使うか** | 環境を立ち上げたあと、**初回 or 設定を揃え直したいとき** | プロジェクト名を変えた・テーマディレクトリを揃えたい・**wp-start の前** |
| **前提** | wp-env が **起動済み** | ファイルがあれば **起動前でも** .wp-env / style.css は更新可能。DB 更新だけ起動必須 |
| **設定元** | `config/wp-options.json` | プロジェクトルート名・`wordpress/themes/` の実体 |

**運用のイメージ**

1. **初回 or 環境をきれいにしたいとき**  
   `yarn wp-start` → `yarn wp-init` でタイムゾーン・パーマリンク・フロントページ・シード投稿を適用。
2. **プロジェクト名を変えた・テーマパスを揃えたいとき**  
   `yarn update:wp-config` で .wp-env.json と style.css を更新。必要なら `yarn wp-start` のあと DB のテーマ名も更新される（`--db` はデフォルトで有効）。
3. **毎回の起動**  
   `yarn wp-start` のなかで `update-wp-config.js --wp-env` が実行され、.wp-env のテーマパスが同期される。

---

## 各スクリプトの詳細

### create-post.js

- **実行**: `yarn wp-post:create [JSONパス]` または `yarn wp-post:create`（対話）
- WordPress が起動している必要あり。  
- **参照**: [post-data/README.md](../post-data/README.md)

### init-wp-options.js

- **実行**: `yarn wp-init`
- **設定**: `config/wp-options.json`（未指定時はスクリプト内のデフォルト）
- タイムゾーン・日付形式・パーマリンク・フロント/投稿ページ・シード投稿を作成。
- **wp-env 10対応**: 
  - `spawnSync`を使用してコマンド実行（`execSync`から変更）
  - CLIコンテナの起動確認・自動起動処理を実装
  - `wp-env start`だけではCLIコンテナが起動しない場合があるため、明示的に起動処理を実行
- **参照**: [doc/WORDPRESS_SETUP.md](../doc/WORDPRESS_SETUP.md)

### update-wp-config.js

- **実行**: `yarn update:wp-config` または `node bin/update-wp-config.js [--wp-env] [--db] [--style-css]`
- **役割**:
  - `.wp-env.json` のテーマパス（とプラグイン）更新
  - `wordpress/themes/{THEME_NAME}/style.css` の Theme Name 更新
  - 既存テーマディレクトリをプロジェクト名にリネーム
  - （起動中なら）DB の `template` / `stylesheet` オプション更新
- Vite プラグインとしても使用され、ビルド/開発サーバー起動時に style.css を更新。  
- `yarn wp-start` では事前に `--wp-env` が実行される。

### validate-acf-json.js

- **実行**: `yarn validate:acf`
- `wordpress/themes/{THEME_NAME}/acf-json/` 内の JSON を構文・必須キー・キー形式で検証。

### vite-plugin-convert-images.js

- **使用**: `vite.config.js` からインポート（開発環境時のみ有効）
- **機能**:
  - `src/assets/images/` の PNG/JPEG を WebP/AVIF に変換
  - 変換後を `src/assets/images/` と `wordpress/themes/{THEME_NAME}/assets/images/` の両方に出力
- **設定**:
  - `vite.config.js` の `convertImages({ format: "webp", copyOriginal: false })` で形式と元画像コピー有無を指定
- **本番ビルド**:
  - 画像の最適化は `vite-plugin-image-optimizer` が担当

### watch-scss-globs.js

- `src/assets/styles/` の components / layouts / projects / utilities を監視。ファイル追加・削除時に `style.scss` のタイムスタンプを更新し、Vite に glob の再展開を促す。

---

## wp-env.js ユーティリティ関数

`bin/utils/wp-env.js` には以下の関数が定義されています：

- **`isWordPressEnvRunning()`**: WordPress環境（wp-env）が起動しているかどうかを判定
- **`isCliContainerRunning()`**: CLIコンテナが起動しているかどうかを確認
- **`ensureCliContainerRunning()`**: CLIコンテナを確実に起動する（必要に応じて）
  - `wp-env 10`では、`wp-env start`だけではCLIコンテナが起動しない場合があるため、明示的に起動処理を実行
  - 最大60秒のタイムアウトで起動を待機

**注意**: `wp-env` 10を使用している場合、CLIコンテナの起動に時間がかかる場合があります。`yarn wp-init`を実行する前に、`yarn wp-start`でWordPress環境を起動しておくことを推奨します。

---

## 関連ドキュメント

- [README.md](../README.md) — プロジェクト概要・クイックスタート
- [doc/WORDPRESS_SETUP.md](../doc/WORDPRESS_SETUP.md) — WordPress 初期設定・プラグイン
- [post-data/README.md](../post-data/README.md) — 投稿一括作成
- [config/wp-options.json](../config/wp-options.json) — `yarn wp-init` の設定
