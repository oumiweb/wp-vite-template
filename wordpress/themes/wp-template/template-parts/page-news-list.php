<?php
/**
 * ニュース一覧のメインコンテンツ
 * home.php / archive-news.php から利用
 */
?>
<main class="l-main">
  <section class="p-news-list">
    <div class="p-news-list__inner l-inner">
      <div class="p-news-list__title">
        <?php get_template_part("template-parts/section-title", null, [
          "main" => "NEWS",
          "sub" => "ニュース",
          "align" => "left",
          "tag" => "h1",
        ]); ?>
      </div>
      <?php get_template_part("template-parts/archive/news-list"); ?>
    </div>
  </section>
</main>
