<?php
/*
Template Name: Contact
*/
get_header(); ?>
<main class="l-main">
  <section class="p-contact">
    <div class="p-contact__inner l-inner">
      <div class="p-contact__title">
        <?php get_template_part("template-parts/section-title", null, [
          "main" => "CONTACT",
          "sub" => "お問い合わせ",
          "align" => "center",
          "tag" => "h2",
        ]); ?>
      </div>
      <div class="p-contact__form">
        <?php // 販売後特典SQL（投稿ページ＋CF7フォーム設定）をインポートすると、このIDのフォームが表示されます。

// 特典SQLを入れていない場合はフォーム未設定（CF7のメッセージや空欄）になります。
        echo do_shortcode('[contact-form-7 id="c86f2bc" title="Contact form 1"]'); ?>
      </div>
    </div>
  </section>
</main>
<?php get_footer(); ?>
