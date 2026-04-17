# SPEC: intent-governed agent control

## 目的

この文書は、`owox-harness` v2 が `intent`、`decision ledger`、mandatory `owox` execution、prerequisite enforcement、`.owox/` storage boundary をどのように扱うかを定義します。

## 対象範囲

- `intent contract`
- `decision ledger`
- clarification を含む workflow state
- context packet
- mandatory `owox` execution
- prerequisite enforcement
- `drift audit`
- `.owox/` storage boundary

## 対象外

- 各 CLI adapter の最終的な hook 記法
- 各 file template の全文
- storage backend の物理実装

## intent 契約

`intent` は `task` の上位契約であり、少なくとも次を持ちます。

- `intent_id`
- `user_goal`
- `success_image`
- `non_goals`
- `must_keep`
- `tradeoffs`
- `open_questions`
- `decision_policy`
- `approval_policy`

`task` は `intent` に従属し、`intent` を欠いたまま `executing` へ進めません。

## decision ledger 契約

`decision ledger` は少なくとも次を持ちます。

- `decision_id`
- `related_intent_id`
- `question`
- `options`
- `chosen_option`
- `rationale`
- `decided_by`
- `timestamp`
- `revisit_condition`

未解決の required decision がある場合、workflow は `executing` へ進めません。

## workflow state 契約

少なくとも次の state を扱います。

- `intake`
- `intent_clarifying`
- `intent_confirmed`
- `planning`
- `executing`
- `verifying`
- `awaiting_human_gate`
- `done`
- `blocked`

最低限の遷移条件:

- `intake -> intent_clarifying`: 受理直後
- `intent_clarifying -> intent_confirmed`: intent 必須項目と required docs がそろったとき
- `intent_confirmed -> planning`: required decisions が planning に十分なとき
- `planning -> executing`: prerequisite enforcement が pass のとき
- `executing -> verifying`: required edits または required actions 完了時
- `verifying -> done`: execution verify と intent verify が pass し、completion gate も解決済みのとき
- 任意 state -> `awaiting_human_gate`: human-governed な判断点が発生したとき
- 任意 state -> `blocked`: prerequisite failure、guard deny、missing evidence、外部待ちなどで続行不能なとき

## context packet 契約

parent から child への packet は少なくとも次を含めます。

- `intent_summary`
- `task_contract`
- `relevant_decisions`
- `required_docs`
- `constraints`
- `expected_output`
- `known_risks`
- `token_budget`

child は packet に含まれない前提を暗黙採用してはいけません。不足がある場合は親へ返すか、`blocked` を報告します。

## mandatory owox execution 契約

- AI は task 作成、状態遷移、verify、gate、handoff、drift audit を `owox` を通して行う
- rules files は `owox` 利用導線のみを短く記し、重い手順本文を持たない
- adapter は hooks、plugins、commands、subagents のいずれかで `owox` command を強制または優先させる
- `owox` を通さない進行が検知された場合、少なくとも `guard_denied`、`gate_required`、`blocked` のいずれかで停止できる必要がある

## prerequisite enforcement 契約

次の条件は少なくとも機械的に評価されます。

- required docs が確認済みか
- `intent` が確定しているか
- required decisions が解決済みか
- `required_checks` が定義済みか
- `required_evidence` が添付済みか
- required human gate が解決済みか

評価結果は少なくとも `allow`、`ask`、`deny` を持ち、`deny` の場合は次 state へ進めません。

## verify 契約

### execution verify

- テスト、lint、build、差分、仕様適合を評価する
- 失敗時は task 完了不可とする

### intent verify

- `success_image`、`non_goals`、`must_keep` を評価する
- human gate が必要な観点は `completion_gate` または関連 gate に引き上げる

## human gate 契約

少なくとも次の gate type を扱います。

- `goal_gate`
- `scope_gate`
- `architecture_gate`
- `risk_gate`
- `external_behavior_gate`
- `completion_gate`

## drift audit 契約

`drift audit` は少なくとも次の差分を検査します。

- `intent` と `task`
- `decision ledger` と現状態
- parent 期待値と child report
- completion 宣言と evidence

## storage boundary 契約

### `docs/project/`

- 人間が読む正本だけを置く
- hidden context、runtime state、ledger、packet、evidence index は置かない

### `.owox/`

- `owox` が扱う hidden context と runtime artifact を置く
- 少なくとも `intent`、`decision ledger`、`context packet`、evidence index、drift audit、runtime state を置ける

### CLI 固有の生成ディレクトリ

- `.claude/`、`.opencode/`、`.codex/`、`.github/`、`.agents/` など、各 CLI が読む設定や skill / agent 定義を置く
- task state や hidden runtime artifact は置かない
- `.agents/` はその一例であり、architecture 上の特別扱いをしない

## 失敗時の扱い

- missing intent: `intent_clarifying` または `blocked`
- unresolved decision: `awaiting_human_gate` または `blocked`
- prerequisite deny: state progression 拒否
- execution verify failure: `done` 不可
- intent verify failure: `done` 不可

## 検証観点

- intent を欠いたまま `executing` へ進まない
- required decision 未解決で `executing` へ進まない
- evidence 不足で `done` へ進まない
- `.owox/` と `docs/project/` の責務境界が保たれる
- subagent handoff が packet 契約を満たす

## 関連資料

- `SPEC-workflow-core-contracts.md`
- `SPEC-integration-adapter-contracts.md`
- `../../requirements/REQ-intent-governed-agent-control.md`
- `../../architecture.md`
- `../../validation.md`
