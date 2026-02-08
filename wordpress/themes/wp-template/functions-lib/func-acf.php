<?php

/**
 * func-acf.php
 * ACF Local JSON 運用の基本設定
 *
 * 参考：https://www.efusion.co.jp/whatsnew/howto-acf-json/
 *
 * 方針：
 * - 管理画面でフィールドグループを保存すると、テーマ配下 /acf-json にJSONが自動保存される
 * - JSONを編集/追加した場合は、ACFの標準機能「同期が利用できます」で同期する
 * - テーマ移行と同時にACFの同期も完結できる
 *
 * 使い方：
 * 1. 管理画面のACFフィールドグループ一覧で「同期が利用できます」を確認
 * 2. 「同期が利用できます」をクリックして同期を実行
 * 3. JSONファイルはテーマ配下の /acf-json フォルダに保存される
 *
 * 注意：
 * - 自動同期（画面アクセスで勝手にDB更新）はしない（販売テンプレで事故りやすいので）
 */

/**
 * ACF JSONの保存場所をテーマディレクトリに設定
 *
 * @param string $path
 * @return string
 */
function my_acf_json_save_point($path)
{
  $path = get_stylesheet_directory() . "/acf-json";
  return $path;
}
add_filter("acf/settings/save_json", "my_acf_json_save_point");

/**
 * ACF JSONの読み込み場所をテーマディレクトリに設定
 *
 * 重要：
 * - デフォルトのパスは削除しない（unset禁止）
 * - テーマ側のacf-jsonを優先したいので先頭に追加（array_unshift）
 * - 参考サイトでは unset($paths[0]) を推奨しているが、プラグイン配下のJSONも読み込めるように残す
 *
 * @param array $paths
 * @return array
 */
function my_acf_json_load_point($paths)
{
  $json_path = get_stylesheet_directory() . "/acf-json";

  // 既に入っている場合は重複を避ける
  if (!in_array($json_path, $paths, true)) {
    array_unshift($paths, $json_path);
  }

  return $paths;
}
add_filter("acf/settings/load_json", "my_acf_json_load_point");

/**
 * ACFのオプションページ設定（必要なら有効化）
 */
// add_action('acf/init', function () {
// 	if (function_exists('acf_add_options_page')) {
// 		acf_add_options_page(array(
// 			'page_title' => 'サイト設定',
// 			'menu_title' => 'サイト設定',
// 			'menu_slug'  => 'site-settings',
// 			'capability' => 'edit_posts',
// 			'redirect'   => false,
// 		));
// 	}
// });
