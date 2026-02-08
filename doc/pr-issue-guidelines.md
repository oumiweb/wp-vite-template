# PR・Issue ガイドライン

このドキュメントは、本プロジェクトにおけるプルリクエスト（PR）とIssueの運用ルールを定めたものです。

## ブランチ運用

### ブランチ命名規則

ブランチ名は以下の形式に従います：

```
<type>/<summary>
```

**typeの種類**:

- `feature/`: 新機能追加
- `fix/`: バグ修正
- `update/`: 機能改善・更新
- `refactor/`: リファクタリング
- `docs/`: ドキュメント更新
- `style/`: スタイル調整（機能変更なし）

**例**:

```
feature/add-header-component
fix/resolve-drawer-scroll-issue
update/optimize-image-loading
refactor/improve-code-structure
```

### ブランチ戦略

このプロジェクトでは**GitHub Flow**を採用しています：

1. **mainブランチ**: 本番環境にデプロイ可能な状態を常に保つ
2. **featureブランチ**: 機能追加・修正は個別のブランチで作業
3. **直接mainへのpush禁止**: すべての変更はPR経由でマージ

**基本的なフロー**:

```bash
# 最新のmainブランチを取得
git checkout main
git pull origin main

# 新しいブランチを作成
git checkout -b feature/add-new-component

# 変更をコミット
git add .
git commit -m "add: 新規コンポーネント追加"

# ブランチをプッシュ
git push origin feature/add-new-component
```

## コミットメッセージ

コミットメッセージは以下の形式に従います：

```
<type>: <summary>
```

**typeの種類**:

- `add`: 新規追加
- `fix`: バグ修正
- `update`: 更新・改善
- `refactor`: リファクタリング
- `style`: スタイル調整
- `docs`: ドキュメント更新
- `chore`: ビルドプロセスやツールの変更

**例**:

```
add: ヘッダーコンポーネント追加
fix: ドロワーメニューのスクロール問題を修正
update: 画像読み込み最適化
refactor: アニメーション関数の整理
```

## プルリクエスト（PR）

### PR作成前の確認事項

1. ✅ コードが動作することを確認
2. ✅ `yarn format`を実行してフォーマット済み
3. ✅ Lintエラーがないことを確認
4. ✅ 関連するIssueがあれば紐づける

### PRの作成

1. **タイトル**: コミットメッセージと同じ形式（`<type>: <summary>`）
2. **説明**: PRテンプレートに従って記入
3. **レビュワー**: 適切なレビュワーをアサイン
4. **ラベル**: 必要に応じてラベルを設定

**PRテンプレートの項目**:

- 概要: PRの目的・概要
- 対応ページ or 変更内容: 変更したページや内容
- やらないこと: このPRで対応しない内容
- 特にレビューをお願いしたい箇所: 重点的に確認してほしいポイント
- 報告及び共有事項: 報告や共有が必要な情報

### PRのサイズ

- **推奨**: 1つのPRは1つのテーマに集中
- **避ける**: 複数の機能や修正を1つのPRに含めない
- **大きいPRの場合**: テーマごとに細かく分割する

### レビュー対応

- レビューコメントには必ず返信する
- 修正内容はコメントに記載する
- 修正完了後は再レビュー依頼を行う
- 質問や不明点があれば積極的に質問する

### マージ

- **マージ権限**: Approve後のPRのマージは**PR作成者**が行う
- **マージ方法**: 通常は「Create a merge commit」を使用
- **マージ後の処理**: マージ後はローカルのブランチを削除

```bash
# マージ後、ローカルブランチを削除
git checkout main
git pull origin main
git branch -d feature/add-new-component
```

## Issue管理

### Issueの作成

- **タイトル**: 問題や要望を簡潔に記載
- **説明**: 再現手順、期待される動作、実際の動作を記載
- **ラベル**: 適切なラベルを設定（`bug`, `enhancement`, `question`など）
- **アサイン**: 担当者が決まっている場合はアサインする

### IssueとPRの連携

- **PR作成時**: 関連するIssueを「Development」セクションに紐づける
- **自動クローズ**: PRがマージされると、関連するIssueも自動でクローズされる
- **クローズ方法**: Issueをクローズする場合は、対応するPRのリンクを記載

**IssueとPRの紐づけ方法**:

- PRの説明欄に`Closes #123`や`Fixes #123`と記載
- PRのサイドバー「Development」セクションからIssueを選択

## コードレビュー

### レビューの観点

1. **コード品質**: 可読性、保守性、パフォーマンス
2. **コーディング規約**: [コーディングガイドライン](./coding-guidelines.md)に準拠しているか
3. **テスト**: 動作確認ができているか
4. **ドキュメント**: 必要なコメントやドキュメントが追加されているか

### レビュー時の注意点

- **建設的なフィードバック**: 問題点だけでなく、改善案も提示する
- **承認基準**: 明確な承認基準を共有する
- **迅速な対応**: レビューリクエストは24時間以内に対応する

## トラブルシューティング

### コンフリクトの解決

```bash
# mainブランチの最新を取得
git checkout main
git pull origin main

# 自分のブランチに戻る
git checkout feature/add-new-component

# mainブランチをマージしてコンフリクトを解決
git merge main

# コンフリクトを解決後、コミット
git add .
git commit -m "fix: コンフリクト解決"

# プッシュ
git push origin feature/add-new-component
```

### PRが大きくなってしまった場合

1. ブランチを分割する
2. 小さなPRに分けて順次マージする
3. または、WIP（Work In Progress）として段階的にレビューする

---

> **Note**: 本ガイドラインはプロジェクトの運用を円滑にするためのものです。
> チームの状況に応じて、適宜調整してください。
