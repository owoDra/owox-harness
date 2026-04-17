# SPEC: consultative harness-init workflow

## 目的

この文書は、`@owox-harness/cli` が提供する consultative `harness-init` workflow の状態、入出力、保存データ、失敗条件を定義します。

## 対象範囲

- init session
- scan / suggest / confirm / materialize / resume
- repo facts と reference documents の記録
- AI suggestion と human confirmation の接続点

## 対象外

- 実際の LLM vendor 呼び出し実装
- 各 CLI の UI 文言詳細
- docs skeleton の全文テンプレート

## session モデル

session は少なくとも次を保持します。

- `session_id`
- `current_state`
- `root_dir`
- `init_mode`
- `repo_facts`
- `reference_documents`
- `suggestions`
- `pending_decisions`
- `confirmed_decisions`

## 状態一覧

- `draft`
- `scanning`
- `collecting_context`
- `suggesting`
- `awaiting_human_decision`
- `materializing`
- `validating`
- `done`
- `blocked`

## 許可される遷移

- `draft -> scanning`
- `scanning -> collecting_context`
- `collecting_context -> suggesting`
- `suggesting -> awaiting_human_decision`
- `awaiting_human_decision -> materializing`
- `materializing -> validating`
- `validating -> done`
- `scanning -> blocked`
- `suggesting -> blocked`
- `awaiting_human_decision -> blocked`
- `blocked -> scanning`
- `blocked -> suggesting`
- `blocked -> awaiting_human_decision`

## step 契約

### scan

- repo から事実を収集する
- `repo_facts` に検出結果を保存する
- 事実と推定を区別する
- `init_mode` 候補を出す

### suggest

- scan 結果と reference documents をもとに suggestion を作る
- suggestion は少なくとも `recommended`、`alternatives`、`reasons`、`risks` を含む
- pending decisions を更新する

### confirm

- 人間が選んだ値だけを `confirmed_decisions` に反映する
- 未確認の項目は `pending_decisions` に残す
- materialize 前に必須確認項目が埋まっている必要がある

### materialize

- confirm 済み decisions を `owox.harness.yaml` へ変換する
- generated artifacts を出力する
- session 自体は source of truth に昇格させない

### validate

- schema
- generated artifacts
- overwrite policy
- required references

## reference document 契約

各 reference document は少なくとも次を持ちます。

- `path`
- `kind`
- `classification`
- `summary`
- `selected_for_materialization`

## suggestion 契約

各 suggestion は少なくとも次を持ちます。

- `topic`
- `recommended`
- `alternatives`
- `reasons`
- `risks`
- `open_questions`

## 出力契約

### visible output

- project locale に従う
- scan summary
- suggested decisions
- pending decisions

### hidden output

- internal keys は英語を使う
- session state keys は locale に依存しない

## 失敗条件

- root dir 不正
- scan failure
- required decision 未確定での materialize
- validate failure

## 検証観点

- 新規 project と既存 project の両方で scan が動く
- suggestion が repo facts と矛盾しない
- confirm 前に materialize できない
- session を保存して再開できる

## 関連資料

- `SPEC-command-surface.md`
- `SPEC-generation-pipeline.md`
- `../../requirements/REQ-harness-init-consultative-setup.md`
- `../../validation.md`
