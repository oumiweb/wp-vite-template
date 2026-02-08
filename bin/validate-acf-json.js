#!/usr/bin/env node

/**
 * ACF-JSON バリデーションスクリプト
 *
 * フィールドグループのJSONファイルの構造をチェックします。
 * - JSON構文の妥当性
 * - 必須フィールドの存在
 * - フィールドタイプの妥当性
 * - キーの形式チェック
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { resolve } from "path";
import { paths } from "./utils/paths.js";

// ACF-JSONディレクトリのパス（テーマ直下の acf-json）
const ACF_JSON_DIR = resolve(paths.themeDir, "acf-json");

// 必須フィールドグループプロパティ
const REQUIRED_FIELD_GROUP_PROPS = ["key", "title", "fields", "location"];

// 必須フィールドプロパティ
const REQUIRED_FIELD_PROPS = ["key", "label", "name", "type"];

// 有効なフィールドタイプ（ACFで一般的なもの）
const VALID_FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "email",
  "url",
  "password",
  "image",
  "file",
  "wysiwyg",
  "oembed",
  "gallery",
  "select",
  "checkbox",
  "radio",
  "button_group",
  "true_false",
  "link",
  "post_object",
  "page_link",
  "relationship",
  "taxonomy",
  "user",
  "google_map",
  "date_picker",
  "date_time_picker",
  "time_picker",
  "color_picker",
  "message",
  "accordion",
  "tab",
  "group",
  "repeater",
  "flexible_content",
  "clone",
  "range",
  "jquery_date_picker",
];

/**
 * キーの形式チェック（group_またはfield_で始まる）
 */
function validateKey(key, type = "field") {
  const prefix = type === "field" ? "field_" : "group_";
  if (!key.startsWith(prefix)) {
    return {
      valid: false,
      message: `${type}のキーは"${prefix}"で始まる必要があります: ${key}`,
    };
  }
  if (key.length < prefix.length + 1) {
    return {
      valid: false,
      message: `${type}のキーが短すぎます: ${key}`,
    };
  }
  return {
    valid: true,
  };
}

/**
 * フィールドのバリデーション
 */
function validateField(field, fieldIndex) {
  const fieldErrors = [];
  const fieldWarnings = [];

  // 必須プロパティのチェック
  for (const prop of REQUIRED_FIELD_PROPS) {
    if (!(prop in field)) {
      fieldErrors.push(`フィールド[${fieldIndex}]に必須プロパティ"${prop}"がありません`);
    }
  }

  // キーの形式チェック
  if (field.key) {
    const keyCheck = validateKey(field.key, "field");
    if (!keyCheck.valid) {
      fieldErrors.push(`フィールド[${fieldIndex}]: ${keyCheck.message}`);
    }
  }

  // フィールドタイプの妥当性チェック
  if (field.type && !VALID_FIELD_TYPES.includes(field.type)) {
    fieldWarnings.push(`フィールド[${fieldIndex}] "${field.label || field.name}": 未知のフィールドタイプ"${field.type}"が使用されています`);
  }

  // 再帰的にサブフィールドをチェック
  if (field.sub_fields && Array.isArray(field.sub_fields)) {
    field.sub_fields.forEach((subField, subIndex) => {
      const subErrors = validateField(subField, `${fieldIndex}.sub_fields[${subIndex}]`);
      fieldErrors.push(...subErrors.errors);
      fieldWarnings.push(...subErrors.warnings);
    });
  }

  // レイアウトフィールド（Flexible Content）のチェック
  if (field.layouts && Array.isArray(field.layouts)) {
    field.layouts.forEach((layout, layoutIndex) => {
      if (layout.sub_fields && Array.isArray(layout.sub_fields)) {
        layout.sub_fields.forEach((subField, subIndex) => {
          const subErrors = validateField(subField, `${fieldIndex}.layouts[${layoutIndex}].sub_fields[${subIndex}]`);
          fieldErrors.push(...subErrors.errors);
          fieldWarnings.push(...subErrors.warnings);
        });
      }
    });
  }

  return {
    errors: fieldErrors,
    warnings: fieldWarnings,
  };
}

/**
 * フィールドグループのバリデーション
 */
function validateFieldGroup(filePath, jsonData) {
  const groupErrors = [];
  const groupWarnings = [];

  // 必須プロパティのチェック
  for (const prop of REQUIRED_FIELD_GROUP_PROPS) {
    if (!(prop in jsonData)) {
      groupErrors.push(`フィールドグループに必須プロパティ"${prop}"がありません`);
    }
  }

  // キーの形式チェック
  if (jsonData.key) {
    const keyCheck = validateKey(jsonData.key, "group");
    if (!keyCheck.valid) {
      groupErrors.push(keyCheck.message);
    }
  }

  // ファイル名とキーの一致チェック
  const fileName = filePath.split("/").pop();
  // キーは既に"group_"で始まっているので、ファイル名は`${key}.json`になる
  const expectedFileName = `${jsonData.key}.json`;
  if (fileName !== expectedFileName) {
    groupWarnings.push(`ファイル名"${fileName}"がキー"${jsonData.key}"と一致していません（期待値: ${expectedFileName}）`);
  }

  // fields配列のチェック
  if (!Array.isArray(jsonData.fields)) {
    groupErrors.push('"fields"は配列である必要があります');
  } else if (jsonData.fields.length === 0) {
    groupWarnings.push("フィールドグループにフィールドが含まれていません");
  } else {
    // 各フィールドをバリデーション
    jsonData.fields.forEach((field, index) => {
      const fieldValidation = validateField(field, index);
      groupErrors.push(...fieldValidation.errors);
      groupWarnings.push(...fieldValidation.warnings);
    });
  }

  // location配列のチェック
  if (!Array.isArray(jsonData.location)) {
    groupErrors.push('"location"は配列である必要があります');
  } else if (jsonData.location.length === 0) {
    groupWarnings.push("フィールドグループにlocationルールが設定されていません");
  }

  return {
    errors: groupErrors,
    warnings: groupWarnings,
  };
}

/**
 * JSONファイルを読み込んでバリデーション
 */
function validateJsonFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(content);

    const validation = validateFieldGroup(filePath, jsonData);

    return {
      file: filePath,
      valid: validation.errors.length === 0,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        file: filePath,
        valid: false,
        errors: [`JSON構文エラー: ${error.message}`],
        warnings: [],
      };
    }
    return {
      file: filePath,
      valid: false,
      errors: [`ファイル読み込みエラー: ${error.message}`],
      warnings: [],
    };
  }
}

/**
 * メイン処理
 */
function main() {
  console.log("🔍 ACF-JSON バリデーション開始...\n");

  // ディレクトリの存在確認
  try {
    const stats = statSync(ACF_JSON_DIR);
    if (!stats.isDirectory()) {
      console.error(`❌ エラー: ${ACF_JSON_DIR} はディレクトリではありません`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ エラー: ${ACF_JSON_DIR} が見つかりません`);
    process.exit(1);
  }

  // JSONファイルを検索
  const files = readdirSync(ACF_JSON_DIR)
    .filter(file => file.endsWith(".json") && file.startsWith("group_"))
    .map(file => resolve(ACF_JSON_DIR, file));

  if (files.length === 0) {
    console.log("⚠️  バリデーション対象のJSONファイルが見つかりませんでした");
    console.log(`   検索パス: ${ACF_JSON_DIR}`);
    process.exit(0);
  }

  console.log(`📁 ${files.length}個のJSONファイルを検出しました\n`);

  // 各ファイルをバリデーション
  const results = files.map(validateJsonFile);

  // 結果を表示
  let hasErrors = false;
  let hasWarnings = false;

  results.forEach(result => {
    const fileName = result.file.split("/").pop();
    console.log(`📄 ${fileName}`);

    if (result.errors.length > 0) {
      hasErrors = true;
      console.log("  ❌ エラー:");
      result.errors.forEach(error => {
        console.log(`     - ${error}`);
      });
    }

    if (result.warnings.length > 0) {
      hasWarnings = true;
      console.log("  ⚠️  警告:");
      result.warnings.forEach(warning => {
        console.log(`     - ${warning}`);
      });
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log("  ✅ 問題なし");
    }

    console.log("");
  });

  // サマリー
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  const validFiles = results.filter(r => r.valid).length;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 サマリー");
  console.log(`   検証ファイル数: ${files.length}`);
  console.log(`   正常なファイル: ${validFiles}`);
  console.log(`   エラー数: ${totalErrors}`);
  console.log(`   警告数: ${totalWarnings}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 終了コード
  if (hasErrors) {
    console.log("❌ バリデーション失敗: エラーが見つかりました");
    process.exit(1);
  } else if (hasWarnings) {
    console.log("⚠️  バリデーション完了: 警告がありますが、エラーはありません");
    process.exit(0);
  } else {
    console.log("✅ バリデーション成功: すべてのファイルが正常です");
    process.exit(0);
  }
}

// 実行
main();
