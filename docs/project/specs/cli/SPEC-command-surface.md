# SPEC: CLI コマンド面

## 目的

この文書は、`@owox-harness/cli` が提供する主要コマンド群の責務、入出力、相互関係を定義します。

## 対象範囲

- `harness-init`
- `task`
- `task-set-current`
- `intent-save`
- `decision-record`
- `task-check-prerequisites`
- `verify`
- `drift-audit`
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
- AI 専用 artifact は `.owox/` に置き、`docs/project/` に書き戻さない

## コマンド責務

### `harness-init`

- 必須設定を収集する
- scan / suggest / confirm / materialize / resume の段階実行を扱える
- decision template export を扱える
- 新規 project と既存 project の両方を扱える
- repo facts と pending decisions を session として保持できる
- `owox.harness.yaml` を生成または更新する
- `.owox/`、CLI 固有の rules file、CLI 固有の生成ディレクトリ、docs skeleton、adapter files を生成または初期化する
- 最後に `validate` を実行する

### `task`

- task の作成、更新、状態遷移を扱う
- intent と required decisions を参照して prerequisite を評価する
- task 契約を満たさない更新を拒否する

### `task-set-current`

- 指定 task を `.owox/tasks/task-current.json` へ反映する
- hook / plugin が参照する current task pointer を更新する

### `intent-save`

- `.owox/` 配下の intent artifact を作成または更新する
- task が参照する上位意図を hidden artifact として保持する

### `decision-record`

- `.owox/` 配下の decision ledger を更新する
- required decision の resolved 前提を機械可読に残す

### `task-check-prerequisites`

- target state に対する prerequisite enforcement を評価する
- 少なくとも `allow`、`ask`、`deny` を返す
- `deny` の場合は state progression を止める

### `verify`

- acceptance criteria と required checks を評価する
- execution verify と intent verify を評価する
- evidence を task に紐づける

### `drift-audit`

- task、intent、decision ledger、handoff、evidence のずれを検査する
- 結果を `.owox/` 配下の audit artifact として保存できる

### `guard`

- 実行前に危険操作や禁止操作を評価する

### `gate`

- 人間確認が必要かを評価し、結果を task 文脈へ反映する

### `handoff`

- parent / child 間の handoff 文書を生成または更新する
- `.owox/` 上の context packet を生成または更新する

### `sync`

- source of truth から生成物を再同期する
- 無駄な差分を極力出さない

### `validate`

- 正本、生成物、参照関係、配置ルールの整合性を確認する
- `.owox/`、CLI 固有の生成ディレクトリ、`docs/project/` の責務分離を確認する

## 最小エラー分類

- `invalid_input`
- `schema_failure`
- `guard_denied`
- `gate_required`
- `verification_failed`
- `prerequisite_missing`
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
- consultative init が中断・再開できる
- prerequisite command と drift audit が hidden artifact を正しく参照する

## 関連資料

- `../shared/SPEC-workflow-core-contracts.md`
- `../shared/SPEC-intent-governed-agent-control.md`
- `SPEC-generation-pipeline.md`
- `SPEC-harness-init-consultative-workflow.md`
- `SPEC-init-provider-and-decision-templates.md`
- `../../requirements/REQ-harness-v2-foundation.md`
- `../../requirements/REQ-harness-init-consultative-setup.md`
- `../../requirements/REQ-init-provider-and-decision-templates.md`
- `../../validation.md`
