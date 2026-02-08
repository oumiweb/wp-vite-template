# コーディングガイドライン

このプロジェクトで守る記述ルールの簡易一覧です。

---

## HTML

- **BEM または FLOCSS** に従ってクラス名・構造を書く。
- **img タグ**
  - `width` と `height` を必ず指定する。
  - メインビジュアル以外は `loading="lazy"` を付ける。
- **クラス名**は略さず書く。
  - NG: `.ttl`
  - OK: `.title`
- **サイト内のパス**はルート相対（`/` 始まり）で書く。
  - NG: `./images/sample.png`
  - OK: `/images/sample.png`
- **文字**は UTF-8 で直接書く。数値文字参照・文字実体参照は使わない。
  - NG: `&copy;` `&#9312;`
  - OK: `©` `①`

---

## CSS / SCSS

- 妥当な CSS を使う（[CSS Validator](https://jigsaw.w3.org/css-validator/) を参照）。
- **インライン style は使わない**。クラスで指定する。
- **margin / padding** は方向を明示する（上・左は `block-start` / `inline-start`）。
  ```css
  margin-block-start: 10px;   /* 上 */
  margin-inline-start: 10px;  /* 左 */
  ```
- **等間隔**は `gap` を使う。
- **画像の縦横比**は `aspect-ratio` で指定する。
- **ネストは書かない**（FLOCSS の方針）。
- **font-size** は rem を基本とする。プロジェクトでは `calc(値 * var(--to-rem))` を使用する。

---

## 画像

- **ファイル名**: 英小文字・数字・ハイフン・アンダースコアのみ。
- **形式**: `カテゴリ[_名前][_連番][_状態].拡張子`
  - 例: `bg_sample.png` / `image_mv_01.webp` / `icon_arrow.svg`
- **配置**: すべて `src/assets/images/` に置く（ページ別フォルダには分けない）。
- 参考: [命名規則の記事](https://webnaut.jp/technology/20210910-3953/)

---

## JavaScript

- 変数は **`const` または `let`** を使う。**`var` は使わない**。
- ES モジュールで記述する。
