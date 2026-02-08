/**
 * ファイル操作の共通ユーティリティ
 */
import fs from "fs";
import path from "path";
import { promises as fsPromises } from "fs";

/**
 * ディレクトリが存在しない場合は作成
 * @param {string} dirPath - ディレクトリパス
 * @returns {boolean} 作成されたかどうか
 */
export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

/**
 * ファイルが存在するか確認
 * @param {string} filePath - ファイルパス
 * @returns {boolean}
 */
export function exists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * ファイルを読み込み
 * @param {string} filePath - ファイルパス
 * @param {string} encoding - エンコーディング（デフォルト: 'utf8'）
 * @returns {string}
 */
export function readFile(filePath, encoding = "utf8") {
  return fs.readFileSync(filePath, encoding);
}

/**
 * ファイルを書き込み
 * @param {string} filePath - ファイルパス
 * @param {string} content - 内容
 * @param {string} encoding - エンコーディング（デフォルト: 'utf8'）
 */
export function writeFile(filePath, content, encoding = "utf8") {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, content, encoding);
}

/**
 * JSONファイルを読み込み
 * @param {string} filePath - ファイルパス
 * @returns {object}
 */
export function readJson(filePath) {
  return JSON.parse(readFile(filePath));
}

/**
 * JSONファイルを書き込み
 * @param {string} filePath - ファイルパス
 * @param {object} data - データ
 * @param {number} indent - インデント（デフォルト: 2）
 */
export function writeJson(filePath, data, indent = 2) {
  const content = JSON.stringify(data, null, indent) + "\n";
  writeFile(filePath, content);
}

/**
 * ファイルのタイムスタンプを更新（touch）
 * @param {string} filePath - ファイルパス
 * @returns {Promise<void>}
 */
export async function touchFile(filePath) {
  try {
    await fsPromises.access(filePath);
    const now = new Date();
    await fsPromises.utimes(filePath, now, now);
  } catch (e) {
    throw new Error(`Failed to touch file: ${filePath}`, { cause: e });
  }
}

/**
 * ファイルをコピー
 * @param {string} src - ソースパス
 * @param {string} dest - コピー先パス
 */
export function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

/**
 * ディレクトリをリネーム
 * @param {string} oldPath - 旧パス
 * @param {string} newPath - 新パス
 */
export function renameDir(oldPath, newPath) {
  if (!fs.existsSync(oldPath)) {
    throw new Error(`Directory does not exist: ${oldPath}`);
  }
  if (fs.existsSync(newPath)) {
    throw new Error(`Target directory already exists: ${newPath}`);
  }
  fs.renameSync(oldPath, newPath);
}
