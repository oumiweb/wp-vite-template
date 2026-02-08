import { resolve, relative, extname, basename, dirname } from "path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { globSync } from "glob";
import autoprefixer from "autoprefixer";
import updateStyleCss from "./bin/update-wp-config.js";
import sassGlobImports from "vite-plugin-sass-glob-import";
import liveReload from "vite-plugin-live-reload";
import devManifest from "vite-plugin-dev-manifest";
import convertAndOptimizeImages from "./bin/vite-plugin-convert-images.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const THEME_NAME = basename(__dirname);
const root = resolve(__dirname, "src");
const themeDir = resolve(__dirname, `wordpress/themes/${THEME_NAME}`);
const isDev = process.env.NODE_ENV === "development";

const imageConfig = {
  format: "webp",
  copyOriginal: false,
  optimize: { png: 80, jpeg: 80, jpg: 80, webp: 80, avif: 80 },
};

const inputsForWordPress = {
  style: resolve(root, "assets", "styles", "style.scss"),
  ...Object.fromEntries(
    globSync("src/assets/js/*.js")
      .filter(file => !basename(file).startsWith("_"))
      .map(file => [
        relative("src/assets/js", file.slice(0, file.length - extname(file).length)),
        resolve(__dirname, file),
      ]),
  ),
};

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
        entryFileNames: "assets/js/[name].[hash].js",
        chunkFileNames: "assets/js/[name].[hash].js",
        assetFileNames: assetsInfo =>
          assetsInfo.name.endsWith(".css")
            ? "assets/styles/[name].[hash].[ext]"
            : "assets/[name].[hash].[ext]",
      },
    },
    css: {
      postcss: { plugins: [autoprefixer()] },
      preprocessorOptions: { scss: { additionalData: "" } },
    },
  },
  plugins: [
    devManifest(),
    updateStyleCss(),
    sassGlobImports(),
    convertAndOptimizeImages({
      format: imageConfig.format,
      copyOriginal: imageConfig.copyOriginal,
      optimize: imageConfig.optimize,
      isDev,
      root,
      themeDir,
    }),
    liveReload([
      `${themeDir.replace(/\\/g, "/")}/**/*.php`,
      `!${themeDir.replace(/\\/g, "/")}/functions-lib/lib/**/*.php`,
    ]),
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src/assets/styles"),
      "@js": resolve(__dirname, "src/assets/js"),
    },
  },
}));
