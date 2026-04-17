# SPEC: workflow 共通契約

## 目的

この文書は、`owox-harness` v2 における workflow、task、verify、guard、gate、handoff の共通契約を定義します。`intent`、`decision ledger`、storage boundary の詳細は `SPEC-intent-governed-agent-control.md` を参照します。

## 対象範囲

- `@owox-harness/core` が保持する workflow model
- `@owox-harness/cli` から呼び出される task 系 runtime tools
- parent agent と subagent の間で共有される task 契約

## 対象外

- 個別 CLI adapter の設定形式
- project 固有 docs の具体的な文面
- 実装時の storage backend 選定

## task 契約

`owox` が扱う task は、少なくとも次の情報を持つ必要があります。

- `intent_id`
- `task_id`
- `title`
- `objective`
- `scope`
- `out_of_scope`
- `acceptance_criteria`
- `current_state`
- `required_decisions`
- `required_checks`
- `human_gate`
- `attached_evidence`

これらは `FR-2` の最低契約であり、CLI や renderer が変わっても意味が変わってはいけません。

## 状態遷移契約

- task は明示的な state machine に従って遷移する
- 不正な遷移は拒否される
- `intent` が未確定、または required decision が未解決の task は `executing` へ進めない
- 完了状態へ進む前に required checks が評価される
- human gate が必要な task は、人間確認なしに完了扱いへ進めない

## verify / guard / gate 契約

### verify

- acceptance criteria と required checks を評価する
- `execution verify` と `intent verify` を扱える必要がある
- 失敗時は task 完了不可とする
- 実行結果は evidence として task に紐づけられる必要がある

### guard

- 危険操作や禁止操作を実行前に評価する
- 判定は少なくとも `allow`、`ask`、`deny` を持つ
- `deny` の場合、AI 判断だけで続行させない

### gate

- 設計変更、危険操作、外部仕様変更、完了判断などの human-governed な判断点を表す
- `gate required` の場合、人間の確認結果を task 文脈へ残す
- gate type は少なくとも goal、scope、architecture、risk、external behavior、completion を区別できることが望ましい

## handoff 契約

親から子への handoff には、少なくとも次を含めます。

- intent summary
- 目的
- 対象範囲
- 対象外
- 完了条件
- 関連 decision
- 参照資料
- 制約

子から親への報告には、少なくとも次を含めます。

- 実施した事実
- 未確定事項
- 提案
- 検証結果または evidence

## locale 契約

- visible documents と visible replies は project locale に従う
- internal keys と hidden context は英語を基本とする
- locale が変わっても task 契約の構造と意味は変えない

## 失敗時の扱い

- state machine 違反は即時失敗とする
- verify failure は task 完了不可とする
- guard failure は操作拒否とする
- gate required は人間確認待ちとする

## 検証観点

- task state machine が定義どおりに動く
- evidence が task に紐づく
- subagent 利用時と fallback 時で契約が崩れない
- locale 切替で内部キーが崩れない

## 関連資料

- `../../requirements/REQ-harness-v2-foundation.md`
- `../../requirements/REQ-intent-governed-agent-control.md`
- `../../architecture.md`
- `../../validation.md`
- `SPEC-integration-adapter-contracts.md`
- `SPEC-intent-governed-agent-control.md`
