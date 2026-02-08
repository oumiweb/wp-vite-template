<?php
/**
 * アーカイブ1件表示（汎用）
 * archive-list のループ内で呼ぶ。the_post() 済み前提。
 * archive.php で専用テンプレートのない CPT 一覧に使用。
 */
$taxonomies = get_object_taxonomies(get_post_type());
$categories = [];
if (!empty($taxonomies)) {
  $terms = get_the_terms(get_the_ID(), $taxonomies[0]);
  $categories = $terms && !is_wp_error($terms) ? $terms : [];
}

$excerpt_text = has_excerpt() ? get_the_excerpt() : "";

$thumbnail_url = "";
$thumbnail_alt = get_the_title();
if (has_post_thumbnail()) {
  $thumbnail_id = get_post_thumbnail_id();
  $thumbnail_url = wp_get_attachment_image_url($thumbnail_id, "medium");
  $thumbnail_alt = get_post_meta($thumbnail_id, "_wp_attachment_image_alt", true);
  if (empty($thumbnail_alt)) {
    $thumbnail_alt = get_the_title();
  }
} else {
  $thumbnail_url = get_theme_file_uri("/assets/images/image_sample.webp");
}
$image_data = has_post_thumbnail() ? wp_get_attachment_image_src(get_post_thumbnail_id(), "medium") : null;
?>
<article class="p-archive__item">
  <a href="<?php echo esc_url(get_permalink()); ?>" class="p-archive__link">
    <div class="p-archive__thumbnail">
      <?php if ($image_data && isset($image_data[1]) && isset($image_data[2])): ?>
        <img src="<?php echo esc_url($thumbnail_url); ?>"
          width="<?php echo esc_attr($image_data[1]); ?>"
          height="<?php echo esc_attr($image_data[2]); ?>"
          loading="lazy"
          alt="<?php echo esc_attr($thumbnail_alt); ?>">
      <?php else: ?>
        <img src="<?php echo esc_url($thumbnail_url); ?>"
          loading="lazy"
          alt="<?php echo esc_attr($thumbnail_alt); ?>">
      <?php endif; ?>
    </div>
    <div class="p-archive__content">
      <div class="p-archive__meta">
        <time class="p-archive__date" datetime="<?php echo esc_attr(get_the_date("c")); ?>">
          <?php echo esc_html(get_the_date("Y.m.d")); ?>
        </time>
        <?php if (!empty($categories)): ?>
          <div class="p-archive__categories">
            <?php foreach ($categories as $category): ?>
              <span class="p-archive__category"><?php echo esc_html($category->name); ?></span>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>
      <h2 class="p-archive__item-title"><?php echo esc_html(get_the_title()); ?></h2>
      <?php if ($excerpt_text): ?>
        <div class="p-archive__excerpt">
          <?php echo esc_html($excerpt_text); ?>
        </div>
      <?php endif; ?>
    </div>
  </a>
</article>
