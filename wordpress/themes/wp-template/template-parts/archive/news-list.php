<?php
/**
 * ニュース一覧のリストブロック
 * 一覧ラッパー ＋ ループ（news-card）＋ ページネーション or 0件メッセージ
 */
get_template_part("template-parts/archive/archive-loop", null, [
  "card_slug" => "template-parts/archive/news-card",
  "list_class" => "p-news-list__container",
  "pagination_class" => "p-news-list__pagination",
  "empty_class" => "p-news-list__empty",
  "empty_message" => "ニュースが見つかりませんでした。",
]);
