import { spawnSync } from "child_process";
import readline from "readline";
import { resolve } from "path";
import { readJson, exists, writeFile, ensureDir } from "./utils/fs-utils.js";
import { log, success, error } from "./utils/logger.js";
import { projectRoot } from "./utils/paths.js";
import { isWordPressEnvRunning } from "./utils/wp-env.js";

const MODULE_NAME = "create-post";
const UPLOADS_DIR = resolve(projectRoot, "wordpress/uploads");
const EVAL_PHP_PATH = resolve(UPLOADS_DIR, "tmp-create-post.php");
const DATA_JSON_PATH = resolve(UPLOADS_DIR, "tmp-create-post.json");
const CONTAINER_EVAL_PHP_PATH = "/var/www/html/wp-content/uploads/tmp-create-post.php";
const CONTAINER_DATA_JSON_PATH = "/var/www/html/wp-content/uploads/tmp-create-post.json";
const EVAL_PHP_CONTENT = `<?php
$path = '${CONTAINER_DATA_JSON_PATH}';
if (!file_exists($path)) {
  WP_CLI::error('Post data JSON not found.');
}
$raw = file_get_contents($path);
$data = json_decode($raw, true);
if (!$data || !isset($data['title'])) {
  WP_CLI::error('Invalid post data.');
}
$postarr = array(
  'post_title' => $data['title'],
  'post_content' => isset($data['content']) ? $data['content'] : '',
  'post_status' => isset($data['status']) ? $data['status'] : 'publish',
  'post_type' => isset($data['postType']) ? $data['postType'] : 'post',
  'post_author' => isset($data['author']) ? intval($data['author']) : 1,
);
if (!empty($data['slug'])) {
  $postarr['post_name'] = $data['slug'];
}
$post_id = wp_insert_post($postarr, true);
if (is_wp_error($post_id)) {
  WP_CLI::error($post_id->get_error_message());
}
$categories = isset($data['categories']) ? $data['categories'] : array();
if (is_string($categories)) {
  $categories = array_filter(array_map('trim', explode(',', $categories)));
}
if (!empty($categories)) {
  wp_set_post_categories($post_id, $categories);
}
$tags = isset($data['tags']) ? $data['tags'] : array();
if (is_string($tags)) {
  $tags = array_filter(array_map('trim', explode(',', $tags)));
}
if (!empty($tags)) {
  wp_set_post_tags($post_id, $tags);
}
WP_CLI::log('CREATED_POST_ID:' . $post_id);
WP_CLI::success('Post created.');
`;

function ensureWordPressEnvRunning() {
  if (!isWordPressEnvRunning()) {
    error(MODULE_NAME, "WordPress環境が起動していません。先に yarn wp-start を実行してください。");
    process.exit(1);
  }
}

/**
 * wp-cliコマンドを実行
 * @param {string[]} args - wp-cli引数
 * @returns {string} 実行結果
 */
function runWpCli(args) {
  // Windows でも動作するように shell: true を指定
  // wp-env は yarn 経由で実行されるため、PATH にない場合でも動作する
  const result = spawnSync("wp-env", ["run", "cli", "wp", ...args], {
    cwd: projectRoot,
    encoding: "utf-8",
    shell: true,
  });
  if (result.status !== 0) {
    const stderr = result.stderr ? String(result.stderr).trim() : "";
    throw new Error(`WP-CLI実行エラー: ${stderr || "Command failed"}`);
  }
  return result.stdout ? String(result.stdout) : "";
}

/**
 * ユーザー入力を受け取る
 * @param {readline.Interface} rl - readlineインターフェース
 * @param {string} question - 質問文
 * @returns {Promise<string>} ユーザーの入力
 */
function askQuestion(rl, question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim());
    });
  });
}

/**
 * カテゴリを文字列に変換（配列または文字列を受け取る）
 * @param {string|Array<number|string>} categories - カテゴリID（配列またはカンマ区切り文字列）
 * @returns {string} カンマ区切りのカテゴリID文字列
 */
function normalizeCategories(categories) {
  if (!categories) {
    return "";
  }
  if (Array.isArray(categories)) {
    return categories.map(id => String(id).trim()).join(",");
  }
  return String(categories).trim();
}

function ensureEvalScript() {
  ensureDir(UPLOADS_DIR);
  writeFile(EVAL_PHP_PATH, EVAL_PHP_CONTENT);
}

function writePostDataFile(data) {
  ensureDir(UPLOADS_DIR);
  const content = JSON.stringify(data, null, 2);
  writeFile(DATA_JSON_PATH, `${content}\n`);
}

/**
 * 投稿を作成
 * @param {Object} options - 投稿オプション
 * @returns {string} 作成された投稿ID
 */
function createPost(options) {
  const { title, content = "", status = "publish", postType = "post", author = "1", categories = "", tags = "" } = options;

  if (!title) {
    throw new Error("タイトルは必須です");
  }

  ensureEvalScript();
  const normalizedCategories = Array.isArray(categories) ? categories : normalizeCategories(categories);
  writePostDataFile({
    title,
    content,
    status,
    postType,
    author,
    categories: normalizedCategories,
    tags,
  });
  const result = runWpCli(["eval-file", CONTAINER_EVAL_PHP_PATH]);
  // 結果から投稿IDを抽出（例: "Success: Created post 123."）
  const match = result.match(/CREATED_POST_ID:(\d+)/);
  return match ? match[1] : null;
}

/**
 * カテゴリ一覧を取得
 * @returns {Array<Object>} カテゴリリスト
 */
function getCategories() {
  try {
    const result = runWpCli(["term", "list", "category", "--format=json"]);
    return JSON.parse(result);
  } catch {
    return [];
  }
}

/**
 * メイン処理
 */
async function main() {
  ensureWordPressEnvRunning();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    log(MODULE_NAME, "投稿記事を作成します...\n");

    // タイトル入力
    const title = await askQuestion(rl, "タイトル: ");
    if (!title) {
      error(MODULE_NAME, "タイトルが入力されていません");
      rl.close();
      process.exit(1);
    }

    // 本文入力
    log(MODULE_NAME, "\n本文を入力してください（複数行可、空行で終了）:");
    const contentLines = [];
    let contentLine;
    while ((contentLine = await askQuestion(rl, "")) !== "") {
      contentLines.push(contentLine);
    }
    const content = contentLines.join("\n");

    // ステータス選択
    log(MODULE_NAME, "\nステータスを選択してください:");
    log(MODULE_NAME, "1) publish (公開)");
    log(MODULE_NAME, "2) draft (下書き)");
    log(MODULE_NAME, "3) pending (承認待ち)");
    const statusChoice = await askQuestion(rl, "選択 (1-3、デフォルト: 1): ");
    const statusMap = {
      1: "publish",
      2: "draft",
      3: "pending",
    };
    const status = statusMap[statusChoice] || "publish";

    // カテゴリ選択
    const categories = getCategories();
    let categoryIds = "";
    if (categories.length > 0) {
      log(MODULE_NAME, "\n利用可能なカテゴリ:");
      categories.forEach(cat => {
        log(MODULE_NAME, `  - ${cat.name} (ID: ${cat.term_id})`);
      });
      const categoryInput = await askQuestion(rl, "カテゴリID（カンマ区切り、スキップ可）: ");
      if (categoryInput) {
        categoryIds = categoryInput
          .split(",")
          .map(id => id.trim())
          .join(",");
      }
    }

    // 投稿作成
    const postId = createPost({
      title,
      content,
      status,
      categories: categoryIds,
    });

    if (postId) {
      success(MODULE_NAME, `投稿を作成しました！投稿ID: ${postId}`);
      log(MODULE_NAME, `投稿URL: http://localhost:8888/?p=${postId}`);
    } else {
      error(MODULE_NAME, "投稿の作成に失敗しました");
    }
  } catch (err) {
    error(MODULE_NAME, err.message, err);
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * JSONファイルから一括作成
 * @param {string} jsonPath - JSONファイルのパス
 */
function createPostsFromJson(jsonPath) {
  ensureWordPressEnvRunning();

  const absolutePath = resolve(projectRoot, jsonPath);

  if (!exists(absolutePath)) {
    error(MODULE_NAME, `JSONファイルが見つかりません: ${jsonPath}`);
    process.exit(1);
  }

  try {
    const posts = readJson(absolutePath);

    if (!Array.isArray(posts)) {
      error(MODULE_NAME, "JSONファイルは配列形式である必要があります");
      process.exit(1);
    }

    if (posts.length === 0) {
      error(MODULE_NAME, "JSONファイルに投稿データが含まれていません");
      process.exit(1);
    }

    log(MODULE_NAME, `${posts.length}件の投稿を作成します...\n`);

    const results = {
      success: [],
      failed: [],
    };

    posts.forEach((post, index) => {
      const postNumber = index + 1;
      log(MODULE_NAME, `[${postNumber}/${posts.length}] ${post.title || "(タイトルなし)"} を作成中...`);

      try {
        const postId = createPost({
          title: post.title,
          content: post.content || "",
          status: post.status || "publish",
          postType: post.postType || "post",
          author: post.author || "1",
          categories: post.categories || "",
          tags: post.tags || "",
        });

        if (postId) {
          results.success.push({
            index: postNumber,
            title: post.title,
            postId,
            url: `http://localhost:8888/?p=${postId}`,
          });
          success(MODULE_NAME, `  ✓ 作成成功 (ID: ${postId})`);
        } else {
          results.failed.push({
            index: postNumber,
            title: post.title,
            error: "投稿IDの取得に失敗",
          });
          error(MODULE_NAME, `  ✗ 作成失敗`);
        }
      } catch (err) {
        results.failed.push({
          index: postNumber,
          title: post.title,
          error: err.message,
        });
        error(MODULE_NAME, `  ✗ エラー: ${err.message}`);
      }
    });

    // 結果サマリー
    log(MODULE_NAME, "\n=== 作成結果 ===");
    log(MODULE_NAME, `成功: ${results.success.length}件`);
    if (results.failed.length > 0) {
      log(MODULE_NAME, `失敗: ${results.failed.length}件`);
    }

    if (results.success.length > 0) {
      log(MODULE_NAME, "\n作成された投稿:");
      results.success.forEach(result => {
        log(MODULE_NAME, `  - ${result.title} (ID: ${result.postId})`);
        log(MODULE_NAME, `    ${result.url}`);
      });
    }

    if (results.failed.length > 0) {
      log(MODULE_NAME, "\n失敗した投稿:");
      results.failed.forEach(result => {
        log(MODULE_NAME, `  - ${result.title}: ${result.error}`);
      });
      process.exit(1);
    }
  } catch (err) {
    error(MODULE_NAME, `JSONファイルの読み込みエラー: ${err.message}`, err);
    process.exit(1);
  }
}

// コマンドライン引数の処理
const args = process.argv.slice(2);

if (args.length === 0) {
  // 対話モード
  main();
} else if (args[0].endsWith(".json")) {
  // JSONファイルモード: yarn wp-post:create posts.json
  createPostsFromJson(args[0]);
} else {
  // 簡易モード: yarn wp-post:create "タイトル" "本文"
  ensureWordPressEnvRunning();

  const title = args[0];
  const content = args[1] || "";
  const status = args[2] || "publish";

  try {
    const postId = createPost({
      title,
      content,
      status,
    });
    if (postId) {
      success(MODULE_NAME, `投稿を作成しました！投稿ID: ${postId}`);
      log(MODULE_NAME, `投稿URL: http://localhost:8888/?p=${postId}`);
    } else {
      error(MODULE_NAME, "投稿の作成に失敗しました");
    }
  } catch (err) {
    error(MODULE_NAME, err.message, err);
    process.exit(1);
  }
}
