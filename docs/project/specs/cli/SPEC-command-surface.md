# SPEC: CLI コマンド面

## 目的

この文書は、`@owox-harness/cli` が提供する主要コマンド群の責務、入出力、相互関係を定義します。

## 対象範囲

- `harness-init`
- `task`
- `verify`
- `guard`
- `gate`
- `handoff`
- `sync`
- `validate`

## 対象外

- 引数の最終的な短縮名や表記揺れ
- shell completion
- 各 CLI adapter が追加する独自ショートカット

## 共通契約

- すべてのコマンドは source of truth と生成物の境界を壊してはいけない
- すべてのコマンドは失敗時に理由を機械可読に扱える形で返せることが望ましい
- visible output は project locale に従う

## コマンド責務

### `harness-init`

- 必須設定を収集する
- `owox.harness.yaml` を生成または更新する
- `.agents/`、`AGENTS.md`、docs skeleton、adapter files を生成する
- 最後に `validate` を実行する

### `task`

- task の作成、更新、状態遷移を扱う
- task 契約を満たさない更新を拒否する

### `verify`

- acceptance criteria と required checks を評価する
- evidence を task に紐づける

### `guard`

- 実行前に危険操作や禁止操作を評価する

### `gate`

- 人間確認が必要かを評価し、結果を task 文脈へ反映する

### `handoff`

- parent / child 間の handoff 文書を生成または更新する

### `sync`

- source of truth から生成物を再同期する
- 無駄な差分を極力出さない

### `validate`

- 正本、生成物、参照関係、配置ルールの整合性を確認する

## 最小エラー分類

- `invalid_input`
- `schema_failure`
- `guard_denied`
- `gate_required`
- `verification_failed`
- `sync_mismatch`
- `internal_error`

## 実装順の推奨

1. `validate`
2. `harness-init`
3. `task`
4. `verify` / `guard` / `gate`
5. `handoff`
6. `sync`

## 検証観点

- 主要コマンドが責務どおりに分離されている
- エラー分類が上位資料と矛盾しない
- `harness-init` と `sync` が source of truth を起点に動く

## 関連資料

- `../shared/SPEC-workflow-core-contracts.md`
- `SPEC-generation-pipeline.md`
- `../../requirements/REQ-harness-v2-foundation.md`
- `../../validation.md`
