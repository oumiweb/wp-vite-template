<?php
/**
 * 投稿一覧（ニュース）のテンプレート
 *
 * 表示設定で「投稿ページ」に指定した固定ページの URL で表示される。
 * 例: 「投稿ページ」をスラッグ「news」のページにすると /news/ でこのテンプレートが使われる。
 */
get_header();
get_template_part("template-parts/page-news-list");
get_footer();
