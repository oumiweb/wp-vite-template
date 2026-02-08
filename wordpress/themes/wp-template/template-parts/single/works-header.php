<?php
/**
 * 制作実績詳細ページのヘッダー部分
 * single-works.php から呼び出される
 */
$categories = get_the_terms(get_the_ID(), "works_category"); ?>
<header class="p-single__header">
  <h1 class="p-single__title" itemprop="name"><?php echo esc_html(get_the_title()); ?></h1>
  <div class="p-single__meta">
    <time class="p-single__date" datetime="<?php echo esc_attr(get_the_date("c")); ?>" itemprop="datePublished">
      <?php echo esc_html(get_the_date("Y年m月d日")); ?>
    </time>
    <?php if ($categories && !is_wp_error($categories)): ?>
      <div class="p-single__categories">
        <?php foreach ($categories as $category): ?>
          <?php
          $category_link = get_term_link($category);
          if (!is_wp_error($category_link)): ?>
            <a href="<?php echo esc_url($category_link); ?>" class="p-single__category" itemprop="genre">
              <?php echo esc_html($category->name); ?>
            </a>
          <?php endif;
          ?>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</header>
