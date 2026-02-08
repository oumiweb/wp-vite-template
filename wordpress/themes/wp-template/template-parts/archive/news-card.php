<?php
/**
 * ニュース一覧1件表示
 * news-list のループ内で呼ぶ。the_post() 済み前提。
 */
$categories = get_the_category();
$category_name = !empty($categories) ? $categories[0]->name : "";
?>
<a href="<?php echo esc_url(get_permalink()); ?>" class="p-news-list__item">
  <article class="p-news-list__card">
    <div class="p-news-list__meta">
      <time class="p-news-list__date" datetime="<?php echo esc_attr(get_the_date("c")); ?>">
        <?php echo esc_html(get_the_date("Y-m-d")); ?>
      </time>
      <?php if ($category_name): ?>
        <span class="p-news-list__separator">•</span>
        <span class="p-news-list__category"><?php echo esc_html($category_name); ?></span>
      <?php endif; ?>
    </div>
    <div class="p-news-list__content">
      <div class="p-news-list__main">
        <h2 class="p-news-list__title"><?php echo esc_html(get_the_title()); ?></h2>
        <?php if (has_excerpt()): ?>
          <p class="p-news-list__excerpt"><?php echo esc_html(get_the_excerpt()); ?></p>
        <?php endif; ?>
      </div>
      <span class="p-news-list__arrow" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </span>
    </div>
  </article>
</a>
