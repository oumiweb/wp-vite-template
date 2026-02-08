<?php

/**
 * シングルページのテンプレート（汎用）
 * 通常投稿（ニュース）・カスタム投稿タイプ（制作実績など）のシングルページで使用
 */
get_header(); ?>

<?php if (have_posts()):
  while (have_posts()):

    the_post();

    $post_type = get_post_type();
?>
    <main class="l-main">
      <article class="p-single p-single--<?php echo esc_attr($post_type); ?>" itemscope itemtype="https://schema.org/Article">
        <div class="p-single__inner l-inner">
          <?php get_template_part("template-parts/single/header"); ?>
          <?php get_template_part("template-parts/single/body"); ?>
          <?php get_template_part("template-parts/single/related"); ?>
          <?php get_template_part("template-parts/single/navigation"); ?>
        </div>
      </article>
    </main>
<?php
  endwhile;
endif; ?>

<?php get_footer(); ?>