<?php get_header(); ?>

<main class="l-main">
  <?php while (have_posts()):
    the_post(); ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class("p-page"); ?>>
      <div class="p-page__inner l-inner">
        <header class="p-page__header">
          <h1 class="p-page__title"><?php echo esc_html(get_the_title()); ?></h1>
        </header>
        <div class="p-page__content">
          <?php the_content(); ?>
        </div>
      </div>
    </article>
  <?php
  endwhile; ?>
</main>

<?php get_footer();
