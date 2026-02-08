<?php

/**
 * 制作実績詳細ページのテンプレート
 */
get_header(); ?>

<?php if (have_posts()):
  while (have_posts()):

    the_post();
    $archive_link = get_page_url("works");
?>
    <main class="l-main">
      <article class="p-single p-single--works" itemscope itemtype="https://schema.org/CreativeWork">
        <div class="p-single__inner l-inner">

          <?php get_template_part("template-parts/single/works-header"); ?>
          <?php get_template_part("template-parts/single/works-thumbnail"); ?>
          <?php get_template_part("template-parts/single/works-body"); ?>
          <?php get_template_part("template-parts/single/works-navigation"); ?>

          <?php if ($archive_link): ?>
            <div class="p-single__back">
              <a href="<?php echo esc_url($archive_link); ?>" class="c-button">制作実績一覧へ戻る</a>
            </div>
          <?php endif; ?>
        </div>
      </article>
    </main>
<?php
  endwhile;
endif; ?>

<?php get_footer(); ?>