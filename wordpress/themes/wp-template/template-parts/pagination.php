<?php

/**
 * ページネーションパーツ（c-pagination コンポーネント）
 *
 * paginate_links() の結果を c-pagination__item + data-state で出力する。
 * 状態は data-state 属性で管理し、ARIA 属性でアクセシビリティを補足する。
 *
 * 呼び出す時は親要素でwrapする。
 */

global $wp_query;

// 配列でリンクを取得（prev_text / next_text は表示文言）
$pagination = paginate_links([
  "type" => "array",
  "prev_text" => "前へ",
  "next_text" => "次へ",
]);

if (!$pagination || empty($pagination)) {
  return;
}

/**
 * WordPress の class を data-state 属性と ARIA 付きの属性に差し替える。
 */
$normalize_item = function ($html) {
  // 元の class 名から状態を判定
  $state = "page";
  if (str_contains($html, "current")) {
    $state = "current";
  } elseif (str_contains($html, "disabled")) {
    $state = "disabled";
  } elseif (str_contains($html, "dots")) {
    $state = "dots";
  } elseif (str_contains($html, "prev")) {
    $state = "prev";
  } elseif (str_contains($html, "next")) {
    $state = "next";
  }

  // 状態に応じた ARIA 属性（スクリーンリーダー等用）
  $aria_by_state = [
    "current" => " aria-current=\"page\"",
    "disabled" => " aria-disabled=\"true\"",
    "dots" => " aria-hidden=\"true\"",
  ];

  $attr = " class=\"c-pagination__item\" data-state=\"" . esc_attr($state) . "\"";
  $attr .= $aria_by_state[$state] ?? "";

  // 最初の class 属性を正規化した属性に置換
  return preg_replace('/\s*class=["\'][^"\']*["\']/', $attr, $html, 1);
};
?>
<nav class="c-pagination" aria-label="ページネーション">
  <?php foreach ($pagination as $page): ?>
    <?php echo wp_kses_post($normalize_item($page)); ?>
  <?php endforeach; ?>
</nav>