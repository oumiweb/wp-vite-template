# ACF設定ガイド

Advanced Custom Fields（ACF）の設定から運用まで、包括的なガイドです。

## 目次

1. [概要](#概要)
2. [設定方法](#設定方法)
3. [Local JSONの使い方](#local-jsonの使い方)
4. [JSONファイルのバリデーション](#jsonファイルのバリデーション)
5. [使用方法](#使用方法)
6. [ベストプラクティス](#ベストプラクティス)
7. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### ACF JSONとは

ACF JSONは、ACFのフィールドグループ設定をJSON形式で保存する機能です。テーマ内にJSONファイルを配置することで：

- バージョン管理（Git）が可能
- デプロイ時に設定を共有できる
- チーム開発で設定を揃えやすい
- フィールド定義をデータベース以外でも管理できる

### 双方向の反映（現在の構成）

| 方向 | きっかけ | 反映のしかた |
|------|----------|--------------|
| **管理画面 → プロジェクト（acf-json）** | 管理画面でフィールドグループを「更新」する | **自動**。ACF がテーマの `acf-json` に JSON を保存する（`save_json` でパス指定済みのため） |
| **プロジェクト（acf-json）→ 管理画面** | `acf-json` に JSON を追加・編集する | **手動**。一覧を開いて「同期が利用できます」をクリックすると DB に反映され、管理画面に表示される。画面を開いただけでは自動更新しない |

管理画面で変更すればプロジェクトの JSON は自動で更新されます。逆に JSON を編集した場合は、「同期が利用できます」をクリックするまで管理画面側には反映されません。

### 動作の仕組み（補足）

1. テーマ内の `acf-json` に JSON を置くか、管理画面でフィールドグループを保存するとここに JSON が出力される
2. ACF は `load_json` で登録したパスを参照し、一覧・同期時に JSON を検出する
3. 管理画面でフィールドグループを保存すると、`acf-json` に JSON が上書き保存される
4. JSON を直接編集・追加した場合は、「同期が利用できます」を実行すると DB に反映される（後述）

---

## 設定方法

### func-acf.php の役割（ACF 標準だけではできないこと）

ACF の「Local JSON」は標準では **プラグイン本体の acf-json** に保存・読み込みします。テーマ配下の `acf-json` を使うには、ACF が提供するフィルターでパスを差し替える必要があります。そのため、**テーマの acf-json で運用するには func-acf.php の「保存先・読み込み先の指定」は必須**です。

| 処理 | 内容 | ACF 標準だけでは |
|------|------|------------------|
| **保存先の指定** (`acf/settings/save_json`) | 管理画面でフィールドグループを保存したときに、テーマの `acf-json` に JSON を書く | 不可。標準はプラグインの acf-json |
| **読み込み先の指定** (`acf/settings/load_json`) | 一覧・同期時にテーマの `acf-json` を参照する | 不可。標準はプラグイン側のみ |

まとめ: **テーマの acf-json で保存・読み込みするには、上記 2 つのフィルターが必須**です。

### 1. ACF JSONの保存場所を設定

このプロジェクトでは `functions-lib/func-acf.php` で、ACF JSON の保存・読み込み先をテーマの `acf-json` に指定しています。`get_stylesheet_directory()` で有効テーマのパスを取得しているため、子テーマでも同じように動作します。

`functions.php` で `get_template_part("functions-lib/func-acf");` により読み込んでいます。

### ディレクトリ

テーマ配下に `acf-json` を用意します。このプロジェクトでは `wordpress/themes/wp-template/acf-json` に `group_*.json` が格納されています（テーマ名はプロジェクトルートのディレクトリ名に依存）。

---

## Local JSONの使い方

### JSONファイルが管理画面に反映される流れ

JSON を編集・追加した内容を管理画面（フィールドグループ一覧・編集画面）に反映するには、**手動で「同期が利用できます」を実行する**必要があります。画面を開いただけで DB が自動更新されることはありません。

1. **JSON を置く**  
   テーマの `acf-json` に `{key}.json`（例: `group_5a8b9c2d3e4f5.json`）を配置する。既存のフィールドグループを管理画面で保存した場合も、ここに JSON が出力される。

2. **一覧を開く**  
   管理画面の「カスタムフィールド」→「フィールドグループ」を開く。

3. **検出と比較**  
   ACF が `acf/settings/load_json` で登録されたパス（テーマの `acf-json` など）をスキャンし、各 JSON の key と内容をデータベースのフィールドグループと比較する。

4. **「同期が利用できます」の表示**  
   JSON の内容が DB と異なる、または DB に同じ key のフィールドグループがない場合、その行の「ローカルJSON」列に「同期が利用できます」と表示される。

5. **同期の実行**  
   ユーザーが「同期が利用できます」をクリックする。

6. **DB への反映**  
   ACF がその JSON を読み込み、フィールドグループをデータベースに更新する。

7. **保存**  
   更新後のフィールドグループがデータベースに保存され、一覧・編集画面に反映される。

まとめ: **JSON（ディスク）→ ユーザーが「同期が利用できます」をクリック → ACF が JSON を読んで DB を更新 → 管理画面に反映**。

### 「同期が利用できます」が表示される条件

管理画面の「カスタムフィールド」→「フィールドグループ」一覧を表示したとき、ACF は `load_json` で登録したパス（テーマの `acf-json` など）をスキャンし、見つかった JSON とデータベースのフィールドグループを比較します。次のどちらかに当てはまると、その行の「ローカルJSON」列に「同期が利用できます」と出ます。

1. **JSON はあるが DB に同じ key のフィールドグループがない**  
   `acf-json` に `group_xxxxx.json` があるが、データベースには key が `xxxxx` のフィールドグループがまだない場合。同期すると DB に新規作成される。

2. **JSON と DB の内容が異なる**  
   同じ key のフィールドグループが DB にもあるが、JSON の内容（フィールド構成・設定など）が DB と一致していない場合。ACF が更新日時や内容を比較して「差がある」と判断したとき。同期すると DB が JSON の内容で上書きされる。

逆に、**JSON と DB の内容がすでに同じとき**は「同期が利用できます」は出ません。その行は同期不要という意味です。

- ファイル名は必ず `{key}.json`（例: `group_5a8b9c2d3e4f5.json`）。名前が key と一致していないと一覧に載らず、同期も表示されない。
- JSON が `acf-json` に存在し、ACF が読み込めるパスになっている必要がある。

### フィールドグループの保存（管理画面 → JSON）

管理画面でフィールドグループを「更新」すると、テーマの `acf-json` に JSON が保存されます。ファイル名は `{フィールドグループのkey}.json` です。

### 同期手順（JSON → 管理画面）

1. 「カスタムフィールド」→「フィールドグループ」を開く
2. 「ローカルJSON」列で「同期が利用できます」と出ている行を確認
3. 「同期が利用できます」をクリック
4. 同期完了後、一覧・編集画面に反映される

### 注意事項

- 画面を開いただけでは DB は更新されません。必ず「同期が利用できます」をクリックして手動で同期する。
- JSON は Git で管理することを推奨する。

---

## JSONファイルのバリデーション

### 使用方法

```bash
yarn validate:acf
```

### チェック項目

1. **JSON構文チェック** - JSONファイルとして正しくパースできるか
2. **必須プロパティチェック** - `key`, `title`, `fields`, `location`など
3. **キーの形式チェック** - `group_`、`field_`で始まるか
4. **ファイル名とキーの一致** - ファイル名が`{key}.json`の形式か
5. **フィールドタイプの妥当性** - ACFで有効なフィールドタイプか
6. **再帰的なチェック** - サブフィールド、レイアウトフィールドなど

### 実行例

```bash
$ yarn validate:acf
🔍 ACF-JSON バリデーション開始...

📁 2個のJSONファイルを検出しました

📄 group_5a8b9c2d3e4f5.json
  ✅ 問題なし

📄 group_877134248a9c6.json
  ✅ 問題なし

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 サマリー
   検証ファイル数: 2
   正常なファイル: 2
   エラー数: 0
   警告数: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ バリデーション成功: すべてのファイルが正常です
```

---

## 使用方法

### テンプレートファイルでの使用

```php
<?php
// ACFフィールドの取得（エスケープ必須）
$subtitle = get_field('subtitle');
$custom_image = get_field('custom_image');
$custom_url = get_field('custom_url');
?>

<div class="p-page">
  <?php if ($subtitle) : ?>
    <h2 class="p-page__subtitle"><?php echo esc_html($subtitle); ?></h2>
  <?php endif; ?>
  
  <?php if ($custom_image) : ?>
    <img src="<?php echo esc_url($custom_image['url']); ?>"
      width="<?php echo esc_attr($custom_image['width']); ?>"
      height="<?php echo esc_attr($custom_image['height']); ?>"
      loading="lazy"
      alt="<?php echo esc_attr($custom_image['alt']); ?>">
  <?php endif; ?>
  
  <?php if ($custom_url) : ?>
    <a href="<?php echo esc_url($custom_url); ?>" class="p-page__link">リンク</a>
  <?php endif; ?>
</div>
```

### リピーターフィールドの使用

```php
<?php
if (have_rows('items')) :
  while (have_rows('items')) : the_row();
    $item_title = get_sub_field('item_title');
    $item_content = get_sub_field('item_content');
    ?>
    <div class="p-items__item">
      <h3 class="p-items__title"><?php echo esc_html($item_title); ?></h3>
      <div class="p-items__content"><?php echo wp_kses_post($item_content); ?></div>
    </div>
  <?php
  endwhile;
endif;
?>
```

---

## ベストプラクティス

### 1. フィールド名の命名規則

- **スネークケースを使用**: `custom_text`, `page_subtitle`
- **意味のある名前**: `hero_image` ではなく `hero_background_image`
- **プレフィックスは不要**: ACFは自動的に名前空間を管理

### 2. エスケープ処理

ACFフィールドの出力時は必ずエスケープ処理を行います。

```php
// テキストフィールド
echo esc_html(get_field('text_field'));

// URLフィールド
echo esc_url(get_field('url_field'));

// 画像フィールド
$image = get_field('image_field');
if ($image) {
  echo esc_url($image['url']);
  echo esc_attr($image['alt']);
}

// WYSIWYGフィールド（HTML許可）
echo wp_kses_post(get_field('content_field'));
```

### 3. フィールドの存在チェック

フィールドが存在するか確認してから使用します。

```php
$field_value = get_field('custom_field');
if ($field_value) {
  // フィールドが存在する場合の処理
  echo esc_html($field_value);
}
```

### 4. デフォルト値の設定

フィールドが空の場合のデフォルト値を設定します。

```php
$subtitle = get_field('subtitle') ?: 'デフォルトのサブタイトル';
echo esc_html($subtitle);
```

### 5. JSONファイルの管理

- JSONファイルはGitで管理する
- JSONを直接編集・追加した場合は、管理画面で「同期が利用できます」をクリックして同期する
- チーム開発時はJSONをコミット・プッシュする
- 自動同期（画面アクセスで勝手にDB更新）は行わない

---

## トラブルシューティング

### JSONファイルが自動生成されない場合

1. `acf-json`ディレクトリのパーミッションを確認（755推奨）
2. `functions-lib/func-acf.php`が正しく読み込まれているか確認
3. ACFプラグインが有効化されているか確認

### 「同期が利用できます」が表示されない場合

**表示されていなくてよいケース**

- JSON とデータベースの内容がすでに同じとき。同期の必要はありません。

**表示されないときの確認と対処**

1. **ファイル名**  
   必ず `{フィールドグループのkey}.json` であること（例: `group_5a8b9c2d3e4f5.json`）。JSON 内の `"key"` とファイル名の `group_xxxxx` が一致しているか確認する。違う場合はファイル名を `{key}.json` に変更する。

2. **配置場所**  
   テーマの `acf-json` に置く。このプロジェクトでは `wordpress/themes/{THEME_NAME}/acf-json/`。`functions-lib/func-acf.php` が読み込まれており、`get_stylesheet_directory() . '/acf-json'` が ACF に渡されているか確認する。

3. **新規の JSON を反映したいとき**  
   管理画面で一度「新規追加」してフィールドグループを保存し、`acf-json` に出力された JSON を、中身だけ差し替える。ファイル名（key）はそのままにし、保存後に「フィールドグループ」一覧を再読み込みすると「同期が利用できます」が出る場合がある。出たらクリックして同期する。

4. **既存グループに JSON を反映したいとき**  
   JSON の `"key"` が、反映したいフィールドグループの key と完全に同じか確認する。同じ key のグループが DB にないと、一覧に「同期が利用できます」として出ないことがある。その場合は、管理画面でその key のフィールドグループを一度つくり保存してから、同じファイル名の JSON に内容を置き換え、一覧を再読み込みして同期する。

5. **パーミッション**  
   `acf-json` および JSON ファイルが Web サーバーから読めるか（例: 755 / 644）確認する。

### 設定が反映されない場合

1. WordPress管理画面で「カスタムフィールド」→「フィールドグループ」を開く
2. 「ローカルJSON」列に「同期が利用できます」と表示されているか確認
3. 「同期が利用できます」をクリックして同期を実行
4. フィールドグループの「編集」をクリックして内容を確認

### JSONファイルの競合

複数の環境でフィールドグループを編集した場合、JSONファイルが競合する可能性があります。

**解決方法:**
1. Gitでマージコンフリクトを解決
2. 管理画面でフィールドグループを再保存
3. JSONファイルを再生成

### バリデーションエラー

**「JSON構文エラー」が表示される場合:**
- JSONファイルの構文を確認してください
- カンマの有無、引用符の閉じ忘れなどをチェック

**「必須プロパティがありません」が表示される場合:**
- ACF管理画面でフィールドグループを再保存してください
- 手動でJSONを編集した場合は、必要なプロパティを追加してください

**「ファイル名がキーと一致していません」が表示される場合:**
- ファイル名を `{key}.json` の形式に変更してください

---

## 参考リンク

- [Advanced Custom Fields公式ドキュメント](https://www.advancedcustomfields.com/resources/)
- [ACF公式ドキュメント - JSON](https://www.advancedcustomfields.com/resources/local-json/)
