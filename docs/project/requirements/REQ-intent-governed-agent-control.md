# REQ: intent-governed agent control

## 目的

この文書は、`owox-harness` v2 において、人間の意図を上位契約として保持し、AI エージェントが `owox` を必須利用しながら、前提不足時に停止できる制御を要求として定義します。

## 背景

既存の v2 基盤要求では `task`、`verify`、`guard`、`gate`、`handoff` を定義しているが、ユーザーの最終目標、途中判断、親子エージェント間の圧縮 handoff、AI 専用 artifact の保存境界はまだ弱いままです。

この不足があると、AI は会話履歴依存で task を解釈しやすく、`owox` を通さずに作業を進めたり、必要な資料や判断が欠けたまま誤った前提で進んだりしやすい。

## 目標

- ユーザー意図を task より上位の契約として保持する
- AI が task 進行、判断確認、handoff、完了判定を必ず `owox` 経由で行う
- 前提資料、未解決判断、required checks、evidence が不足している場合は deterministic に停止する
- AI 専用 artifact を人間向け正本から分離し、`.owox/` に集約する
- subagent 利用時も低コンテキストで意図と判断を保持する

## 非目標

- 完全自律の無人開発を保証すること
- 人間向け正本を `.owox/` に移すこと
- 各 CLI の会話履歴や UI を再実装すること

## 機能要求

### FR-1. intent contract

`owox` は task の上位に `intent contract` を保持できる必要があります。

最低限の保持項目:

- `intent_id`
- `user_goal`
- `success_image`
- `non_goals`
- `must_keep`
- `tradeoffs`
- `open_questions`
- `decision_policy`
- `approval_policy`

### FR-2. clarification state

workflow は `task` の実行前に意図確認を扱える必要があります。少なくとも次の state を扱います。

- `intake`
- `intent_clarifying`
- `intent_confirmed`
- `planning`
- `executing`
- `verifying`
- `awaiting_human_gate`
- `done`
- `blocked`

### FR-3. decision ledger

`owox` は人間または親エージェントが確定した判断を `decision ledger` として構造化して保持できる必要があります。

### FR-4. context packet

親エージェントは子エージェントへ全文会話を渡すのではなく、`intent summary`、`task contract`、`relevant decisions`、`required docs` を含む圧縮 packet を生成できる必要があります。

### FR-5. mandatory owox execution

AI エージェントは `owox` CLI のコマンドを使って task を進める必要があります。各 CLI 向け rules file、skills / agents / commands / hooks / plugins は、AI が `owox` を必ず使う導線を提供する必要があります。

`owox` を経由せずに task を進めようとした場合は、少なくとも stop、deny、差し戻し、human gate のいずれかで制御できる必要があります。

### FR-6. prerequisite enforcement

`owox` は、必要な前提が欠けている場合に先へ進めない判定を提供する必要があります。最低限、次を評価対象とします。

- 必読 docs の確認状況
- `intent contract` の確定状況
- required decisions の解決状況
- required checks の定義状況
- required evidence の添付状況
- human gate 記録の有無

### FR-7. verify の二層化

`owox verify` は少なくとも次の二層を扱う必要があります。

- `execution verify`
- `intent verify`

### FR-8. drift audit

`owox` は `intent`、`decision ledger`、`task`、evidence、subagent report のずれを検査できる必要があります。

### FR-9. artifact storage boundary

人間が読む正本は `docs/project/` に置き、AI 専用 artifact は `.owox/` に置く必要があります。

最低限の配置方針:

- `docs/project/`: requirement、spec、ADR、proposal、pattern、validation などの visible source of truth
- `.owox/`: hidden context、runtime state、intent、decision ledger、context packet、evidence index、drift audit
- CLI 固有の生成ディレクトリ: `.claude/`、`.opencode/`、`.codex/`、`.github/` など、各 CLI が読む設定や skill / agent 定義

## 非機能要求

### NFR-1. low-context retention

parent / child handoff は全文会話に依存せず、圧縮 packet で再開可能である必要があります。

### NFR-2. deterministic enforcement

前提不足、禁止操作、human gate 必須判定、完了不可条件は deterministic に評価される必要があります。

### NFR-3. storage boundary isolation

AI 専用 artifact が `docs/project/` に混入せず、人間向け正本が `.owox/` に退避されないことを維持する必要があります。

## 成功指標

- AI が `owox` を使わずに task を進める経路を実用上抑止できる
- 前提不足時に `planning`、`executing`、`done` へ誤って進まない
- subagent 利用時でも `intent` と `decision` が欠落しない
- `.owox/` と `docs/project/` の責務分離が validate で確認できる

## 関連資料

- `REQ-harness-v2-foundation.md`
- `../architecture.md`
- `../specs/shared/SPEC-workflow-core-contracts.md`
- `../specs/shared/SPEC-intent-governed-agent-control.md`
- `../validation.md`
- `../adr/active/ADR-004-intent-governed-agent-control.md`
