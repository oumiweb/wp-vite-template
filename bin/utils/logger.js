/**
 * 統一されたログ出力ユーティリティ
 */

const PREFIXES = {
  "update-wp-config": "[update-wp-config]",
  "convert-images": "[convert-images]",
  "watch-scss": "[watch-scss]",
  "watch-wp": "[watch-wp]",
  "create-post": "[create-post]",
};

/**
 * ログを出力
 * @param {string} module - モジュール名
 * @param {string} message - メッセージ
 * @param {'log'|'error'|'warn'} level - ログレベル
 */
export function log(module, message, level = "log") {
  const prefix = PREFIXES[module] || `[${module}]`;
  const output = `${prefix} ${message}`;

  switch (level) {
    case "error":
      console.error(output);
      break;
    case "warn":
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

/**
 * 成功メッセージを出力
 */
export function success(module, message) {
  log(module, `✓ ${message}`);
}

/**
 * エラーメッセージを出力
 */
export function error(module, message, err = null) {
  log(module, `✗ ${message}`, "error");
  if (err) {
    console.error(err);
  }
}
