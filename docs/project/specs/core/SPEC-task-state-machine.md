# SPEC: task 状態遷移モデル

## 目的

この文書は、`@owox-harness/core` が扱う task state machine の状態、遷移、保持データを定義します。

## 対象範囲

- task の内部状態
- 状態遷移の許可条件
- evidence と human gate の紐付け

## 対象外

- CLI の引数形式
- UI 表示
- 永続化実装の詳細

## task の最小データ

task は少なくとも次の情報を保持します。

- `task_id`
- `title`
- `objective`
- `scope`
- `out_of_scope`
- `acceptance_criteria`
- `current_state`
- `required_checks`
- `human_gate`
- `attached_evidence`

## 状態一覧

- `draft`: 目的、範囲、完了条件の定義前
- `ready`: 着手条件がそろい、実行待ち
- `in_progress`: 実作業中
- `blocked`: 外部要因または gate 待ち
- `verifying`: required checks を実行中
- `done`: 完了条件を満たし、完了確認済み
- `cancelled`: 実施不要または中止

## 許可される遷移

- `draft -> ready`
- `ready -> in_progress`
- `in_progress -> blocked`
- `blocked -> in_progress`
- `in_progress -> verifying`
- `verifying -> in_progress`
- `verifying -> done`
- `draft -> cancelled`
- `ready -> cancelled`
- `in_progress -> cancelled`

これ以外の遷移は拒否します。

## 遷移条件

### `draft -> ready`

- `objective` が定義されている
- `scope` と `out_of_scope` が定義されている
- `acceptance_criteria` が 1 件以上ある
- 参照すべき正本が明記されている

### `ready -> in_progress`

- human gate が未解決でない
- required checks の実施計画がある

### `in_progress -> blocked`

- 外部依存、権限不足、設計判断待ちのいずれかがある
- block 理由が記録されている

### `in_progress -> verifying`

- 実施内容が task に反映されている
- required checks を走らせる準備ができている

### `verifying -> done`

- required checks が成功している
- acceptance criteria を満たしている
- human gate が必要な場合は確認結果が残っている
- attached evidence が task に紐づいている

### `verifying -> in_progress`

- required checks が失敗した
- acceptance criteria 未達が見つかった

## evidence 契約

- evidence は検証結果、生成結果、レビュー結果などを指す
- evidence は task 単位で追跡できる必要がある
- `done` へ遷移するには少なくとも 1 件の evidence が必要

## human gate 契約

- human gate は `none`、`required`、`resolved` のいずれかで表す
- `required` のまま `done` へ進めない
- `resolved` には確認内容の要約または参照を残す

## エラー条件

- 不正遷移
- required checks 未定義での `verifying` 遷移
- evidence 未紐付けでの `done` 遷移
- gate 未解決での `done` 遷移

## 検証観点

- 状態遷移表どおりに遷移する
- 不正遷移が拒否される
- block 理由と gate 解決結果が保持される
- evidence が `done` 判定に使われる

## 関連資料

- `../shared/SPEC-workflow-core-contracts.md`
- `../../requirements/REQ-harness-v2-foundation.md`
- `../../validation.md`
