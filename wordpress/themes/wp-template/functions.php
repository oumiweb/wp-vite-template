<?php

/**
 * Functions
 */
// 共通ヘルパー関数
get_template_part("functions-lib/func-helpers");

// スクリプトとスタイルの読み込み
get_template_part("functions-lib/func-enqueue");

// プラグイン管理（TGMPA）
get_template_part("functions-lib/func-plugins");

// ACF設定
get_template_part("functions-lib/func-acf");

// 基本設定
get_template_part("functions-lib/func-base");

// セキュリティー対応
get_template_part("functions-lib/func-security");

// URLのショートカット設定
get_template_part("functions-lib/func-url");

// デフォルト投稿タイプのラベル変更
get_template_part("functions-lib/func-add-posttype-post");

// カスタム投稿タイプ（works 等）はプラグイン（CPT UI 等）で登録

// 構造化データの設定（汎用化済み）
get_template_part("functions-lib/func-structured-data");
