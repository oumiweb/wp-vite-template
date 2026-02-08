<?php
/**
 * シングルページのメインコンテンツ部分
 * 画像（アイキャッチ + 追加画像）、本文、タグを含む
 * single.php から呼び出される
 */
$post_type = get_post_type();

// アイキャッチ画像のalt属性（ACFフィールドがあれば優先）
$thumbnail_alt = "";
if ($post_type === "post" && function_exists("get_field")) {
  $thumbnail_alt = get_field("post_thumbnail_alt");
}

// アイキャッチ画像の表示
if (has_post_thumbnail()): ?>
  <div class="p-single__thumbnail">
    <?php
    $thumbnail_id = get_post_thumbnail_id();
    $thumbnail_url = wp_get_attachment_image_url($thumbnail_id, "full");

    // alt属性の決定（ACFフィールド > メタデータ > タイトル）
    if (empty($thumbnail_alt)) {
      $thumbnail_alt = get_post_meta($thumbnail_id, "_wp_attachment_image_alt", true);
    }
    if (empty($thumbnail_alt)) {
      $thumbnail_alt = get_the_title();
    }

    // 画像サイズ情報を安全に取得
    $image_data = wp_get_attachment_image_src($thumbnail_id, "full");
    if ($image_data && isset($image_data[1]) && isset($image_data[2])): ?>
      <img src="<?php echo esc_url($thumbnail_url); ?>"
        width="<?php echo esc_attr($image_data[1]); ?>"
        height="<?php echo esc_attr($image_data[2]); ?>"
        loading="lazy"
        alt="<?php echo esc_attr($thumbnail_alt); ?>"
        itemprop="image">
    <?php else: ?>
      <img src="<?php echo esc_url($thumbnail_url); ?>"
        loading="lazy"
        alt="<?php echo esc_attr($thumbnail_alt); ?>"
        itemprop="image">
    <?php endif;
    ?>
  </div>
<?php endif;
?>

<?php
// 追加画像の表示（ACFフィールド）
$featured_image = "";
if ($post_type === "post" && function_exists("get_field")) {
  $featured_image = get_field("post_featured_image");
}

if ($featured_image && is_array($featured_image) && isset($featured_image["url"])): ?>
  <div class="p-single__featured-image">
    <?php
    $featured_url = $featured_image["url"];
    $featured_alt = isset($featured_image["alt"]) && !empty($featured_image["alt"]) ? $featured_image["alt"] : get_the_title();
    $featured_width = isset($featured_image["width"]) ? $featured_image["width"] : "";
    $featured_height = isset($featured_image["height"]) ? $featured_image["height"] : "";
    ?>
    <?php if ($featured_width && $featured_height): ?>
      <img src="<?php echo esc_url($featured_url); ?>"
        width="<?php echo esc_attr($featured_width); ?>"
        height="<?php echo esc_attr($featured_height); ?>"
        loading="lazy"
        alt="<?php echo esc_attr($featured_alt); ?>">
    <?php else: ?>
      <img src="<?php echo esc_url($featured_url); ?>"
        loading="lazy"
        alt="<?php echo esc_attr($featured_alt); ?>">
    <?php endif; ?>
  </div>
<?php endif;
?>

<div class="p-single__content" itemprop="articleBody">
  <?php the_content(); ?>
</div>

<?php // タグの表示（通常投稿のみ）

if ($post_type === "post") {
  // ACFフィールドの取得
  $custom_tags = "";
  if (function_exists("get_field")) {
    $custom_tags = get_field("post_tags_custom");
  }

  $tags = get_the_tags();
  $has_tags = !empty($tags) || !empty($custom_tags);

  if ($has_tags): ?>
    <div class="p-single__tags">
      <?php
      // 通常のタグ
      if (!empty($tags)):
        foreach ($tags as $tag): ?>
          <a href="<?php echo esc_url(get_tag_link($tag->term_id)); ?>" class="p-single__tag" rel="tag">
            <?php echo esc_html($tag->name); ?>
          </a>
        <?php endforeach;
      endif;

      // カスタムタグ（カンマ区切り）
      if (!empty($custom_tags)):
        $custom_tags_array = array_map("trim", explode(",", $custom_tags));
        foreach ($custom_tags_array as $custom_tag):
          if (!empty($custom_tag)): ?>
            <span class="p-single__tag p-single__tag--custom"><?php echo esc_html($custom_tag); ?></span>
          <?php endif;
        endforeach;
      endif;
      ?>
    </div>
  <?php endif;
}
?>
