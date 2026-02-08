<?php
/**
 * 制作実績一覧1件表示
 * works-list のループ内で呼ぶ。
 */
$client = function_exists("get_field") ? get_field("works_client") : "";
$gallery = function_exists("get_field") ? get_field("works_gallery") : [];

$categories = get_the_terms(get_the_ID(), "works_category");
$category_name = "";
$category_slugs = [];
if ($categories && !is_wp_error($categories)) {
  $category_name = $categories[0]->name;
  foreach ($categories as $cat) {
    $category_slugs[] = $cat->slug;
  }
}

$thumbnail_url = "";
$thumbnail_alt = get_the_title();
if (has_post_thumbnail()) {
  $thumbnail_id = get_post_thumbnail_id();
  $thumbnail_url = wp_get_attachment_image_url($thumbnail_id, "medium_large");
  $thumbnail_alt = get_post_meta($thumbnail_id, "_wp_attachment_image_alt", true);
  if (empty($thumbnail_alt)) {
    $thumbnail_alt = get_the_title();
  }
} elseif ($gallery) {
  // ACFのworks_galleryフィールドが配列の場合と単一画像オブジェクトの場合に対応
  $first_image = null;
  if (is_array($gallery)) {
    // 配列の場合（複数画像または連想配列）
    if (isset($gallery[0]) && is_array($gallery[0])) {
      // 配列の0番目が画像オブジェクト
      $first_image = $gallery[0];
    } elseif (isset($gallery["url"])) {
      // 単一の画像オブジェクト（連想配列）
      $first_image = $gallery;
    }
  }
  
  if ($first_image && is_array($first_image)) {
    $thumbnail_url = isset($first_image["sizes"]["medium_large"]) ? $first_image["sizes"]["medium_large"] : (isset($first_image["url"]) ? $first_image["url"] : "");
    $thumbnail_alt = isset($first_image["alt"]) && !empty($first_image["alt"]) ? $first_image["alt"] : get_the_title();
  }
}

// 画像が取得できなかった場合のダミー画像
if (empty($thumbnail_url)) {
  $thumbnail_url = get_theme_file_uri("/assets/images/image_sample_01.webp");
  $thumbnail_alt = "No image";
}
?>
<article class="p-works-list__card js-works-card" data-categories="<?php echo esc_attr(implode(" ", $category_slugs)); ?>">
  <a href="<?php echo esc_url(get_permalink()); ?>" class="p-works-list__link">
    <div class="p-works-list__thumbnail">
      <?php if ($thumbnail_url): ?>
        <img src="<?php echo esc_url($thumbnail_url); ?>"
          loading="lazy"
          alt="<?php echo esc_attr($thumbnail_alt); ?>">
      <?php endif; ?>
      <?php if ($category_name): ?>
        <span class="p-works-list__badge"><?php echo esc_html($category_name); ?></span>
      <?php endif; ?>
    </div>
    <div class="p-works-list__content">
      <h2 class="p-works-list__card-title"><?php echo esc_html(get_the_title()); ?></h2>
      <?php if ($client): ?>
        <p class="p-works-list__client"> <?php echo esc_html($client); ?></p>
      <?php endif; ?>
      <time class="p-works-list__date" datetime="<?php echo esc_attr(get_the_date("c")); ?>">
        <?php echo esc_html(get_the_date("Y-m")); ?>
      </time>
    </div>
  </a>
</article>
