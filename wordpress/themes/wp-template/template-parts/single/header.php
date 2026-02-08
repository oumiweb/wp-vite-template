<?php
/**
 * シングルページのヘッダー部分
 * single.php から呼び出される
 */
$post_type = get_post_type();

// ACFフィールドの取得（通常投稿用）
$subtitle = "";
$summary = "";
$author_info = "";
$publish_date = "";

if ($post_type === "post" && function_exists("get_field")) {
  $subtitle = get_field("post_subtitle");
  $summary = get_field("post_summary");
  $author_info = get_field("post_author_info");
  $publish_date = get_field("post_publish_date");
}

// カテゴリー・タクソノミーの取得
$categories = [];
if ($post_type === "post") {
  // 通常投稿の場合はカテゴリーを取得
  $categories = get_the_category();
} else {
  // カスタム投稿タイプの場合はタクソノミーを取得
  $taxonomies = get_object_taxonomies($post_type);
  if (!empty($taxonomies)) {
    $terms = get_the_terms(get_the_ID(), $taxonomies[0]);
    $categories = $terms && !is_wp_error($terms) ? $terms : [];
  }
}

// 公開日の決定（ACFフィールドがあれば優先、なければ投稿日）
$display_date = $publish_date ? $publish_date : get_the_date("Y-m-d");
$display_date_formatted = $publish_date ? date_i18n("Y年m月d日", strtotime($publish_date)) : get_the_date("Y年m月d日");

// 著者名の決定（ACFフィールドがあれば優先、なければ投稿者名）
$display_author = $author_info ? $author_info : get_the_author();
?>
<header class="p-single__header">
  <?php if ($subtitle): ?>
    <p class="p-single__subtitle"><?php echo esc_html($subtitle); ?></p>
  <?php endif; ?>

  <h1 class="p-single__title" itemprop="headline"><?php echo esc_html(get_the_title()); ?></h1>

  <div class="p-single__meta">
    <time class="p-single__date" datetime="<?php echo esc_attr($display_date); ?>" itemprop="datePublished">
      <?php echo esc_html($display_date_formatted); ?>
    </time>

    <?php if ($display_author): ?>
      <span class="p-single__author" itemprop="author" itemscope itemtype="https://schema.org/Person">
        <span itemprop="name"><?php echo esc_html($display_author); ?></span>
      </span>
    <?php endif; ?>

    <?php if (!empty($categories)): ?>
      <div class="p-single__categories">
        <?php foreach ($categories as $category):
          $category_link = $post_type === "post" ? get_category_link($category->term_id) : get_term_link($category);
          if (!is_wp_error($category_link)): ?>
          <a href="<?php echo esc_url($category_link); ?>" class="p-single__category" itemprop="articleSection">
            <?php echo esc_html($category->name); ?>
          </a>
        <?php endif;
        endforeach; ?>
      </div>
    <?php endif; ?>
  </div>

  <?php if ($summary): ?>
    <div class="p-single__summary">
      <?php echo esc_html($summary); ?>
    </div>
  <?php endif; ?>
</header>
