<?php
/**
 * 汎用アーカイブのリストブロック
 * 一覧ラッパー ＋ ループ（archive-card）＋ ページネーション or 0件メッセージ
 */
get_template_part("template-parts/archive/archive-loop", null, [
  "card_slug" => "template-parts/archive/archive-card",
  "list_class" => "p-archive__list",
  "pagination_class" => "p-archive__pagination",
  "empty_class" => "p-archive__empty",
  "empty_message" => "投稿が見つかりませんでした。",
]);
