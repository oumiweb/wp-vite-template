#!/usr/bin/env node
// Watch SCSS directories and bump mtime of style.scss on add/remove
// to make Vite re-expand globs without modifying file contents.

import { watch } from "chokidar";
import { resolve, relative } from "path";
import { paths, projectRoot } from "./utils/paths.js";
import { log, error } from "./utils/logger.js";
import { touchFile } from "./utils/fs-utils.js";

const ROOT = projectRoot;
const STYLE_ENTRY = paths.styleScss;
const TARGET_DIRS = [resolve(ROOT, "src/assets/styles/projects"), resolve(ROOT, "src/assets/styles/components"), resolve(ROOT, "src/assets/styles/layouts"), resolve(ROOT, "src/assets/styles/utilities")];

async function touchStyle(reason = "") {
  try {
    await touchFile(STYLE_ENTRY);
    log("watch-scss", `style.scss touched${reason ? ` (${reason})` : ""}`);
  } catch (e) {
    error("watch-scss", "Touch failed", e);
  }
}

async function main() {
  // Initial touch to ensure Vite expands current globs
  await touchStyle("startup");

  const watcher = watch(
    TARGET_DIRS.map(dir => `${dir}/**/*.scss`),
    {
      ignoreInitial: true,
    },
  );

  const onAdd = async filePath => {
    log("watch-scss", `File added: ${relative(ROOT, filePath)}`);
    await touchStyle("add");
  };
  const onUnlink = async filePath => {
    log("watch-scss", `File removed: ${relative(ROOT, filePath)}`);
    await touchStyle("unlink");
  };

  watcher.on("add", onAdd);
  watcher.on("unlink", onUnlink);
}

main();
