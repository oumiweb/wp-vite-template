import path from "path";
import sharp from "sharp";
import { watch } from "chokidar";
import { resolve, relative } from "path";
import fs from "fs";
import { THEME_NAME, paths, projectRoot } from "./utils/paths.js";

/**
 * 開発環境で画像を WebP/AVIF に変換する Vite プラグイン
 * src/assets/images/ と wordpress/themes/{THEME_NAME}/assets/images/ の両方に出力
 *
 * @param {Object} options - プラグインオプション
 * @param {string} options.format - 変換形式 ('webp' or 'avif')
 * @param {boolean} options.copyOriginal - 元画像も WordPress ディレクトリにコピーするか
 * @returns {Object} Vite プラグインオブジェクト
 */
export default function convertImages(options = { format: "webp", copyOriginal: false }) {
  const { format: imageFormat = "webp", copyOriginal = false } = options;

  // 画像を変換して src と WordPress ディレクトリの両方に出力する関数
  const convertAndCopyImages = async sourcePath => {
    if (!/\.(png|jpe?g)$/.test(sourcePath)) {
      return;
    }

    const relativePath = relative(paths.srcImagesDir, sourcePath);
    const relativeDir = path.dirname(relativePath);
    const base = path.basename(sourcePath, path.extname(sourcePath));
    const ext = path.extname(sourcePath);

    // src 用の出力先ディレクトリ
    const srcOutputDir = relativeDir === "." ? paths.srcImagesDir : resolve(paths.srcImagesDir, relativeDir);
    // WordPress用の出力先ディレクトリ
    const wpOutputDir = relativeDir === "." ? paths.wpImagesDir : resolve(paths.wpImagesDir, relativeDir);

    // 出力先ディレクトリが存在しない場合は作成
    if (!fs.existsSync(srcOutputDir)) {
      fs.mkdirSync(srcOutputDir, { recursive: true });
    }
    if (!fs.existsSync(wpOutputDir)) {
      fs.mkdirSync(wpOutputDir, { recursive: true });
    }

    const srcWebpPath = resolve(srcOutputDir, `${base}.webp`);
    const srcAvifPath = resolve(srcOutputDir, `${base}.avif`);
    const wpWebpPath = resolve(wpOutputDir, `${base}.webp`);
    const wpAvifPath = resolve(wpOutputDir, `${base}.avif`);
    const wpOriginalPath = resolve(wpOutputDir, `${base}${ext}`);

    try {
      if (imageFormat === "webp") {
        // src に出力
        await sharp(sourcePath).webp().toFile(srcWebpPath);
        console.log(`[convert-images] Converted: ${relativePath} -> src/assets/images/${relativeDir ? relativeDir + "/" : ""}${base}.webp`);
        // WordPress ディレクトリにも出力
        await sharp(sourcePath).webp().toFile(wpWebpPath);
        console.log(`[convert-images] Converted: ${relativePath} -> wordpress/themes/${THEME_NAME}/assets/images/${relativeDir ? relativeDir + "/" : ""}${base}.webp`);
      } else if (imageFormat === "avif") {
        // src に出力
        await sharp(sourcePath).avif().toFile(srcAvifPath);
        console.log(`[convert-images] Converted: ${relativePath} -> src/assets/images/${relativeDir ? relativeDir + "/" : ""}${base}.avif`);
        // WordPress ディレクトリにも出力
        await sharp(sourcePath).avif().toFile(wpAvifPath);
        console.log(`[convert-images] Converted: ${relativePath} -> wordpress/themes/${THEME_NAME}/assets/images/${relativeDir ? relativeDir + "/" : ""}${base}.avif`);
      }

      // 元画像もコピーする設定の場合（WordPress ディレクトリのみ）
      if (copyOriginal) {
        fs.copyFileSync(sourcePath, wpOriginalPath);
        console.log(`[convert-images] Copied original: ${relativePath} -> wordpress/themes/${THEME_NAME}/assets/images/${relativeDir ? relativeDir + "/" : ""}${base}${ext}`);
      }
    } catch (err) {
      console.error(`[convert-images] Conversion error for ${sourcePath}:`, err);
    }
  };

  return {
    name: "convert-images",
    enforce: "pre",
    buildStart() {
      // 開発環境でのファイル監視
      const watcher = watch("src/assets/images/**/*.{png,jpg,jpeg}", {
        persistent: true,
        ignoreInitial: false,
      });

      watcher.on("add", async filePath => {
        await convertAndCopyImages(filePath);
      });

      watcher.on("change", async filePath => {
        await convertAndCopyImages(filePath);
      });
    },
    async transform(src, id) {
      if (/\.(png|jpe?g)$/.test(id)) {
        // id が絶対パスの場合はそのまま、相対パスの場合は projectRoot 基準で解決
        const absolutePath = path.isAbsolute(id) ? id : resolve(projectRoot, id);
        if (fs.existsSync(absolutePath)) {
          await convertAndCopyImages(absolutePath);
        }
        return null;
      }
    },
  };
}
