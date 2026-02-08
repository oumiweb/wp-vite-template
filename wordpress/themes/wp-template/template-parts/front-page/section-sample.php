<?php
/**
 * フロントページ: サンプルセクション
 */
?>
<section class="p-sample">
  <div class="p-sample__inner l-inner">
    <div class="p-sample__title">
      <?php get_template_part("template-parts/section-title", null, [
        "main" => "sample",
        "sub" => "サンプル",
        "align" => "center",
        "tag" => "h2",
      ]); ?>
    </div>
    <div class="p-sample__button-wrap">
      <a class="c-button" data-color="black" href="<?php page_path("contact"); ?>">問い合わせへ</a>
    </div>
    <div class="p-sample__button-wrap">
      <a class="c-button" href="<?php page_path("news"); ?>">ニュース一覧へ</a>
    </div>

    <div class="p-sample__button-wrap">
      <a class="c-button" href="<?php page_path("works"); ?>">制作実績一覧へ</a>
    </div>

    <hr class="p-sample__divider" />

    <p>背景画像の読み込み</p>
    <div class="p-sample__bg" style="background-image: url('<?php echo esc_url(get_theme_file_uri("/assets/images/bg_sample.webp")); ?>');"></div>

    <hr class="p-sample__divider" />

    <p>通常画像の読み込み(imgの下部をマスクでフェードかけてます)</p>
    <div class="p-sample__image">
      <img src="<?php assets_path("/images/image_sample.webp"); ?>" width="512" height="512" alt="猫の画像" />
    </div>
  </div>
</section>