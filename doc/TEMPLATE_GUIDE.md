# WordPressテンプレート使い分けガイド

このドキュメントでは、WordPressテンプレートファイルの使い分けと、このテーマのパーツ構成について説明します。  
「news」「works」などはテンプレート上のデモです。案件やチームのルールに応じて適宜変更してかまいません。

**注意**: このガイドに記載されている内容は、あくまでもこのプロジェクトでの考え方です。ご自身のコーディングルールやチームの方針に従って、適宜調整してください。

**関連ドキュメント**:
- [改善提案まとめ](./IMPROVEMENTS.md) - プロジェクト全体の改善点をまとめています

---

## どのページがどのテンプレートか

| URL（例） | テンプレート | 備考 |
|-----------|--------------|------|
| `/` | `front-page.php` | トップページ（固定フロント） |
| `/news/` または 投稿一覧 | `home.php` → `page-news-list` | 表示設定の「投稿ページ」で指定した固定ページのURLで表示。カテゴリ等は `archive.php` → `page-news-list` |
| `/works/` | `archive-works.php` | 制作実績一覧 |
| `/category/xxx/` など | `archive.php` | カテゴリ・タグ・日付・著者アーカイブ |
| `/news/記事スラッグ/` | `single.php` | 通常投稿の詳細 |
| `/works/実績スラッグ/` | `single-works.php` | 制作実績の詳細 |
| `/contact/` | `page-contact.php` | お問い合わせ（スラッグ一致で優先） |
| `/about/` など | `page.php` または `page-{slug}.php` | その他固定ページ |
| 存在しないURL | `404.php` | 404ページ |
| 上記のいずれにも当てはまらない場合 | `index.php` | 最終フォールバック |

---

## パーツ構成（template-parts）

共通で使う部品は `wordpress/themes/{THEME_NAME}/template-parts/` にあります。

### 共通パーツ（汎用）

| パーツ | 役割 | 主な呼び出し元 |
|--------|------|----------------|
| `header.php` | サイトヘッダー | 各テンプレート（`get_header()`） |
| `footer.php` | サイトフッター | 各テンプレート（`get_footer()`） |
| `section-title.php` | セクション見出し（英字＋日本語、装飾線） | front-page, archive 系, page-contact など |
| `pagination.php` | ページネーション | page-news-list（home/archive）, archive-works, archive-list |
| `adjust-admin-bar.php` | 管理バー表示時のレイアウト調整 | header.php など |

### ページ別パーツ

#### **front-page/**（トップページ専用）
| パーツ | 役割 | 呼び出し元 |
|--------|------|------------|
| `section-mv.php` | トップのメインビジュアル | front-page.php |
| `section-sample.php` | トップのサンプルセクション | front-page.php |

#### **archive/**（アーカイブ関連）
| パーツ | 役割 | 呼び出し元 |
|--------|------|------------|
| `archive-loop.php` | 一覧ループ・ページネーション・0件メッセージの共通処理 | archive-list, news-list, works-list から呼ばれる |
| `archive-list.php` | 汎用アーカイブリスト（内部で archive-loop を利用） | archive.php |
| `archive-card.php` | 汎用カード（アーカイブ一覧） | archive-list 経由 |
| `news-list.php` | ニュース一覧リスト（内部で archive-loop を利用） | page-news-list（home.php / archive.php から利用） |
| `news-card.php` | ニュースカード | news-list 経由 |
| `works-list.php` | 制作実績一覧（フィルタ＋archive-loop） | archive-works.php |
| `works-card.php` | 制作実績カード | works-list 経由 |

#### **single/**（シングルページ専用）
| パーツ | 役割 | 呼び出し元 |
|--------|------|------------|
| `header.php` | 汎用シングルページのヘッダー部分（タイトル、メタ情報、カテゴリー、サマリー） | single.php |
| `body.php` | 汎用シングルページのメインコンテンツ（画像、本文、タグ） | single.php |
| `related.php` | 汎用シングルページの関連記事 | single.php |
| `navigation.php` | 汎用シングルページの前後ナビゲーション | single.php |
| `works-header.php` | 制作実績のヘッダー部分 | single-works.php |
| `works-thumbnail.php` | 制作実績のサムネイル画像 | single-works.php |
| `works-body.php` | 制作実績のメインコンテンツ（情報・ギャラリー・本文） | single-works.php |
| `works-navigation.php` | 制作実績の前後ナビゲーション | single-works.php |

新規ページを追加するときは、一覧なら `archive-{post_type}.php`、固定コンテンツなら `page.php` または `page-{slug}.php` を基準にし、見出しは `section-title.php`、一覧アイテムは上記の `archive/*` を流用または参考にするとよいです。

---

## 基本原則

- **投稿一覧 = archive系**
- **固定コンテンツ = page系**

## テンプレート階層

### 投稿一覧系

#### `archive-{post_type}.php`
**用途**: カスタム投稿タイプの一覧、通常投稿（post）の一覧も含む

**使用条件**:
- カスタム投稿タイプのアーカイブページ
- `has_archive => true`で登録されているカスタム投稿タイプ
- 通常投稿（post）のメインアーカイブ（`archive.php`経由で使用）

**テンプレート階層**:
1. `archive-{post_type}.php`（最優先）
2. `archive.php`（フォールバック）
3. `index.php`（最終フォールバック）

**使用例**:
- `/news/`（表示設定の投稿ページで指定）→ `home.php` → `page-news-list`（通常投稿の一覧）
- `/works/` → `archive-works.php`（制作実績のアーカイブ）

---

#### `archive.php`
**用途**: 条件別の一覧（カテゴリ、タグ、日付など）

**使用条件**:
- カテゴリーアーカイブ
- タグアーカイブ
- 日付アーカイブ
- 著者アーカイブ
- 通常投稿（post）のメインアーカイブ（`home.php` → `page-news-list`）

**テンプレート階層**:
1. `category-{slug}.php` / `category-{id}.php` / `category.php`（カテゴリー）
2. `tag-{slug}.php` / `tag-{id}.php` / `tag.php`（タグ）
3. `date.php`（日付）
4. `author.php`（著者）
5. `archive.php`（フォールバック、通常投稿の場合は `home.php` と同様に `page-news-list` を利用）
6. `index.php`（最終フォールバック）

**使用例**:
- `/category/news/` → カテゴリー「news」のアーカイブ
- `/tag/important/` → タグ「important」のアーカイブ
- `/2024/01/` → 2024年1月のアーカイブ
- 通常投稿のメインアーカイブ → `home.php` または `archive.php` 経由で `page-news-list` を使用

---

### 固定ページ系

#### `page.php`
**用途**: 固定ページ用（一覧表示には使わない）

**使用条件**:
- 通常の固定ページ
- 特定のテンプレートが指定されていない固定ページ

**テンプレート階層**:
1. `page-{slug}.php`（特定の固定ページ用）
2. `page-{id}.php`（特定の固定ページ用）
3. `page.php`（フォールバック）
4. `singular.php`
5. `index.php`（最終フォールバック）

**使用例**:
- `/about/` → `page-about.php` または `page.php`
- `/contact/` → `page-contact.php` または `page.php`

---

#### `page-{slug}.php`
**用途**: 特定の固定ページ用

**使用条件**:
- 固定ページのスラッグが`{slug}`と一致する場合

**使用例**:
- `/contact/` → `page-contact.php`
- `/about/` → `page-about.php`

---

## このプロジェクトでの使い分け

### ニュース一覧ページ

**推奨**: `home.php` → `page-news-list`（表示設定の「投稿ページ」で指定した固定ページの URL で表示）

**管理画面での設定**:
1. WordPress管理画面 → **設定** → **表示設定**
2. **「投稿ページ」** で、ニュース一覧として表示したい固定ページ（例: スラッグ `news`）を選択
3. **「変更を保存**」をクリック

**URL**: 選択した固定ページのスラッグに依存（例: `/news/`）

**テンプレート**: メインの投稿一覧は `home.php` が使われ、`template-parts/page-news-list` を読み込む。カテゴリ・タグ・日付アーカイブは `archive.php` が同じく `page-news-list` を読み込む。

**動作**:
- メインの投稿一覧（`/news/` など）→ `home.php` → `page-news-list`
- カテゴリ・タグ・日付アーカイブ → `archive.php` → `page-news-list`

---

### 制作実績一覧ページ

**推奨**: `archive-works.php`

- カスタム投稿タイプ「works」のアーカイブページ
- `has_archive => true`で登録されているため、自動的に`/works/`でアクセス可能

**管理画面での設定**:
- **設定不要**（自動的にアーカイブページが有効）
- カスタム投稿タイプ「works」に投稿を追加するだけで表示可能

**URL**: `/works/`

**テンプレート**: `archive-works.php` が使用されます

---

### 固定ページ

**推奨**: `page-{slug}.php` または `page.php`

- お問い合わせページ → `page-contact.php`
- その他の固定ページ → `page.php`

---

## まとめ

| テンプレート | 用途 | 使用例 |
|------------|------|--------|
| `archive-{post_type}.php` | 投稿タイプの一覧 | `/works/` → `archive-works.php` など（通常投稿一覧は `home.php` → `page-news-list`） |
| `archive.php` | 条件別の一覧 | カテゴリー、タグ、日付アーカイブ<br>通常投稿のメインアーカイブ（`home.php` / `archive.php` から `page-news-list`） |
| `page.php` | 固定ページ用 | 通常の固定ページ |
| `page-{slug}.php` | 特定の固定ページ用 | `/contact/` → `page-contact.php` |

---

## テンプレートとパーツの分け方

### 基本方針

1. **汎用テンプレートは汎用パーツを使用**
   - `single.php` → `loop-single.php`（汎用ループ）
   - `archive.php` → `archive-list.php` → `archive-loop.php`（汎用ループ）

2. **専用テンプレートは専用パーツに分割**
   - `single-works.php` → `single/works-*.php`（制作実績専用パーツ）
   - `archive-works.php` → `archive/works-list.php` → `archive/works-card.php`

3. **セクション単位でパーツ化**
   - トップページ: `front-page/section-*.php`
   - 制作実績詳細: `single/works-header.php`, `works-body.php` など

### パーツ分けの判断基準

#### パーツ化すべき場合

- ✅ **再利用可能な部分** - 複数のテンプレートで使う可能性がある
- ✅ **論理的に独立したセクション** - ヘッダー、コンテンツ、ナビゲーションなど
- ✅ **コードが長くなる場合** - 50行以上で見通しが悪くなる
- ✅ **投稿タイプ固有の処理** - カスタムフィールドの取得・表示など

#### パーツ化しない方が良い場合

- ❌ **1箇所でしか使わない** - 再利用の見込みがない
- ❌ **過度に細かく分割** - ファイル数が増えすぎて管理が大変
- ❌ **変数の受け渡しが複雑** - パーツ間の依存関係が複雑になる

### 推奨されるパーツ分けの粒度

#### シングルページ（`single-{post_type}.php`）

**汎用の場合**:
- `single.php` → 以下のパーツに分割
  - `single/header.php` - ヘッダー部分（タイトル、メタ情報、カテゴリー、サマリー）
  - `single/body.php` - メインコンテンツ（画像、本文、タグ）
  - `single/related.php` - 関連記事
  - `single/navigation.php` - 前後ナビゲーション

**専用テンプレートの場合**:
- `single-{post_type}.php` → 以下のパーツに分割
  - `single/{post_type}-header.php` - ヘッダー部分（タイトル、メタ情報）
  - `single/{post_type}-thumbnail.php` - サムネイル画像（必要に応じて）
  - `single/{post_type}-body.php` - メインコンテンツ（情報、ギャラリー、本文）
  - `single/{post_type}-navigation.php` - 前後ナビゲーション（必要に応じて）

**例**: `single.php` の場合
```
single.php
├─ single/header.php      （ヘッダー）
├─ single/body.php        （画像・本文・タグ）
├─ single/related.php     （関連記事）
└─ single/navigation.php  （前後ナビ）
```

**例**: `single-works.php` の場合
```
single-works.php
├─ single/works-header.php      （ヘッダー）
├─ single/works-thumbnail.php   （サムネイル）
├─ single/works-body.php        （情報・ギャラリー・本文）
└─ single/works-navigation.php  （前後ナビ）
```

#### アーカイブページ（`archive-{post_type}.php`）

**汎用の場合**:
- `archive.php` → `archive-list.php` → `archive-loop.php` → `archive-card.php`

**専用テンプレートの場合**:
- `archive-{post_type}.php` → `archive/{post_type}-list.php` → `archive/{post_type}-card.php`

**例**: `archive-works.php` の場合
```
archive-works.php
└─ archive/works-list.php
   └─ archive/works-card.php（ループ内で呼ばれる）
```

#### 固定ページ（`page-{slug}.php`）

**シンプルな場合**:
- `page-{slug}.php` に直接記述（パーツ化不要）

**複雑な場合**:
- `page-{slug}.php` → `page/{slug}-*.php`（セクション単位で分割）

**例**: `page-contact.php` の場合
- シンプルなので直接記述（現在の実装）

### パーツ間のデータ受け渡し

#### 方法1: グローバル変数（推奨）

```php
// テンプレート側
$custom_data = get_field("custom_field");
get_template_part("template-parts/single/custom-part");

// パーツ側
$custom_data = isset($custom_data) ? $custom_data : "";
```

#### 方法2: `get_query_var()` を使用

```php
// テンプレート側
set_query_var("custom_data", get_field("custom_field"));
get_template_part("template-parts/single/custom-part");

// パーツ側
$custom_data = get_query_var("custom_data", "");
```

#### 方法3: パーツ内で直接取得（最もシンプル）

```php
// パーツ側で直接取得
$custom_data = function_exists("get_field") ? get_field("custom_field") : "";
```

**推奨**: 方法3（パーツ内で直接取得）が最もシンプルで保守しやすい

### 実装例

#### 汎用テンプレートの例

```php
// single.php
get_header();
if (have_posts()):
  while (have_posts()):
    the_post();
    $post_type = get_post_type();
?>
  <main class="l-main">
    <article class="p-single p-single--<?php echo esc_attr($post_type); ?>" itemscope itemtype="https://schema.org/Article">
      <div class="p-single__inner l-inner">
        <?php get_template_part("template-parts/single/header"); ?>
        <?php get_template_part("template-parts/single/body"); ?>
        <?php get_template_part("template-parts/single/related"); ?>
        <?php get_template_part("template-parts/single/navigation"); ?>
      </div>
    </article>
  </main>
<?php
  endwhile;
endif;
get_footer();
```

#### 専用テンプレートの例

```php
// single-works.php
get_header();
if (have_posts()):
  while (have_posts()):
    the_post();
?>
  <main class="l-main">
    <article class="p-single p-single--works">
      <div class="p-single__inner l-inner">
        <?php get_template_part("template-parts/single/works-header"); ?>
        <?php get_template_part("template-parts/single/works-thumbnail"); ?>
        <?php get_template_part("template-parts/single/works-body"); ?>
        <?php get_template_part("template-parts/single/works-navigation"); ?>
      </div>
    </article>
  </main>
<?php
  endwhile;
endif;
get_footer();
```

---

## 最適解：このプロジェクトでの推奨パターン

### パターン1: 汎用テンプレート + 汎用パーツ

**適用**: 複数の投稿タイプで同じ構造を使う場合

```
single.php
└─ template-parts/loop-single.php（すべての処理を含む）
```

**メリット**:
- コードの重複が少ない
- メンテナンスが容易
- 新しい投稿タイプでも自動的に適用される

**デメリット**:
- 投稿タイプ固有のカスタマイズが難しい
- 条件分岐が増える可能性がある

### パターン2: 専用テンプレート + 専用パーツ

**適用**: 投稿タイプ固有の構造や処理が必要な場合

```
single-works.php
├─ template-parts/single/works-header.php
├─ template-parts/single/works-thumbnail.php
├─ template-parts/single/works-body.php
└─ template-parts/single/works-navigation.php
```

**メリット**:
- 投稿タイプ固有の処理が明確
- コードの見通しが良い
- カスタマイズが容易

**デメリット**:
- ファイル数が増える
- パーツ間の依存関係を管理する必要がある

### パターン3: アーカイブの階層構造

**適用**: 一覧ページ（汎用・専用両方）

```
archive.php / archive-works.php
└─ archive/{post_type}-list.php（専用の場合）
   └─ archive/archive-loop.php（共通ループ）
      └─ archive/{post_type}-card.php（カード表示）
```

**メリット**:
- ループ処理を共通化できる
- カード表示だけを差し替えれば対応可能
- ページネーションや0件メッセージも共通化

**実装例**:
- `archive-loop.php` は `$args` でカードパーツ名を受け取る
- `works-list.php` は `archive-loop.php` を呼び出し、`works-card` を指定

### 推奨される使い分け

| ケース | 推奨パターン | 理由 |
|--------|------------|------|
| 通常投稿（post）のシングル | パターン1（汎用） | 標準的な構造で十分 |
| カスタム投稿タイプのシングル | パターン2（専用） | カスタムフィールドや固有の構造が必要 |
| アーカイブページ | パターン3（階層構造） | ループ処理を共通化しつつ、カード表示を差し替え可能 |
| 固定ページ（シンプル） | 直接記述 | パーツ化不要 |
| 固定ページ（複雑） | セクション単位でパーツ化 | 見通しを良くする |

### 実装時のチェックリスト

#### 新規テンプレート作成時

- [ ] 既存の汎用テンプレートで対応可能か確認
- [ ] 専用テンプレートが必要な場合、パーツ分けの粒度を検討
- [ ] パーツ間のデータ受け渡し方法を決定
- [ ] セキュリティ対策（`esc_*` 関数）を実装

#### パーツ作成時

- [ ] 再利用性を考慮（他のテンプレートでも使えるか）
- [ ] 適切な粒度（過度に細かく分割しない）
- [ ] 変数の受け渡し方法を統一
- [ ] パーツ内で直接データ取得する方がシンプルか検討

#### コードレビュー時の確認ポイント

- [ ] テンプレート階層に沿っているか
- [ ] パーツ分けが適切か（過度に細かくないか）
- [ ] セキュリティ対策が適切か（`esc_*` 関数の使用）
- [ ] アクセシビリティに配慮されているか（適切なHTML構造、ARIA属性）

---

## 現在の分割粒度の評価と改善提案

### 現状の評価

#### ✅ 適切な分割

1. **`single-works.php` の分割（4パーツ）**
   - `works-header.php`（30行）: ヘッダー部分のみで適切
   - `works-thumbnail.php`（32行）: サムネイル表示のみで適切
   - `works-navigation.php`（27行）: ナビゲーションのみで適切
   - **評価**: 論理的に独立したセクションで、見通しが良い

2. **アーカイブの階層構造**
   - `archive-loop.php`（35行）: 共通ループ処理で適切
   - `works-list.php`（30行）: フィルタ + ループ呼び出しで適切
   - `works-card.php`（63行）: カード表示のみで適切
   - **評価**: 再利用性と保守性のバランスが良い

3. **フロントページの分割**
   - `section-mv.php`（37行）: MVセクションのみで適切
   - `section-sample.php`（39行）: サンプルセクションのみで適切
   - **評価**: セクション単位で分割されており、適切

#### ✅ 適切な分割（更新）

1. **`single.php` の分割（4パーツ）**
   - `header.php`: ヘッダー部分（タイトル、メタ情報、カテゴリー、サマリー）
   - `body.php`: メインコンテンツ（画像、本文、タグ）
   - `related.php`: 関連記事
   - `navigation.php`: 前後ナビゲーション
   - **評価**: 論理的に独立したセクションで、見通しが良い。適切な粒度で分割されている

2. **`works-body.php`（82行）**
   - **現状**: 制作実績情報、ギャラリー、本文を含む
   - **評価**: 
     - 82行はやや長めだが、論理的にまとまっている
     - 制作実績情報（`.p-single__works-info`）、ギャラリー（`.p-single__gallery`）、本文（`.p-single__content`）は関連性が高い
   - **改善提案**: 
     - 現状のままで問題なし
     - 将来的にギャラリーが複数画像対応になった場合は、`works-gallery.php` に分離を検討

### 改善提案

#### 提案1: `single.php` の分割（完了）

**実施内容**:
- `loop-single.php`（270行）を4つのパーツに分割
- 各パーツが独立しており、見通しが良い

**分割後の構造**:
```
template-parts/single/
├─ header.php          （ヘッダー部分）
├─ body.php            （画像・本文・タグ）
├─ related.php         （関連記事）
└─ navigation.php      （前後ナビゲーション）
```

**メリット**:
- 各パーツの責務が明確になった
- 再利用性が向上（他のテンプレートでも使える）
- テストやデバッグが容易になった

#### 提案2: `works-body.php` の現状維持（推奨度: 高）

**評価**:
- 82行はやや長めだが、論理的にまとまっている
- 制作実績情報、ギャラリー、本文は関連性が高い
- 過度に分割すると、逆に見通しが悪くなる可能性がある

**推奨**: 現状のままで問題なし

#### 提案3: パーツ命名規則の統一（推奨度: 高）

**現状**:
- `works-header.php`, `works-thumbnail.php`, `works-body.php`, `works-navigation.php`
- `section-mv.php`, `section-sample.php`

**推奨命名規則**:
- 投稿タイプ専用パーツ: `{post_type}-{section}.php`（例: `works-header.php`）
- 汎用パーツ: `{section}.php`（例: `header.php`, `thumbnail.php`）
- ページ専用セクション: `{page}-{section}.php` または `{section}.php`（例: `section-mv.php`）

**メリット**:
- 命名規則が統一され、ファイルの役割が明確になる
- 新しいパーツを追加する際の判断が容易になる

### 総合評価

#### 良い点

1. ✅ **適切な粒度の分割**: `single-works.php` の4パーツ分割は見通しが良い
2. ✅ **再利用性の考慮**: `archive-loop.php` による共通ループ処理
3. ✅ **論理的な構造**: セクション単位での分割が適切

#### 改善の余地

1. ⚠️ **`loop-single.php` の長さ**: 270行と長く、分割を検討する価値がある
2. ⚠️ **命名規則の統一**: 一部のパーツで命名規則が統一されていない

#### 推奨アクション

1. **完了**: `single.php` を汎用パーツに分割（4パーツ構成）
2. **長期**: 命名規則を統一し、ドキュメント化する

---

## 注意事項

1. **投稿一覧はarchive系を使用**
   - 一覧表示には`page-*.php`を使用しない
   - `archive-*.php`または`home.php`を使用

2. **固定コンテンツはpage系を使用**
   - 一覧表示ではない固定ページには`page.php`または`page-{slug}.php`を使用

3. **テンプレート階層を理解する**
   - WordPressは優先順位に従ってテンプレートを選択
   - より具体的なテンプレートが優先される

4. **パーツ分けは適度に**
   - 過度に細かく分割すると管理が大変になる
   - 見通しが良くなる程度に分割する
   - 再利用性と保守性のバランスを取る

5. **分割粒度の判断基準**
   - 50行以下: 分割不要（直接記述で問題なし）
   - 50-100行: 論理的なセクション単位で分割を検討
   - 100行以上: 分割を強く推奨（複数の責務が混在している可能性が高い）
