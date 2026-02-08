<?php
/**
 * アーカイブ一覧のループ（共通）
 * カードパーツ名・クラス・空メッセージを $args で受け取り、一覧＋ページネーション or 0件を出力する。
 *
 * $args:
 *   - card_slug: get_template_part に渡すスラッグ（例: "template-parts/archive/archive-card"）
 *   - list_class: 一覧ラッパーのクラス
 *   - pagination_class: ページネーションラッパーのクラス
 *   - empty_class: 0件時のラッパークラス
 *   - empty_message: 0件時の文言
 */
$args = isset($args) && is_array($args) ? $args : [];
$card_slug = $args["card_slug"] ?? "template-parts/archive/archive-card";
$list_class = $args["list_class"] ?? "p-archive__list";
$pagination_class = $args["pagination_class"] ?? "p-archive__pagination";
$empty_class = $args["empty_class"] ?? "p-archive__empty";
$empty_message = $args["empty_message"] ?? "投稿が見つかりませんでした。";

if (have_posts()): ?>
  <div class="<?php echo esc_attr($list_class); ?>">
    <?php while (have_posts()) {
      the_post();
      get_template_part($card_slug);
    } ?>
  </div>
  <div class="<?php echo esc_attr($pagination_class); ?>">
    <?php get_template_part("template-parts/pagination"); ?>
  </div>
<?php else: ?>
  <div class="<?php echo esc_attr($empty_class); ?>">
    <p><?php echo esc_html($empty_message); ?></p>
  </div>
<?php endif; ?>
