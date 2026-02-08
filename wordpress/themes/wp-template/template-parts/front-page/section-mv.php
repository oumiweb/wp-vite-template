<?php
/**
 * フロントページ: MV セクション
 */
?>
<section class="p-mv">
  <div class="p-mv__inner">
    <div class="p-mv__title-wrap">
      <h2 class="p-mv__main-title">メインタイトル</h2>
      <p class="p-mv__sub-title">
        ここにサブタイトルが入ります。<br />ここにサブタイトルが入ります。ここにサブタイトルが入ります。<br />ここにサブタイトルが入ります。
      </p>
    </div>
    <div class="p-mv__splide splide js-mv-splide" aria-label="main-visual">
      <div class="splide__track">
        <ul class="splide__list">
          <li class="splide__slide">
            <div class="splide__slide-image">
              <img src="<?php echo esc_url(get_theme_file_uri("/assets/images/image_mv_01.webp")); ?>" width="977" height="1800" alt="" fetchpriority="high" />
            </div>
          </li>
          <li class="splide__slide">
            <div class="splide__slide-image">
              <img src="<?php echo esc_url(get_theme_file_uri("/assets/images/image_mv_02.webp")); ?>" width="977" height="1800" alt="" />
            </div>
          </li>
          <li class="splide__slide">
            <div class="splide__slide-image">
              <img src="<?php echo esc_url(get_theme_file_uri("/assets/images/image_mv_03.webp")); ?>" width="977" height="1800" alt="" />
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
