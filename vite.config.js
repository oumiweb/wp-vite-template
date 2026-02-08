import path from "path";
import { defineConfig } from "vite";
import { resolve, relative, extname } from "path";
import { globSync } from "glob";
import { fileURLToPath } from "node:url";
import fs from "fs";
import autoprefixer from "autoprefixer";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import updateStyleCss from "./bin/update-wp-config.js";
import sassGlobImports from "vite-plugin-sass-glob-import";
import liveReload from "vite-plugin-live-reload";
import devManifest from "vite-plugin-dev-manifest";
import { watch } from "chokidar";
import convertImages from "./bin/vite-plugin-convert-images.js";

// テーマ名を定義
// プロジェクトのルートディレクトリ名を取得してテーマ名とする
const THEME_NAME = path.basename(resolve(__dirname));

// サイトのルートを決定
const root = resolve(__dirname, "src");

// 環境編集を取得
const isDev = process.env.NODE_ENV === "development";

// WordPressテーマディレクトリのパス
const themeDir = resolve(__dirname, `wordpress/themes/${THEME_NAME}`);

// WordPress用ビルドのinput設定
const inputsForWordPress = {
  style: resolve(root, "assets", "styles", "style.scss"),
  // 画像バンドル用エントリポイント（vite.config.js内のプラグインで処理するため削除）
  ...Object.fromEntries(
    globSync("src/assets/js/*.js")
      .filter(file => !file.split("/").pop().startsWith("_")) // _から始まるファイルを除外
      .map(file => [relative("src/assets/js", file.slice(0, file.length - extname(file).length)), resolve(__dirname, file)]),
  ),
};

// 静的開発用のinput設定。静的資材用にはhtmlファイルを経由してscss,jsなどをビルドする

export default defineConfig(({ mode }) => ({
  root,
  base: mode === "wp" ? "./" : "/",
  server: {
    port: 5173,
    host: "localhost",
    cors: true,
    strictPort: false,
    hmr: {
      protocol: "ws",
      host: "localhost",
    },
    origin: mode == "wp" ? undefined : "http://localhost:5173",
  },
  build: {
    manifest: true,
    minify: false,
    outDir: mode === "wp" || isDev ? themeDir : resolve(__dirname, "dist"),
    rollupOptions: {
      input: inputsForWordPress,
      output: {
        entryFileNames: "assets/js/[name].js",
        chunkFileNames: "assets/js/[name].js",
        assetFileNames: assetsInfo => {
          if (assetsInfo.name.endsWith(".css")) {
            return "assets/styles/[name].[ext]";
          }
          return "assets/[name].[ext]";
        },
      },
    },
    css: {
      // devSourcemap: true, // SCSSのソースマップを生成（ビルド時には自動的に無効になる）
      postcss: {
        plugins: [autoprefixer()],
      },
      preprocessorOptions: {
        scss: {
          // @importをインライン化するための設定
          additionalData: "",
          // silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
  },
  plugins: [
    devManifest(),
    // WordPress テーマの style.css の Theme Name を自動更新
    updateStyleCss(),
    // Sassでワイルドカード（@use "components/**"）を使えるようにする
    sassGlobImports(),

    // 画像最適化
    ViteImageOptimizer({
      include: "**/*.{png,jpg,jpeg,webp,avif}", // 最適化する画像の形式を指定
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
      avif: {
        quality: 80,
      },
    }),
    // 開発環境では画像をwebpに変換（src と WordPress の両方に出力）
    // format: 'webp' or 'avif'で画像の変換形式を指定
    // copyOriginal: true にすると変換前の元画像（png, jpg等）もwordpressディレクトリにコピー
    isDev
      ? convertImages({
          format: "webp",
          copyOriginal: false,
        })
      : null,

    // PHPファイルの変更を監視してライブリロード（functions-lib/lib/は除外）
    // chokidarは絶対パスと相対パスの両方をサポート。globパターンは/区切りで統一
    liveReload([`${themeDir.replace(/\\/g, "/")}/**/*.php`, `!${themeDir.replace(/\\/g, "/")}/functions-lib/lib/**/*.php`]),

    // 画像をビルドプロセスに含めるためのカスタムプラグイン
    {
      name: "copy-assets",
      buildStart() {
        // ビルド時のみ emitFile を使用
        if (!isDev) {
          const files = globSync("src/assets/images/**/*.{png,jpg,jpeg,svg,gif,webp,avif}");
          files.forEach(file => {
            this.emitFile({
              type: "asset",
              fileName: relative(root, file),
              source: fs.readFileSync(file),
            });
          });
        }

        // 開発環境では、変換対象外の画像（svg, gif など）をWordPressディレクトリにコピー
        if (isDev) {
          const wpImagesDir = resolve(themeDir, "assets/images");
          if (!fs.existsSync(wpImagesDir)) {
            fs.mkdirSync(wpImagesDir, {
              recursive: true,
            });
          }

          const copyToWordPress = filePath => {
            // 変換対象の画像（png, jpg, jpeg）は convertImages プラグインで処理されるためスキップ
            if (/\.(png|jpe?g)$/.test(filePath)) {
              return;
            }

            const srcImagesDir = resolve(__dirname, "src/assets/images");
            const relativePath = relative(srcImagesDir, filePath);
            const relativeDir = path.dirname(relativePath);
            const outputDir = relativeDir === "." ? wpImagesDir : resolve(wpImagesDir, relativeDir);

            if (!fs.existsSync(outputDir)) {
              fs.mkdirSync(outputDir, {
                recursive: true,
              });
            }

            const outputPath = resolve(outputDir, path.basename(filePath));
            fs.copyFileSync(filePath, outputPath);
            console.log(`[copy-assets] Copied: ${relativePath} -> ${relative(__dirname, wpImagesDir)}/${relativePath}`);
          };

          // 既存ファイルをコピー
          const existingFiles = globSync("src/assets/images/**/*.{svg,gif}");
          existingFiles.forEach(copyToWordPress);

          // ファイル監視を設定
          const watcher = watch("src/assets/images/**/*.{svg,gif}", {
            persistent: true,
            ignoreInitial: true,
          });

          watcher.on("add", copyToWordPress);
          watcher.on("change", copyToWordPress);
        }
      },
    },

    // コンポーネントのディレクトリを読み込む
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/assets/styles"),
      "@js": resolve(__dirname, "src/assets/js"),
    },
  },
}));
