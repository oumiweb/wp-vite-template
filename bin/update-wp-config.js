import { spawnSync } from "child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "path";
import { projectRoot, THEME_NAME, paths } from "./utils/paths.js";
import { log, success, error } from "./utils/logger.js";
import { exists, readJson, writeJson, readFile, writeFile, ensureDir, renameDir } from "./utils/fs-utils.js";
import { isWordPressEnvRunning } from "./utils/wp-env.js";
import { readdirSync, statSync } from "fs";

// コマンドライン引数を取得
const args = process.argv.slice(2);
const updateWpEnv = args.includes("--wp-env") || args.includes("--config") || args.length === 0;
const updateDb = args.includes("--db") || args.includes("--theme") || args.length === 0;
const updateStyleCss = args.includes("--style-css") || args.length === 0;

/**
 * 既存のテーマディレクトリ名を検出
 * wordpress/themes/ 内の style.css が存在するディレクトリを探す
 * @returns {string|null} テーマディレクトリ名、見つからない場合は null
 */
function detectExistingThemeName() {
  const themesBaseDir = resolve(projectRoot, "wordpress/themes");

  // themesディレクトリが存在しない場合は null を返す
  if (!exists(themesBaseDir)) {
    return null;
  }

  try {
    // themesディレクトリ内の既存ディレクトリを検索
    const entries = readdirSync(themesBaseDir);
    const existingThemeDirs = entries.filter(entry => {
      const entryPath = resolve(themesBaseDir, entry);
      return statSync(entryPath).isDirectory();
    });

    // style.cssが存在するディレクトリを探す（実際のテーマディレクトリ）
    for (const dir of existingThemeDirs) {
      const styleCssPath = resolve(themesBaseDir, dir, "style.css");
      if (exists(styleCssPath)) {
        return dir;
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * .wp-env.json の設定を更新
 * config/plugins.json からプラグイン設定も読み込んで更新
 *
 * 注意: mappings を使用している場合は themes 配列は不要です
 */
function updateWpEnvConfig() {
  if (!updateWpEnv) return;

  log("update-wp-config", `Updating .wp-env.json configuration`);

  try {
    // .wp-env.json を読み込み
    if (!exists(paths.wpEnvConfig)) {
      error("update-wp-config", ".wp-env.json not found");
      return false;
    }

    const config = readJson(paths.wpEnvConfig);

    let configUpdated = false;

    // mappings が存在する場合は themes 配列は不要（mappings が優先される）
    // mappings がない場合のみ themes 配列を更新
    if (!config.mappings || !config.mappings["wp-content/themes"]) {
      const themePath = `./wordpress/themes/${THEME_NAME}`;
      if (!config.themes || !Array.isArray(config.themes) || config.themes[0] !== themePath) {
        config.themes = [themePath];
        configUpdated = true;
        log("update-wp-config", `Updated themes array: ${themePath}`);
      }
    } else {
      log("update-wp-config", "Using mappings for themes (themes array not needed)");
    }

    // プラグイン設定を config/plugins.json から読み込んで更新
    const themeDir = resolve(projectRoot, `wordpress/themes/${THEME_NAME}`);
    const pluginsJsonPath = resolve(themeDir, "config/plugins.json");
    if (exists(pluginsJsonPath)) {
      try {
        const pluginsData = readJson(pluginsJsonPath);
        if (pluginsData.plugins && Array.isArray(pluginsData.plugins)) {
          const pluginSources = pluginsData.plugins.map(plugin => plugin.source).filter(source => source); // sourceが存在するもののみ

          // プラグインリストが変更されている場合は更新
          const currentPlugins = config.plugins || [];
          const pluginsChanged = JSON.stringify(currentPlugins.sort()) !== JSON.stringify(pluginSources.sort());

          if (pluginsChanged) {
            config.plugins = pluginSources;
            configUpdated = true;
            log("update-wp-config", `Updated plugins from config/plugins.json (${pluginSources.length} plugins)`);
          }
        }
      } catch (err) {
        error("update-wp-config", "Failed to read config/plugins.json", err);
        // エラーが発生しても続行（プラグイン設定の更新はオプション）
      }
    } else {
      log("update-wp-config", "config/plugins.json not found, skipping plugin update");
    }

    // 設定が更新された場合のみ書き込み
    if (configUpdated) {
      writeJson(paths.wpEnvConfig, config);
      success("update-wp-config", `Updated .wp-env.json`);
      if (config.themes) {
        log("update-wp-config", `  - themes: ${config.themes[0]}`);
      } else if (config.mappings && config.mappings["wp-content/themes"]) {
        log("update-wp-config", `  - themes: using mappings (${config.mappings["wp-content/themes"]})`);
      }
      if (config.plugins) {
        log("update-wp-config", `  - plugins: ${config.plugins.length} plugins`);
      }
    } else {
      success("update-wp-config", ".wp-env.json is already correct");
      if (config.themes) {
        log("update-wp-config", `  - themes: ${config.themes[0]}`);
      } else if (config.mappings && config.mappings["wp-content/themes"]) {
        log("update-wp-config", `  - themes: using mappings (${config.mappings["wp-content/themes"]})`);
      }
      if (config.plugins) {
        log("update-wp-config", `  - plugins: ${config.plugins.length} plugins`);
      }
    }
    return true;
  } catch (err) {
    error("update-wp-config", "Failed to update .wp-env.json", err);
    return false;
  }
}

/**
 * 既存のテーマディレクトリをプロジェクトルート名にリネーム
 */
function renameThemeDirectory() {
  const themesBaseDir = resolve(projectRoot, "wordpress/themes");

  // themesディレクトリが存在しない場合はスキップ
  if (!exists(themesBaseDir)) {
    return true;
  }

  // 既に正しい名前のディレクトリが存在する場合はスキップ
  const targetThemeDir = resolve(themesBaseDir, THEME_NAME);
  if (exists(targetThemeDir)) {
    return true;
  }

  try {
    // 既存のテーマディレクトリ名を検出
    const existingThemeName = detectExistingThemeName();

    if (!existingThemeName) {
      // テーマディレクトリが見つからない場合はスキップ
      return true;
    }

    // 既存のテーマディレクトリ名がプロジェクトルート名と異なる場合のみリネーム
    if (existingThemeName !== THEME_NAME) {
      const oldPath = resolve(themesBaseDir, existingThemeName);
      const newPath = resolve(themesBaseDir, THEME_NAME);

      log("update-wp-config", `Renaming theme directory: ${existingThemeName} → ${THEME_NAME}`);
      renameDir(oldPath, newPath);
      success("update-wp-config", `Renamed theme directory: ${existingThemeName} → ${THEME_NAME}`);
      return true;
    }

    return true;
  } catch (err) {
    error("update-wp-config", "Failed to rename theme directory", err);
    return false;
  }
}

/**
 * style.css の Theme Name を更新
 * Vite プラグインからも使用可能
 */
export function updateStyleCssFile() {
  try {
    // テーマ名に基づいて style.css のパスを決定
    const styleCssPath = resolve(projectRoot, `wordpress/themes/${THEME_NAME}/style.css`);

    // style.css が存在しない場合は作成
    if (!exists(styleCssPath)) {
      ensureDir(resolve(styleCssPath, ".."));

      // デフォルトの style.css を作成
      const defaultContent = `/*!
Theme Name: ${THEME_NAME}
Description: テンプレート
Version: 1.0.0
Author: 
*/`;
      writeFile(styleCssPath, defaultContent);
      log("update-wp-config", `Created: wordpress/themes/${THEME_NAME}/style.css`);
      return true;
    }

    // 既存の style.css を読み込み
    let content = readFile(styleCssPath);

    // コメントブロックが /*! で始まっているか確認
    if (!content.trim().startsWith("/*!")) {
      // コメントブロックがない、または /* で始まっている場合は完全に書き換え
      const defaultContent = `/*!
Theme Name: ${THEME_NAME}
Description: テンプレート
Version: 1.0.0
Author: 
*/`;
      writeFile(styleCssPath, defaultContent);
      log("update-wp-config", "Rewrote style.css with proper header");
      return true;
    }

    // Theme Name を更新（既存の Theme Name を置換）
    const themeNameRegex = /Theme Name:\s*.*/;
    if (themeNameRegex.test(content)) {
      const updatedContent = content.replace(themeNameRegex, `Theme Name: ${THEME_NAME}`);
      if (updatedContent !== content) {
        writeFile(styleCssPath, updatedContent);
        success("update-wp-config", `Updated Theme Name to: ${THEME_NAME}`);
        return true;
      }
    } else {
      // Theme Name が見つからない場合は追加
      const headerMatch = content.match(/\/\*!\s*\n/);
      if (headerMatch) {
        const insertPosition = headerMatch.index + headerMatch[0].length;
        const newContent = content.slice(0, insertPosition) + `Theme Name: ${THEME_NAME}\n` + content.slice(insertPosition);
        writeFile(styleCssPath, newContent);
        success("update-wp-config", `Added Theme Name: ${THEME_NAME}`);
        return true;
      }
    }
    return true;
  } catch (err) {
    error("update-wp-config", "Failed to update style.css", err);
    return false;
  }
}

/**
 * WordPress のデータベース内のテーマ名を更新
 */
function updateWordPressDatabase() {
  if (!updateDb) return;

  log("update-wp-config", `Updating WordPress database theme name to: ${THEME_NAME}`);

  // WordPress環境が起動しているかチェック
  if (!isWordPressEnvRunning()) {
    log("update-wp-config", "⚠ WordPress environment is not running.");
    log("update-wp-config", "  Skipping database update. Run `yarn wp-start` first if you want to update the database.");
    log("update-wp-config", "  Note: This is optional - .wp-env.json and style.css have been updated successfully.");
    return true; // エラーではなく、スキップとして扱う
  }

  try {
    // WordPress のデータベースでテーマ名を更新
    const commands = [`wp option update template ${THEME_NAME}`, `wp option update stylesheet ${THEME_NAME}`];

    let successCount = 0;

    for (const cmd of commands) {
      try {
        log("update-wp-config", `Executing: ${cmd}`);
        const fullCommand = `wp-env run cli ${cmd}`;
        const result = spawnSync(fullCommand, {
          cwd: projectRoot,
          stdio: "inherit",
          encoding: "utf8",
          shell: true,
        });
        if (result.status !== 0) {
          throw new Error(`Command failed with status ${result.status}`);
        }
        success("update-wp-config", `Success: ${cmd}`);
        successCount++;
      } catch (err) {
        error("update-wp-config", `Error executing: ${cmd}`, err);
      }
    }

    if (successCount > 0) {
      log("update-wp-config", "");
      success("update-wp-config", "WordPress database theme name updated successfully!");
      log("update-wp-config", "Please refresh your WordPress admin panel.");
      return true;
    } else {
      error("update-wp-config", "Failed to update WordPress database.");
      return false;
    }
  } catch (err) {
    error("update-wp-config", "Failed to update WordPress database", err);
    return false;
  }
}

// メイン処理
function main() {
  log("update-wp-config", `Theme name: ${THEME_NAME}\n`);

  let wpEnvSuccess = true;
  let dbSuccess = true;
  let styleCssSuccess = true;
  let renameSuccess = true;

  // まず既存のテーマディレクトリをプロジェクトルート名にリネーム
  renameSuccess = renameThemeDirectory();

  if (updateWpEnv) {
    wpEnvSuccess = updateWpEnvConfig();
  }

  if (updateStyleCss) {
    styleCssSuccess = updateStyleCssFile();
  }

  if (updateDb) {
    dbSuccess = updateWordPressDatabase();
  }

  // 結果をまとめて表示
  log("update-wp-config", "");
  log("update-wp-config", "Summary:");
  if (renameSuccess !== undefined) {
    log("update-wp-config", `  Theme directory: ${renameSuccess ? "✓ Updated" : "✗ Failed"}`);
  }
  if (updateWpEnv) {
    log("update-wp-config", `  .wp-env.json: ${wpEnvSuccess ? "✓ Updated" : "✗ Failed"}`);
  }
  if (updateStyleCss) {
    log("update-wp-config", `  style.css: ${styleCssSuccess ? "✓ Updated" : "✗ Failed"}`);
  }
  if (updateDb) {
    log("update-wp-config", `  WordPress DB: ${dbSuccess ? "✓ Updated" : "✗ Failed"}`);
  }

  // エラーがある場合は終了コード1で終了
  if (!renameSuccess || (updateWpEnv && !wpEnvSuccess) || (updateStyleCss && !styleCssSuccess) || (updateDb && !dbSuccess)) {
    process.exit(1);
  }
}

/**
 * Viteプラグインとして使用する場合
 * vite-plugin-update-style-css.js の代替として使用可能
 */
export default function vitePluginUpdateStyleCss() {
  return {
    name: "update-style-css",
    enforce: "pre",
    buildStart() {
      // ビルド開始時に style.css を更新
      updateStyleCssFile();
    },
    configureServer() {
      // 開発サーバー起動時にも更新
      updateStyleCssFile();
    },
  };
}

// スクリプトとして直接実行された場合のみ main() を実行
// import.meta.url を file:// から通常のパスに変換して比較
const currentFile = fileURLToPath(import.meta.url);
const scriptFile = resolve(process.argv[1]);
if (currentFile === scriptFile) {
  main();
}
