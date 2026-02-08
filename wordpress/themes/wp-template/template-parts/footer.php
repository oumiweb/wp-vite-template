<footer class="p-footer">
  <div class="p-footer__inner l-inner">
    <div class="p-footer__content">
      <div class="p-footer__logo">
        <a href="<?php echo esc_url(home_url("/")); ?>">
          <img src="<?php echo esc_url(get_theme_file_uri("/assets/images/logo_vite.svg")); ?>" alt="vite" />
        </a>
      </div>
      <nav class="p-footer__nav">
        <ul class="p-footer__nav-list">
          <li class="p-footer__nav-item"><a href="<?php page_path("works"); ?>">制作実績</a></li>
          <li class="p-footer__nav-item"><a href="<?php page_path("news"); ?>">ニュース</a></li>
          <li class="p-footer__nav-item"><a href="<?php page_path("contact"); ?>">お問い合わせ</a></li>
        </ul>
      </nav>
    </div>
    <div class="p-footer__bottom">
      <p class="p-footer__copyright">&copy; <?php echo esc_html(date("Y")); ?> <?php echo esc_html(get_bloginfo("name")); ?>. All rights reserved.</p>
    </div>
  </div>
</footer>
