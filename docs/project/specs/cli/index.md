# cli 仕様

## 役割

このディレクトリは、`cli` subproject に閉じる仕様を置くための場所です。

## 置いてよいもの

- command entry points の仕様
- file IO と generation の仕様
- adapter integration の仕様
- locale rendering の仕様

## 置いてはいけないもの

- `core` に閉じる仕様
- 複数 subproject にまたがる共有仕様
- 一時的な設計メモ

## 命名規則

- `SPEC-<category>-<short-title>.md`

## 参照ルール

- `cli` のみで完結する仕様だけを置く
- 複数 subproject にまたがる仕様は `../shared/` に置く

## 参照

- `SPEC-command-surface.md`: CLI の主要コマンド群の責務とエラー分類
- `SPEC-generation-pipeline.md`: source から生成物までの変換と同期の流れ
- `SPEC-harness-init-consultative-workflow.md`: consultative harness-init の段階実行と session 仕様
- `SPEC-managed-document-token-budgets.md`: managed markdown documents の token budget 仕様
- `SPEC-init-provider-and-migration-helpers.md`: init provider 抽象と migration helper の仕様
