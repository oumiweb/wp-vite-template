<?php
/**
 * シングルページの関連記事
 * single.php から呼び出される
 */
$post_type = get_post_type();

// ACFフィールドの取得（通常投稿用）
$related_posts = [];
if ($post_type === "post" && function_exists("get_field")) {
  $related_posts = get_field("post_related_posts");
}

if (!empty($related_posts) && is_array($related_posts)): ?>
  <section class="p-single__related">
    <h2 class="p-single__related-title">関連記事</h2>
    <div class="p-single__related-list">
      <?php foreach ($related_posts as $related_post):
        if (isset($related_post->ID)):

          $related_id = $related_post->ID;
          $related_title = get_the_title($related_id);
          $related_url = get_permalink($related_id);
          $related_date = get_the_date("Y.m.d", $related_id);
          $related_thumbnail = get_the_post_thumbnail_url($related_id, "medium");
          ?>
          <article class="p-single__related-item">
            <a href="<?php echo esc_url($related_url); ?>" class="p-single__related-link">
              <?php if ($related_thumbnail): ?>
                <div class="p-single__related-thumbnail">
                  <img src="<?php echo esc_url($related_thumbnail); ?>"
                    loading="lazy"
                    alt="<?php echo esc_attr($related_title); ?>">
                </div>
              <?php endif; ?>
              <div class="p-single__related-content">
                <time class="p-single__related-date"><?php echo esc_html($related_date); ?></time>
                <h3 class="p-single__related-item-title"><?php echo esc_html($related_title); ?></h3>
              </div>
            </a>
          </article>
        <?php
        endif;
      endforeach; ?>
    </div>
  </section>
<?php endif; ?>
