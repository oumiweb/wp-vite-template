<?php
/**
 * 制作実績詳細ページのメインコンテンツ部分
 * single-works.php から呼び出される
 */
$client = function_exists("get_field") ? get_field("works_client") : "";
$period = function_exists("get_field") ? get_field("works_period") : "";
$technologies = function_exists("get_field") ? get_field("works_technologies") : [];
$url = function_exists("get_field") ? get_field("works_url") : "";
$gallery = function_exists("get_field") ? get_field("works_gallery") : [];
$description = function_exists("get_field") ? get_field("works_description") : "";
?>
<div class="p-single__works-info">
  <?php if ($client): ?>
    <div class="p-single__works-item">
      <span class="p-single__works-label">クライアント</span>
      <span class="p-single__works-value" itemprop="client"><?php echo esc_html($client); ?></span>
    </div>
  <?php endif; ?>
  <?php if ($period): ?>
    <div class="p-single__works-item">
      <span class="p-single__works-label">制作期間</span>
      <span class="p-single__works-value"><?php echo esc_html($period); ?></span>
    </div>
  <?php endif; ?>
  <?php if ($technologies && is_array($technologies) && !empty($technologies)): ?>
    <div class="p-single__works-item">
      <span class="p-single__works-label">使用技術</span>
      <div class="p-single__works-technologies">
        <?php foreach ($technologies as $tech): ?>
          <span class="p-single__works-technology"><?php echo esc_html($tech); ?></span>
        <?php endforeach; ?>
      </div>
    </div>
  <?php endif; ?>
  <?php if ($url): ?>
    <div class="p-single__works-item">
      <span class="p-single__works-label">URL</span>
      <a href="<?php echo esc_url($url); ?>" target="_blank" rel="noopener noreferrer" class="p-single__works-url" itemprop="url">
        <?php echo esc_html($url); ?>
      </a>
    </div>
  <?php endif; ?>
</div>

<?php if ($gallery && is_array($gallery) && !empty($gallery)): ?>
  <?php
  $image_url = isset($gallery["url"]) ? $gallery["url"] : "";
  $image_alt = isset($gallery["alt"]) && !empty($gallery["alt"]) ? $gallery["alt"] : get_the_title();
  $image_width = isset($gallery["width"]) ? $gallery["width"] : "";
  $image_height = isset($gallery["height"]) ? $gallery["height"] : "";
  ?>
  <?php if ($image_url): ?>
    <div class="p-single__gallery">
      <h2 class="p-single__gallery-title">制作物画像</h2>
      <div class="p-single__gallery-list">
        <div class="p-single__gallery-item">
          <?php if ($image_width && $image_height): ?>
            <img src="<?php echo esc_url($image_url); ?>"
              width="<?php echo esc_attr($image_width); ?>"
              height="<?php echo esc_attr($image_height); ?>"
              loading="lazy"
              alt="<?php echo esc_attr($image_alt); ?>">
          <?php else: ?>
            <img src="<?php echo esc_url($image_url); ?>"
              loading="lazy"
              alt="<?php echo esc_attr($image_alt); ?>">
          <?php endif; ?>
        </div>
      </div>
    </div>
  <?php endif; ?>
<?php endif; ?>

<div class="p-single__content" itemprop="description">
  <?php if ($description): ?>
    <?php echo wp_kses_post($description); ?>
  <?php else: ?>
    <?php the_content(); ?>
  <?php endif; ?>
</div>
