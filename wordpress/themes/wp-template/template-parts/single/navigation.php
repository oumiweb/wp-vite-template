<?php
/**
 * シングルページの前後ナビゲーション
 * single.php から呼び出される
 */
$post_type = get_post_type();
$post_type_object = get_post_type_object($post_type);
$post_type_label = $post_type === "post" ? "ニュース" : ($post_type_object ? $post_type_object->labels->singular_name : "投稿");

// カテゴリー・タクソノミーの取得
$taxonomy = "";
if ($post_type === "post") {
  // 通常投稿の場合はカテゴリーを取得
  $taxonomy = "";
} else {
  // カスタム投稿タイプの場合はタクソノミーを取得
  $taxonomies = get_object_taxonomies($post_type);
  if (!empty($taxonomies)) {
    $taxonomy = $taxonomies[0]; // 最初のタクソノミーを使用
  }
}

// 前後の投稿を取得（カスタム投稿タイプの場合は同じタクソノミー内で取得）
$prev_post = $post_type === "post" ? get_previous_post() : get_previous_post(false, "", $taxonomy);
$next_post = $post_type === "post" ? get_next_post() : get_next_post(false, "", $taxonomy);
?>
<nav class="p-single__navigation" aria-label="投稿ナビゲーション">
  <?php if ($prev_post): ?>
    <div class="p-single__nav-item p-single__nav-item--prev">
      <a href="<?php echo esc_url(get_permalink($prev_post->ID)); ?>" class="p-single__nav-link">
        <span class="p-single__nav-label">前の<?php echo esc_html($post_type_label); ?></span>
        <span class="p-single__nav-title"><?php echo esc_html(get_the_title($prev_post->ID)); ?></span>
      </a>
    </div>
  <?php endif; ?>

  <?php if ($next_post): ?>
    <div class="p-single__nav-item p-single__nav-item--next">
      <a href="<?php echo esc_url(get_permalink($next_post->ID)); ?>" class="p-single__nav-link">
        <span class="p-single__nav-label">次の<?php echo esc_html($post_type_label); ?></span>
        <span class="p-single__nav-title"><?php echo esc_html(get_the_title($next_post->ID)); ?></span>
      </a>
    </div>
  <?php endif; ?>
</nav>
