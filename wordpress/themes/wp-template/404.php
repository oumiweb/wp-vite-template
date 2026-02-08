<?php get_header(); ?>

<main class="l-main">
  <section class="p-error error-404 not-found">
    <div class="p-error__inner l-inner">
      <header class="p-error__header">
        <h1 class="p-error__title"><?php esc_html_e("ページが見つかりませんでした", "wp-template"); ?></h1>
      </header>
      <div class="p-error__content">
        <p><?php esc_html_e("申し訳ございませんが、お探しのページは見つかりませんでした。URLをご確認いただくか、トップページから再度お探しください。", "wp-template"); ?></p>
        <p>
          <a href="<?php echo esc_url(home_url("/")); ?>" class="c-button" data-color="black"><?php esc_html_e("トップページへ戻る", "wp-template"); ?></a>
        </p>
      </div>
    </div>
  </section>
</main>

<?php get_footer();
