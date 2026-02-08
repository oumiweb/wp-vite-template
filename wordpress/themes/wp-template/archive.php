<?php
/**
 * アーカイブページのテンプレート
 * カテゴリー、タグ、日付、著者などの条件別アーカイブで使用。
 * 通常投稿（post）のカテゴリー／タグ等は home と同じニュース一覧スタイル（page-news-list）で表示。
 * メインの投稿一覧は home.php（表示設定の「投稿ページ」）を使用。
 */
if (is_post_type_archive("post") || is_category() || is_tag() || is_author() || is_date()) {
  get_header();
  get_template_part("template-parts/page-news-list");
  get_footer();
  return;
}

get_header();

$post_type = get_post_type();
$post_type_class = $post_type === "post" ? "" : "p-archive--" . $post_type;
?>
<main class="l-main">
  <section class="p-archive <?php echo esc_attr($post_type_class); ?>">
    <div class="p-archive__inner l-inner">
      <header class="p-archive__header">
        <?php
        $title_parts = get_archive_title_parts();
        $description = "";
        if (is_category()) {
          $description = category_description();
        } elseif (is_post_type_archive()) {
          $description = get_the_archive_description();
        } elseif (is_tag()) {
          $description = tag_description();
        }
        ?>
        <div class="p-archive__title">
          <?php get_template_part("template-parts/section-title", null, [
            "main" => $title_parts["title_label"],
            "sub" => $title_parts["title_text"],
            "align" => "center",
            "tag" => "h1",
          ]); ?>
        </div>
        <?php if (!empty($description)): ?>
          <div class="p-archive__description">
            <?php echo wp_kses_post($description); ?>
          </div>
        <?php endif; ?>
      </header>

      <?php get_template_part("template-parts/archive/archive-list"); ?>
    </div>
  </section>
</main>
<?php get_footer(); ?>
