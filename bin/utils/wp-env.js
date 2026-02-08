/**
 * WordPress @wordpress/env 関連の共通ユーティリティ
 */
import { spawnSync } from "child_process";
import { projectRoot } from "./paths.js";

/**
 * WordPress 環境（wp-env）が起動しているかどうかを判定する
 * @returns {boolean}
 */
export function isWordPressEnvRunning() {
  try {
    // wp-env 10に対応: spawnSyncを使用
    // shell: true を使う場合は、第1引数は文字列で渡す必要がある
    const result = spawnSync("wp-env info", {
      cwd: projectRoot,
      stdio: "pipe",
      encoding: "utf8",
      shell: true,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * CLIコンテナが起動しているかどうかを確認する
 * @returns {boolean}
 */
export function isCliContainerRunning() {
  try {
    // wp-env run cli コマンドでコンテナの状態を確認
    // コンテナが起動していない場合はエラーになる
    const result = spawnSync("wp-env run cli echo test", {
      cwd: projectRoot,
      stdio: "pipe",
      encoding: "utf8",
      shell: true,
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * CLIコンテナを起動する（必要に応じて）
 * wp-env 10では、wp-env startだけではCLIコンテナが起動しない場合がある
 * @returns {boolean} 起動に成功したかどうか
 */
export function ensureCliContainerRunning() {
  try {
    // wp-env start を実行して、すべてのコンテナ（CLIコンテナを含む）を確実に起動する
    // 既に起動している場合は何もしない
    const startResult = spawnSync("wp-env start", {
      cwd: projectRoot,
      stdio: "pipe",
      encoding: "utf8",
      shell: true,
      timeout: 60000, // 60秒のタイムアウト（初回起動に時間がかかる場合がある）
    });

    // wp-env start が成功したか、または既に起動している場合（エラーコード0または既存のコンテナ）
    if (startResult.status === 0) {
      // CLIコンテナが実際に起動しているか確認
      const checkResult = spawnSync("wp-env run cli echo ready", {
        cwd: projectRoot,
        stdio: "pipe",
        encoding: "utf8",
        shell: true,
        timeout: 30000, // 30秒のタイムアウト
      });
      return checkResult.status === 0;
    }

    return false;
  } catch {
    return false;
  }
}
