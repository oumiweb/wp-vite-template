# ドキュメントマップ

このディレクトリには、開発・運用のガイドラインが格納されています。入口はルートの [README.md](../README.md) です。

## doc 一覧

| ファイル | 内容 |
|----------|------|
| [TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md) | **テンプレート使い分け**（URL→テンプレート対応・パーツ構成）⭐ テンプレート作成時は必読 |
| [WORDPRESS_SETUP.md](./WORDPRESS_SETUP.md) | WordPress 初期設定・運用・トラブルシューティング |
| [ACF_GUIDE.md](./ACF_GUIDE.md) | ACF 設定・フィールドの使い方 |
| [coding-guidelines.md](./coding-guidelines.md) | コーディング規則 |
| [pr-issue-guidelines.md](./pr-issue-guidelines.md) | PR / Issue 運用（任意） |

## 読み方の目安

- **初めて使う**: [README.md](../README.md) → [WORDPRESS_SETUP.md](./WORDPRESS_SETUP.md)
- **テンプレートを触る**: [TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md)
- **コード規則**: [coding-guidelines.md](./coding-guidelines.md)
- **PR/Issue**: [pr-issue-guidelines.md](./pr-issue-guidelines.md)

## 稼働確認の目安

以下の手順で問題なく動く状態か確認できます。

| 確認項目 | コマンド・操作 |
|----------|----------------|
| 依存関係 | `yarn` が完了すること |
| 静的開発 | `yarn dev` で http://localhost:5173 が開き、Vite + SCSS 監視が動くこと |
| WordPress 用ビルド | `yarn build:wp` で `wordpress/themes/{THEME_NAME}/assets/` に出力されること |
| WordPress 起動 | Docker 起動後 `yarn wp-start`（初回は時間がかかる）→ http://localhost:8888 |
| 本番同様の読み込み | `.wp-env.json` の `WP_DEBUG` を `false` にし、ビルド後にテーマの CSS/JS が読めること |

- テーマ名は **プロジェクトルートのディレクトリ名**（例: `wp-template`）です。`bin/utils/paths.js` と Vite のビルド先がこれに依存しています。
- `yarn dev` は `concurrently` で `watch:scss` と `vite` を並行実行します。Windows でも動作します。

---

## 更新時

ドキュメントを変更したら、関連する他ファイルのリンク・参照もあわせて更新してください。
