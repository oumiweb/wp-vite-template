<?php

/**
 * Vite対応のスクリプトとスタイル読み込み処理
 */
function add_vite_scripts()
{
  // jQuery は deregister しない（WordPress 6.9 以降、current-template-js 等が jquery に依存しており、
  // 未登録の依存で Notice が出るため。テーマの script は jquery を deps に含めないので、必要な時だけ読み込まれる）

  $dev_manifest = get_vite_manifest();

  if ($dev_manifest !== false && isset($dev_manifest["url"])) {
    // ============================================
    // 開発環境（Vite開発サーバーから読み込み）
    // ============================================
    $baseUrl = $dev_manifest["url"];

    // Vite Client（HMR対応）
    wp_enqueue_script("vite-client", $baseUrl . "@vite/client", [], null, true);

    // メインJS (script.js -> key: script)
    // vite.config.jsのinputsForWordPress設定に基づく
    if (isset($dev_manifest["inputs"]["script"])) {
      wp_enqueue_script("theme-scripts", $baseUrl . $dev_manifest["inputs"]["script"], [], null, true);
    }

    // CSSはJS内でimportされている場合、Viteが自動的に注入するため明示的な読み込みは不要
  } else {
    // ============================================
    // 本番環境（ビルド済みファイルから読み込み）
    // manifest.jsonを使用してハッシュ付きファイル名でキャッシュバスティング
    // ============================================
    $root = get_template_directory_uri();
    $build_manifest = get_build_manifest();

    if ($build_manifest !== false) {
      // manifest.jsonを使用する方式（推奨）
      // ハッシュ付きファイル名で確実なキャッシュバスティング

      // 1. メインCSS（style.scss）を読み込み
      $style_entry = $build_manifest["assets/styles/style.scss"] ?? null;
      if ($style_entry && isset($style_entry["file"])) {
        $style_path = $root . "/" . $style_entry["file"];
        // manifest.jsonのファイル名にハッシュが含まれているため、バージョンは不要
        wp_enqueue_style("theme-styles", $style_path, [], null, false);
      }

      // 2. メインJS（script.js）を読み込み
      $script_entry = $build_manifest["assets/js/script.js"] ?? null;
      if ($script_entry && isset($script_entry["file"])) {
        $script_path = $root . "/" . $script_entry["file"];
        // JSファイルに関連するCSSがあれば読み込み
        if (isset($script_entry["css"]) && is_array($script_entry["css"])) {
          foreach ($script_entry["css"] as $css_file) {
            wp_enqueue_style("theme-script-css", $root . "/" . $css_file, [], null, false);
          }
        }
        wp_enqueue_script("theme-scripts", $script_path, [], null, true);
      }
    } else {
      // manifest.jsonが存在しない場合のフォールバック
      // 固定ファイル名 + filemtime()でバージョン管理
      $assets_dir = get_template_directory() . "/assets";

      // ビルドで生成されたCSSファイルを取得
      $css_files = glob($assets_dir . "/styles/*.css");

      // 1. ライブラリ系CSS（style.css 以外）を先に読み込む
      if (is_array($css_files)) {
        foreach ($css_files as $css_file) {
          if (!is_file($css_file) || !is_readable($css_file)) {
            continue;
          }

          $filename = basename($css_file, ".css");

          // style.css は後でまとめて読み込む
          if ($filename === "style") {
            continue;
          }

          $css_path = $root . "/assets/styles/" . basename($css_file);
          $version = get_file_version($css_file);
          if ($version !== null) {
            wp_enqueue_style("theme-" . $filename, $css_path, [], $version, false);
          }
        }
      }

      // 2. メインCSS（style.css）は最後に読み込み、テーマ側のスタイルを優先させる
      $style_path = $root . "/assets/styles/style.css";
      $style_file = $assets_dir . "/styles/style.css";
      $version = get_file_version($style_file);
      if ($version !== null) {
        wp_enqueue_style("theme-styles", $style_path, [], $version, false);
      }

      // メインJS（ファイル更新日時をバージョンとして使用）
      $script_path = $root . "/assets/js/script.js";
      $script_file = $assets_dir . "/js/script.js";
      $version = get_file_version($script_file);
      if ($version !== null) {
        wp_enqueue_script("theme-scripts", $script_path, [], $version, true);
      }
    }
  }

  // Google Fonts
  wp_enqueue_style("google-fonts", "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&family=Noto+Serif+JP:wght@200..900&display=swap", false);
}

add_action("wp_enqueue_scripts", "add_vite_scripts", 10);

/**
 * global-styles-inline-cssを無効化
 * theme.jsonから自動生成されるインラインCSSを出力しないようにする
 */
function disable_global_styles()
{
  // global-stylesを無効化
  wp_dequeue_style("global-styles");
  wp_deregister_style("global-styles");

  // インラインCSSとして出力される場合も無効化
  remove_action("wp_enqueue_scripts", "wp_enqueue_global_styles");
  remove_action("wp_footer", "wp_enqueue_global_styles", 1);
}
add_action("wp_enqueue_scripts", "disable_global_styles", 100);

/**
 * after_setup_themeでglobal-stylesを無効化
 */
function disable_global_styles_on_setup()
{
  remove_action("wp_enqueue_scripts", "wp_enqueue_global_styles");
  remove_action("wp_footer", "wp_enqueue_global_styles", 1);
}
add_action("after_setup_theme", "disable_global_styles_on_setup", 100);

/**
 * ES Modules対応（type="module"属性を追加）
 */
function add_vite_module_attribute($tag, $handle, $src)
{
  // Vite関連のスクリプトにmodule属性を追加
  $module_handlers = ["theme-scripts", "vite-client"];

  if (in_array($handle, $module_handlers)) {
    $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
  }

  return $tag;
}
add_filter("script_loader_tag", "add_vite_module_attribute", 10, 3);

/**
 * Google Fonts最適化（プリコネクト）
 */
function add_font_preconnect($html, $handle)
{
  if ("google-fonts" === $handle) {
    $html = <<<EOT
    <link rel='preconnect' href='https://fonts.googleapis.com'>
    <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin>
    $html
    EOT;
  }
  return $html;
}
add_filter("style_loader_tag", "add_font_preconnect", 10, 2);
