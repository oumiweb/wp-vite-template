<?php
/**
 * func-security
 *  セキュリティ対策
 *
 */

/**
 * wordpressバージョン情報の削除
 * @see　https://digitalnavi.net/wordpress/6921/
 */
remove_action("wp_head", "wp_generator");

/**
 * 投稿者一覧ページを自動で生成されないようにする
 * WordPressの is_author() を使用してより安全に判定
 * @see　https://mucca-design.com/auther-archive-ineffective/
 */
function disable_author_archive()
{
  if (!is_admin() && is_author()) {
    wp_safe_redirect(home_url("/"), 301);
    exit();
  }
}
add_action("template_redirect", "disable_author_archive");
