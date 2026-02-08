<?php
/**
 * セクションタイトルパーツ
 *
 * 役割: 英字ラベル + 日本語サブの見出し（.c-section-title）を出力。ラッパーは呼び出し側で囲む。
 * 使用: get_template_part('template-parts/section-title', null, ["main" => "...", "sub" => "...", "align" => "center"|"left"|"right", "tag" => "h1"|"h2"])。
 */

// get_template_part の第3引数は set_query_var('args', $args) で渡される
if (!isset($args) || !is_array($args)) {
  $args = get_query_var("args");
}
$args = is_array($args) ? $args : [];

$main = isset($args["main"]) ? (string) $args["main"] : "";
$sub = isset($args["sub"]) ? (string) $args["sub"] : "";
$align = isset($args["align"]) ? (string) $args["align"] : "center";
$tag = isset($args["tag"]) ? (string) $args["tag"] : "h2";

$align = in_array($align, ["center", "left", "right"], true) ? $align : "center";
$tag = $tag === "h1" ? "h1" : "h2";
$heading_open = "<{$tag} class=\"c-section-title__main\">";
$heading_close = "</{$tag}>";
?>
<hgroup class="c-section-title" data-align="<?php echo esc_attr($align); ?>">
  <?php echo $heading_open . esc_html($main) . $heading_close; ?>
  <p class="c-section-title__sub"><?php echo esc_html($sub); ?></p>
</hgroup>