<?php

/**
 * func-url
 * パス・URL 用ヘルパー
 *
 * 画像:
 *   img_path('/common/logo.svg') →https://xxx.com/.../assets/images/common/logo.svg
 *
 * 固定ページ・表示設定のパス（page_path）:
 *   page_path()           → https://xxx.com/
 *   page_path('news')     → https://xxx.com/news/  （表示設定の「投稿ページ」など）
 *   page_path('contact') → https://xxx.com/contact/
 *   page_path('#section') → https://xxx.com/#section
 *   page_path('doc.pdf')  → https://xxx.com/doc.pdf
 *
 * 制作実績アーカイブ（他リンクと同様にスラッグで指定）:
 *   page_path('works') / get_page_url('works') → https://xxx.com/works/
 *
 * 通常投稿カテゴリー:
 *   category_path($slug) で return されるので echo で出力する
 *
 * @package WordPress
 */

// WordPress定数の定義チェック（リンターエラー回避のため）
if (!defined("WP_DEBUG")) {
  define("WP_DEBUG", false);
}

/* テンプレートパスを返す */
function temp_path($file = "")
{
  echo esc_url(get_theme_file_uri($file));
}
/* assetsパスを返す */
function assets_path($file = "")
{
  echo esc_url(get_theme_file_uri("/assets" . $file));
}
/* 画像パスを返す */
function img_path($file = "")
{
  echo esc_url(get_theme_file_uri("/assets/images" . $file));
}
/* mediaフォルダへのURL */
function uploads_path()
{
  // アップロードディレクトリ情報を取得し、異常があれば空文字を出力して中断。
  $upload_dir = wp_upload_dir();

  if (!empty($upload_dir["error"])) {
    if (defined("WP_DEBUG") && WP_DEBUG) {
      error_log("[uploads_path] " . $upload_dir["error"]);
    }
    echo "";
    return;
  }

  // 正常時はメディアのベースURLをエスケープして出力。
  echo esc_url($upload_dir["baseurl"]);
}

/* ホームURLを返す（return）。変数に代入するとき用 */
function get_page_url($page = "")
{
  if (strpos($page, "#") === false && strpos($page, "?") === false && !preg_match('/\.[a-zA-Z0-9]+$/', $page)) {
    $page .= "/";
  }
  return esc_url(home_url($page));
}

/* ホームURLのパスを出力する（echo） */
function page_path($page = "")
{
  echo get_page_url($page);
}

/* カテゴリーリンクを返す（echoではなくreturn） */
function category_path($category_slug = "")
{
  if (empty($category_slug)) {
    return "#"; // 空なら # を返すようにして安全対策
  }

  // get_cat_ID() は非推奨のため、get_category_by_slug() を使用
  $category = get_category_by_slug($category_slug);
  if (!$category) {
    return "#";
  }

  $link = get_category_link($category->term_id);

  // リンク取得時にWP_Errorが返るケースをログに残し、利用者にはダミーを返す。
  if ($link instanceof WP_Error) {
    if (defined("WP_DEBUG") && WP_DEBUG) {
      error_log("[category_path] " . $link->get_error_message());
    }
    return "#";
  }

  // 正常時はエスケープ済みURLを返却。
  return esc_url($link);
}
