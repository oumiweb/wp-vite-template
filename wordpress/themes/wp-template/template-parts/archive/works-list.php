<?php
/**
 * 制作実績一覧のリストブロック
 * フィルタ ＋ 一覧ラッパー ＋ ループ（works-card）＋ ページネーション or 0件メッセージ
 */
$works_categories = get_terms([
  "taxonomy" => "works_category",
  "hide_empty" => true,
]); ?>
<?php if ($works_categories && !is_wp_error($works_categories)): ?>
  <div class="p-works-list__filter" role="group" aria-label="制作実績のカテゴリで絞り込み">
    <button type="button" class="p-works-list__filter-btn is-active js-works-filter-btn" data-filter="all" aria-pressed="true">
      すべて
    </button>
    <?php foreach ($works_categories as $category): ?>
      <button type="button" class="p-works-list__filter-btn js-works-filter-btn" data-filter="<?php echo esc_attr($category->slug); ?>" aria-pressed="false">
        <?php echo esc_html($category->name); ?>
      </button>
    <?php endforeach; ?>
  </div>
<?php endif; ?>

<?php get_template_part("template-parts/archive/archive-loop", null, [
  "card_slug" => "template-parts/archive/works-card",
  "list_class" => "p-works-list__grid",
  "pagination_class" => "p-archive__pagination",
  "empty_class" => "p-works-list__empty",
  "empty_message" => "制作実績が見つかりませんでした。",
]); ?>
