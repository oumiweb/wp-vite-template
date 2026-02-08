# 投稿一括作成ガイド

このプロジェクトでは、JSONファイルからWordPressの投稿を一括作成できます。

## 📁 ディレクトリ構造

```
post-data/
├── posts-news.json      # ニュース投稿用
├── posts-works.json     # 制作実績用
├── posts-sample.json    # 汎用サンプル
└── README.md            # このファイル
```

## 📋 利用可能なサンプルファイル

### 1. `posts-news.json` - ニュース投稿用

通常投稿（post）タイプのニュース記事を一括作成します。

```bash
yarn wp-post:create post-data/posts-news.json
```

**内容**:
- 新サービスリリースのお知らせ
- WordPressアップデート情報
- 開発ガイドの公開情報
- FLOCSS設計のベストプラクティス
- Viteプラグインのカスタマイズ方法（下書き）

### 2. `posts-works.json` - 制作実績用

カスタム投稿タイプ「works」（制作実績）を一括作成します。

```bash
yarn wp-post:create post-data/posts-works.json
```

**内容**:
- コーポレートサイト制作
- ECサイト構築プロジェクト
- ランディングページ制作
- メディアサイト構築
- 会員制サイト開発（下書き）

### 3. `posts-sample.json` - 汎用サンプル

基本的なサンプル投稿です。カスタマイズの参考にしてください。

```bash
yarn wp-post:create post-data/posts-sample.json
```

## 📝 JSONファイルの形式

```json
[
  {
    "title": "投稿タイトル",
    "content": "本文内容（複数行可）",
    "status": "publish",
    "postType": "post",
    "categories": [],
    "tags": "タグ1,タグ2"
  }
]
```

### フィールド説明

- `title` (必須): 投稿タイトル
- `content` (オプション): 本文（複数行可、Markdown記法も使用可能）
- `status` (オプション): 
  - `publish` - 公開（デフォルト）
  - `draft` - 下書き
  - `pending` - 承認待ち
- `postType` (オプション):
  - `post` - 通常投稿（ニュース）（デフォルト）
  - `works` - 制作実績
- `categories` (オプション): カテゴリID（配列 `[1, 2]` または文字列 `"1,2"`）
- `tags` (オプション): タグ（カンマ区切り文字列）
- `author` (オプション): 作成者ID（デフォルト: `1`）

## 🚀 使い方

### 1. 対話形式で作成

```bash
yarn wp-post:create
```

対話形式で1件ずつ投稿を作成できます。

### 2. JSONファイルから一括作成

```bash
# ニュース投稿を一括作成
yarn wp-post:create post-data/posts-news.json

# 制作実績を一括作成
yarn wp-post:create post-data/posts-works.json

# カスタムJSONファイルから作成
yarn wp-post:create post-data/my-custom-posts.json
```

### 3. コマンドライン引数で直接作成

```bash
yarn wp-post:create "投稿タイトル" "本文内容" "publish"
```

## ⚠️ 注意事項

- WordPress環境が起動している必要があります（`yarn wp-start`）
- カテゴリIDを指定する場合は、事前にWordPress管理画面でカテゴリを作成してください
- 制作実績（works）を作成する場合は、`postType: "works"` を指定してください

## 📊 実行例

```bash
$ yarn wp-post:create post-data/posts-news.json

[create-post] 5件の投稿を作成します...

[create-post] [1/5] 新サービス「Vite + WordPress開発環境」をリリースしました を作成中...
[create-post]   ✓ 作成成功 (ID: 123)
[create-post] [2/5] WordPress 6.4への対応を完了しました を作成中...
[create-post]   ✓ 作成成功 (ID: 124)
...

=== 作成結果 ===
[create-post] 成功: 5件

作成された投稿:
[create-post]   - 新サービス「Vite + WordPress開発環境」をリリースしました (ID: 123)
[create-post]     http://localhost:8888/?p=123
...
```

## 🔧 カスタマイズ

サンプルファイルをコピーして、プロジェクトに合わせてカスタマイズできます：

```bash
# サンプルをコピー
cp post-data/posts-news.json post-data/my-custom-posts.json

# 編集
# post-data/my-custom-posts.json を編集

# 実行
yarn wp-post:create post-data/my-custom-posts.json
```
