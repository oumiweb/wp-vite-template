<?php
/**
 * 制作実績詳細ページのサムネイル画像
 * single-works.php から呼び出される
 */
if (has_post_thumbnail()): ?>
  <div class="p-single__thumbnail">
    <?php
    $thumbnail_id = get_post_thumbnail_id();
    $thumbnail_url = wp_get_attachment_image_url($thumbnail_id, "full");
    $thumbnail_alt = get_post_meta($thumbnail_id, "_wp_attachment_image_alt", true);
    if (empty($thumbnail_alt)) {
      $thumbnail_alt = get_the_title();
    }
    $image_data = wp_get_attachment_image_src($thumbnail_id, "full");
    ?>
    <?php if ($image_data && isset($image_data[1]) && isset($image_data[2])): ?>
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
    <?php endif; ?>
  </div>
<?php endif; ?>
