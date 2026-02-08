import { spawnSync } from "child_process";
import { resolve } from "path";
import { exists, readJson } from "./utils/fs-utils.js";
import { log, success, error } from "./utils/logger.js";
import { projectRoot, THEME_NAME } from "./utils/paths.js";
import { isWordPressEnvRunning, ensureCliContainerRunning } from "./utils/wp-env.js";

const MODULE_NAME = "init-wp-options";
const DEFAULT_CONFIG = {
  options: {
    timezone_string: "Asia/Tokyo",
    date_format: "Y-m-d",
    time_format: "H:i",
    start_of_week: 1,
  },
  front_page: {
    slug: "top",
    title: "Top",
    content: "",
  },
  posts_page: null,
  seed_posts_json: "post-data/posts-sample.json",
  seed_posts_if_empty: true,
  permalink_structure: "/%postname%/",
  category_base: "",
  tag_base: "",
};

/**
 * シェル引数のエスケープ（Unix シェル用）
 * 注意: Docker コンテナ内で実行されるため、Unix シェル用のエスケープで問題ない
 * @param {string} str - エスケープする文字列
 * @returns {string} エスケープされた文字列
 */
function escapeShell(str) {
  return String(str).replace(/'/g, "'\\''").replace(/\$/g, "\\$");
}

function runWpCli(command, stdio = "pipe") {
  // wp-env 10に対応: spawnSyncを使用してより確実に実行
  // shell: true を使う場合は文字列として渡す必要がある（警告を避けるため）
  // コマンド文字列をそのまま使用（エスケープ済みの引数を保持）
  const fullCommand = `wp-env run cli wp ${command}`;
  const result = spawnSync(fullCommand, {
    cwd: projectRoot,
    encoding: "utf8",
    shell: true, // Windows対応、PATH不要
    stdio: stdio === "inherit" ? "inherit" : "pipe",
  });

  if (result.status !== 0) {
    const stderr = result.stderr ? String(result.stderr).trim() : "";
    const stdout = result.stdout ? String(result.stdout).trim() : "";
    const errorMessage = stderr || stdout || "Command failed";
    throw new Error(`WP-CLI実行エラー: ${errorMessage}`);
  }

  return result.stdout ? String(result.stdout) : "";
}

function loadConfig() {
  const configPath = resolve(projectRoot, "config/wp-options.json");
  if (!exists(configPath)) {
    return DEFAULT_CONFIG;
  }
  try {
    const userConfig = readJson(configPath);
    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
      options: {
        ...DEFAULT_CONFIG.options,
        ...(userConfig.options || {}),
      },
    };
  } catch (err) {
    error(MODULE_NAME, "config/wp-options.json の読み込みに失敗しました", err);
    return DEFAULT_CONFIG;
  }
}

async function waitForWpReady(retries = 20, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      // wp core is-installed は、インストール済みの場合のみ成功（終了コード0）
      // インストールされていない場合は終了コード1で失敗する
      runWpCli("core is-installed", "pipe");
      log(MODULE_NAME, "WordPress の準備が完了しました。");
      return true;
    } catch (err) {
      // リトライ中はエラーを無視して待機
      if (i < retries - 1) {
        log(MODULE_NAME, `WordPress の起動を待機中... (${i + 1}/${retries})`);
        await new Promise(resolveWait => setTimeout(resolveWait, delayMs));
      } else {
        // 最後のリトライでも失敗した場合、エラー詳細をログに出力
        error(MODULE_NAME, "WordPress の起動確認に失敗しました。", err);
      }
    }
  }
  return false;
}

function updateOptions(options) {
  const entries = Object.entries(options || {});
  if (entries.length === 0) return;

  entries.forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    updateOptionValue(key, value);
  });
}

function updateOptionValue(key, value) {
  const escaped = escapeShell(value);
  log(MODULE_NAME, `Option update: ${key}`);
  runWpCli(`option update ${key} '${escaped}'`, "inherit");
}

function updateOptionIfNotEmpty(key, value, label) {
  const trimmed = String(value).trim();
  if (trimmed.length > 0) {
    const escaped = escapeShell(trimmed);
    log(MODULE_NAME, label);
    runWpCli(`option update ${key} '${escaped}'`, "inherit");
    return true;
  }
  log(MODULE_NAME, `${label}: skip (empty)`);
  return false;
}

function updatePermalinks({ permalink_structure, category_base, tag_base }) {
  let shouldFlush = false;

  if (permalink_structure !== undefined && permalink_structure !== null) {
    const escaped = escapeShell(permalink_structure);
    log(MODULE_NAME, `Permalink structure: ${permalink_structure}`);
    runWpCli(`rewrite structure '${escaped}' --hard`, "inherit");
    shouldFlush = true;
  }

  if (category_base !== undefined && category_base !== null) {
    if (updateOptionIfNotEmpty("category_base", category_base, "Category base update")) {
      shouldFlush = true;
    }
  }

  if (tag_base !== undefined && tag_base !== null) {
    if (updateOptionIfNotEmpty("tag_base", tag_base, "Tag base update")) {
      shouldFlush = true;
    }
  }

  if (shouldFlush) {
    runWpCli("rewrite flush --hard", "inherit");
  }
}

function parseId(result) {
  const match = String(result).trim().match(/(\d+)/);
  return match ? match[1] : null;
}

function getPageIdBySlug(slug) {
  if (!slug) return null;
  const escaped = escapeShell(slug);
  const result = runWpCli(`post list --post_type=page --name='${escaped}' --field=ID --format=ids`, "pipe");
  const id = String(result).trim().split(/\s+/)[0];
  return id || null;
}

function buildPostCreateCommand({ title, content = "", status = "publish", postType = "post", author = "1", slug, categories, tags }) {
  const escapedTitle = escapeShell(title);
  let command = `post create --post_title='${escapedTitle}'`;

  if (content) {
    const escapedContent = escapeShell(content);
    command += ` --post_content='${escapedContent}'`;
  }

  command += ` --post_status='${escapeShell(status)}'`;
  command += ` --post_type='${escapeShell(postType)}'`;
  command += ` --post_author='${escapeShell(author)}'`;

  if (slug) {
    const escapedSlug = escapeShell(slug);
    command += ` --post_name='${escapedSlug}'`;
  }

  const normalizedCategories = normalizeCategories(categories);
  if (normalizedCategories) {
    command += ` --post_category='${escapeShell(normalizedCategories)}'`;
  }

  if (tags) {
    command += ` --tags_input='${escapeShell(tags)}'`;
  }

  return command;
}

function createPage({ slug, title, content }) {
  if (!slug || !title) return null;
  const command = buildPostCreateCommand({
    title,
    content,
    slug,
    postType: "page",
  });
  const result = runWpCli(command, "pipe");
  return parseId(result);
}

function ensurePage(config) {
  if (!config || !config.slug) return null;
  const existingId = getPageIdBySlug(config.slug);
  if (existingId) return existingId;
  return createPage(config);
}

function updateFrontPageSettings({ front_page, posts_page }) {
  const frontPageId = ensurePage(front_page);
  const postsPageId = ensurePage(posts_page);

  if (frontPageId) {
    runWpCli("option update show_on_front page", "inherit");
    runWpCli(`option update page_on_front ${frontPageId}`, "inherit");
    if (postsPageId) {
      runWpCli(`option update page_for_posts ${postsPageId}`, "inherit");
    } else {
      runWpCli("option update page_for_posts 0", "inherit");
    }
  } else {
    runWpCli("option update show_on_front posts", "inherit");
    runWpCli("option update page_on_front 0", "inherit");
    runWpCli("option update page_for_posts 0", "inherit");
  }
}

function normalizeCategories(categories) {
  if (!categories) return "";
  if (Array.isArray(categories)) {
    return categories.map(id => String(id).trim()).join(",");
  }
  return String(categories).trim();
}

function createPostFromData(post) {
  if (!post || !post.title) return null;
  const command = buildPostCreateCommand({
    title: post.title,
    content: post.content || "",
    status: post.status || "publish",
    postType: post.postType || "post",
    author: post.author || "1",
    categories: post.categories,
    tags: post.tags,
  });
  const result = runWpCli(command, "pipe");
  return parseId(result);
}

function hasExistingPosts() {
  const result = runWpCli("post list --post_type=post --posts_per_page=1 --field=ID --format=ids", "pipe");
  return String(result).trim().length > 0;
}

function seedPosts({ seed_posts_json, seed_posts_if_empty }) {
  if (!seed_posts_json) return;
  if (seed_posts_if_empty && hasExistingPosts()) {
    log(MODULE_NAME, "既存の投稿があるため、シードをスキップします。");
    return;
  }

  const jsonPath = resolve(projectRoot, seed_posts_json);
  if (!exists(jsonPath)) {
    error(MODULE_NAME, `投稿データが見つかりません: ${seed_posts_json}`);
    return;
  }

  const posts = readJson(jsonPath);
  if (!Array.isArray(posts) || posts.length === 0) {
    error(MODULE_NAME, "投稿データが空です。");
    return;
  }

  log(MODULE_NAME, `投稿を作成します: ${seed_posts_json}`);
  posts.forEach(post => {
    try {
      const postId = createPostFromData(post);
      if (postId) {
        success(MODULE_NAME, `  ✓ 作成成功: ${post.title} (ID: ${postId})`);
      } else {
        error(MODULE_NAME, `  ✗ 作成失敗: ${post.title}`);
      }
    } catch (err) {
      error(MODULE_NAME, `  ✗ 作成エラー: ${post.title}`, err);
    }
  });
}

function activateTheme() {
  const escaped = escapeShell(THEME_NAME);
  log(MODULE_NAME, `テーマを有効化します: ${THEME_NAME}`);
  try {
    runWpCli(`theme activate ${escaped}`, "inherit");
    success(MODULE_NAME, `テーマ「${THEME_NAME}」を有効化しました。`);
    return true;
  } catch (err) {
    error(MODULE_NAME, `テーマの有効化に失敗しました: ${THEME_NAME}`, err);
    log(MODULE_NAME, "手動で管理画面からテーマを有効化してください。");
    return false;
  }
}

async function main() {
  log(MODULE_NAME, "WordPress 初期設定を適用します...");

  if (!isWordPressEnvRunning()) {
    error(MODULE_NAME, "WordPress環境が起動していません。先に yarn wp-start を実行してください。");
    process.exit(1);
  }

  // CLIコンテナを確実に起動する（wp-env 10では、wp-env startだけではCLIコンテナが起動しない場合がある）
  log(MODULE_NAME, "CLIコンテナの起動を確認中...");
  let cliStarted = false;
  for (let i = 0; i < 5; i++) {
    cliStarted = ensureCliContainerRunning();
    if (cliStarted) {
      log(MODULE_NAME, "CLIコンテナが起動しました。");
      break;
    }
    if (i < 4) {
      log(MODULE_NAME, `CLIコンテナの起動を試行中... (${i + 1}/5)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  if (!cliStarted) {
    error(MODULE_NAME, "CLIコンテナの起動に失敗しました。");
    error(MODULE_NAME, "手動で以下のコマンドを実行してください: yarn wp-start");
    process.exit(1);
  }

  const ready = await waitForWpReady();
  if (!ready) {
    error(MODULE_NAME, "WordPress が起動しませんでした。少し待ってから再実行してください。");
    error(MODULE_NAME, "もしくは、yarn wp-start を実行してWordPress環境を起動してください。");
    process.exit(1);
  }

  const config = loadConfig();

  // テーマを有効化（最初に実行）
  activateTheme();

  updateOptions(config.options);
  updateFrontPageSettings(config);
  updatePermalinks(config);
  seedPosts(config);

  success(MODULE_NAME, "初期設定の適用が完了しました。");
}

main().catch(err => {
  error(MODULE_NAME, err.message, err);
  process.exit(1);
});
