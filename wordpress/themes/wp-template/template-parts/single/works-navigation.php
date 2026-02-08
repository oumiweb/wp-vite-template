<?php
/**
 * 制作実績詳細ページのナビゲーション部分
 * single-works.php から呼び出される
 */
$prev_post = get_previous_post(false, "", "works_category");
$next_post = get_next_post(false, "", "works_category");
?>
<nav class="p-single__navigation" aria-label="制作実績ナビゲーション">
  <?php if ($prev_post): ?>
    <div class="p-single__nav-item p-single__nav-item--prev">
      <a href="<?php echo esc_url(get_permalink($prev_post->ID)); ?>" class="p-single__nav-link">
        <span class="p-single__nav-label">前の制作実績</span>
        <span class="p-single__nav-title"><?php echo esc_html(get_the_title($prev_post->ID)); ?></span>
      </a>
    </div>
  <?php endif; ?>
  <?php if ($next_post): ?>
    <div class="p-single__nav-item p-single__nav-item--next">
      <a href="<?php echo esc_url(get_permalink($next_post->ID)); ?>" class="p-single__nav-link">
        <span class="p-single__nav-label">次の制作実績</span>
        <span class="p-single__nav-title"><?php echo esc_html(get_the_title($next_post->ID)); ?></span>
      </a>
    </div>
  <?php endif; ?>
</nav>
