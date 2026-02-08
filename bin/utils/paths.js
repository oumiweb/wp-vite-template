/**
 * 共通のパス解決ユーティリティ
 */
import { fileURLToPath } from "node:url";
import { resolve, dirname, basename } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// プロジェクトルート（bin/ の親ディレクトリ）
export const projectRoot = resolve(__dirname, "..", "..");

// テーマ名（プロジェクトルートのディレクトリ名）
export const THEME_NAME = basename(projectRoot);

// よく使うパス
export const paths = {
  wpEnvConfig: resolve(projectRoot, ".wp-env.json"),
  styleCss: resolve(projectRoot, `wordpress/themes/${THEME_NAME}/style.css`),
  wpThemesDir: resolve(projectRoot, `wordpress/themes/${THEME_NAME}`),
  themeDir: resolve(projectRoot, `wordpress/themes/${THEME_NAME}`), // wpThemesDirのエイリアス
  wpImagesDir: resolve(projectRoot, `wordpress/themes/${THEME_NAME}/assets/images`),
  srcImagesDir: resolve(projectRoot, "src/assets/images"),
  styleScss: resolve(projectRoot, "src/assets/styles/style.scss"),
};
