#!/usr/bin/env node

/**
 * 本番環境用ビルド後のクリーンアップスクリプト
 * 開発環境専用ファイル（manifest.dev.json など）を削除
 */

import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, rmSync, unlinkSync, statSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

// テーマ名を取得（プロジェクトルート名から）
const themeName = projectRoot.split("/").pop();
const themeDir = resolve(projectRoot, `wordpress/themes/${themeName}`);

// 削除対象のファイル（manifest.dev.jsonのみ）
// 注意: .vite/manifest.jsonは本番環境で必要なので削除しない
const filesToRemove = [
  `${themeDir}/manifest.dev.json`,
];

console.log(`[clean-dev-files] クリーンアップを開始: ${themeDir}`);

let removedCount = 0;

// ファイル・ディレクトリを削除
filesToRemove.forEach((path) => {
  if (existsSync(path)) {
    try {
      const stats = statSync(path);
      if (stats.isDirectory()) {
        // ディレクトリの場合は再帰的に削除
        rmSync(path, { recursive: true, force: true });
        removedCount++;
        console.log(`[clean-dev-files] ✓ 削除: ${path}/ (ディレクトリ)`);
      } else {
        // ファイルの場合は削除
        unlinkSync(path);
        removedCount++;
        console.log(`[clean-dev-files] ✓ 削除: ${path}`);
      }
    } catch (err) {
      console.warn(`[clean-dev-files] ⚠ 削除失敗: ${path} - ${err.message}`);
    }
  }
});

if (removedCount > 0) {
  console.log(`[clean-dev-files] 完了: ${removedCount}個のファイル/ディレクトリを削除しました`);
} else {
  console.log(`[clean-dev-files] 削除対象のファイルは見つかりませんでした`);
}
