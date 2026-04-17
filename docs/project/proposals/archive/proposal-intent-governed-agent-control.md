# Proposal: intent-governed agent control

## 背景

`owox-harness` v2 は、workflow-driven / tool-first / human-governed / subagent-native を中核方針としている。現行の要求、設計、共通契約でも `task`、`verify`、`guard`、`gate`、`handoff` の必要性は定義されているが、次の点はまだ formal に弱い。

- ユーザーが最終的に実現したい状態を `task` より上位で保持する構造
- 親エージェントと子エージェントが少ない文脈で正確に協調するための圧縮 handoff
- AI エージェントが必ず `owox` を使って進行することを保証する制御
- 必要な前提資料や判断が欠けているときに、AI が誤った前提で作業を進められないようにする制御
- 人間向け資料と AI 専用運用データの保存場所を明確に分ける境界

ユーザー要求は、AI が自由な判断で進めることではなく、人間の意図を壊さずに明確化し、必要に応じて提案し、複数の専門サブエージェントを低コンテキストで統制しながら確実に前進させることである。そのためには、単に rules file を改善するだけでなく、AI が従うべき進行契約そのものを `owox` 側で強化する必要がある。

## 提案内容

### 1. `intent contract` を `task` の上位概念として導入する

`task` は実行単位の契約として維持しつつ、その上位にユーザー意図を保持する `intent contract` を導入する。

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

これにより、AI は「何を実行するか」だけでなく、「何を壊さず、何を優先し、何を勝手に決めてはいけないか」を機械的に参照できるようになる。

### 2. `clarification` を正式な workflow state として組み込む

曖昧さがあるまま `planning` や `executing` に進まないため、少なくとも次の state を正式化する。

- `intake`
- `intent_clarifying`
- `intent_confirmed`
- `planning`
- `executing`
- `verifying`
- `awaiting_human_gate`
- `done`
- `blocked`

`intent_clarifying` では、AI の自由判断で質問するのではなく、`owox` が不足している前提、未解決の判断、human gate が必要な論点を返し、AI はその結果に従って質問または停止する。

### 3. `decision ledger` を導入する

人間または親エージェントが確定した判断を、task とは別に構造化して保持する。

最低限の保持項目:

- `decision_id`
- `related_intent_id`
- `question`
- `options`
- `chosen_option`
- `rationale`
- `decided_by`
- `timestamp`
- `revisit_condition`

これにより、会話履歴を毎回読み直さなくても、親子エージェントが同じ判断前提で進められる。

### 4. subagent を役割名ではなく責務契約で定義する

`discovery`、`implementation`、`review`、`validation`、`docs` などの役割は維持しつつ、各 subagent に次を必須化する。

- input contract
- out-of-scope
- autonomy limit
- escalation condition
- output contract
- required evidence

親エージェントは task を子へ丸投げせず、圧縮された handoff packet を使って委譲する。子は与えられた責務契約の範囲でのみ動き、仕様変更や重要判断は親へ返す。

### 5. `context packet` を標準化する

低コンテキスト運用のため、親から子への handoff は全文会話ではなく、圧縮 packet を正本とする。

最低限の項目:

- `intent summary`
- `task contract`
- `relevant decisions`
- `required docs`
- `constraints`
- `expected output`
- `known risks`
- `token budget`

hidden context は英語ベースで保持し、visible reply は locale renderer で描画する。

### 5a. AI 専用 artifact の保存先を `.owox/` に統一する

今回の提案で増える `intent contract`、`decision ledger`、`context packet`、drift audit 記録、進行中 state、prerequisite 判定結果など、人間が直接読むことを前提としない artifact は `docs/project/` ではなく `.owox/` に保存する。

保存境界の方針:

- `docs/project/`: 人間向けの正本。requirement、spec、ADR、proposal、pattern、validation などの可視文書だけを置く
- `.owox/`: `owox` が読む AI 専用の hidden context、runtime state、ledger、handoff packet、evidence index、drift audit などを置く
- CLI 固有の生成ディレクトリ: 各 CLI が使う skills、subagents、最小限の agent-facing 定義だけを置く

この方針により、AI 専用 artifact が `docs/project/` に混ざって人間向け正本を汚染することを防ぎ、同時に CLI 固有の生成ディレクトリを各 CLI の互換面に限定できる。

### 6. `owox mandatory execution` を明示的な要求として追加する

`owox` CLI のコマンドは、すべて AI エージェントが使う前提で設計する。AI はハーネス生成物を参照するだけでなく、進行管理、確認、検証、handoff、完了判定を `owox` を通して実施しなければならない。

この要求には少なくとも次を含める。

- generated rules file や各 CLI 向け skills / agents / commands は、AI が `owox` を必ず使う導線を持つ
- rules file は `owox` を使う場面を短く強く指示し、詳細手順は `owox` コマンドへ寄せる
- AI が `owox` を使わずに task を進めようとした場合、hook / plugin / command wrapper / guard により停止または差し戻しできる
- subagent を使う場合も親子ともに `owox` 契約に従う
- `owox` が管理する AI 専用 artifact は `.owox/` に保存し、rules file や skill は必要な参照先として `.owox/` を案内する

### 7. `prerequisite enforcement` を導入する

AI が誤った手順でコマンドを実行しようとしても、必要な資料、判断、状態、evidence がそろっていなければ先へ進めないようにする。

最低限の強制対象:

- 必読 docs 未確認の task は `planning` へ進めない
- `intent contract` 未確定の task は `executing` へ進めない
- 必須 decision 未解決の task は `executing` へ進めない
- required checks 未定義の task は `done` へ進めない
- required evidence 未添付の task は `done` へ進めない
- human gate 対象の判断は人間確認記録がない限り通過できない

この制御は instructions 依存ではなく、`owox task`、`owox gate`、`owox verify`、`owox guard`、`owox handoff` と、それを呼び出す adapter の hook / plugin / command 経由で deterministic に評価する。

### 8. verify を二層化する

`verify` を少なくとも次の二層に分ける。

- `execution verify`: テスト、lint、build、差分、仕様適合など、作業結果の妥当性を評価する
- `intent verify`: `success_image`、`non_goals`、`must_keep` の充足を評価する

これにより、単に task を終わらせるだけでなく、ユーザーが本当に欲しかった成果に近づいているかを検査できる。

### 9. `drift audit` を導入する

AI チーム運用では、ユーザー意図、途中判断、実装結果がずれる前提で設計する。そこで `owox` に少なくとも次を検査する drift audit を持たせる。

- `intent` と `task` のずれ
- `decision ledger` と現在実装のずれ
- 親の想定と子の報告のずれ
- 完了報告と attached evidence のずれ

### 10. `human gate` を種類別にする

`gate required` を一段細かくし、少なくとも次を区別する。

- `goal_gate`
- `scope_gate`
- `architecture_gate`
- `risk_gate`
- `external_behavior_gate`
- `completion_gate`

これにより、AI は「何の確認待ちなのか」を明確に提示できる。

### 11. collaboration profile を導入する

project profile とは別に、人間との協業スタイルを表す profile を導入する。

例:

- 質問を最小化する
- 実装前に設計確認を必須化する
- 代替案を毎回提示する
- MVP を優先する
- 既存スタイル遵守を優先する

これにより、同じ project でもユーザーごとの進め方の差を deterministic に扱える。

## 代替案

### 代替案 1. 現行の `task` / `verify` / `guard` / `gate` だけで運用を改善する

rules file や skills の記述を強化し、AI がより丁寧に確認しながら進めるようにする案。

不採用理由:

- ユーザー意図が task に埋もれやすい
- 会話履歴依存が残り、低コンテキスト運用で不利
- subagent 間の判断共有が弱い
- AI が `owox` を使わずに進める逸脱を抑止しきれない

### 代替案 2. 各 CLI の rules file を厚くして制御する

各 CLI の rules file に詳細手順を埋め込み、CLI ごとに強く縛る案。

不採用理由:

- token 消費が大きい
- adapter 境界が崩れやすい
- CLI ごとの差分が正本へ逆流しやすい
- deterministic enforcement が弱く、instructions 依存が残る

### 代替案 3. 完全自律の orchestration runtime を先に作る

AI チームのスケジューラや dispatcher を先に厚く作る案。

不採用理由:

- v2 の P0 である human-governed と段階導入のしやすさに対して重い
- 先に共通契約を固めないと CLI 差分や subagent 契約が崩れる
- 実装コストに対して初期価値の立ち上がりが遅い

## 利点

- ユーザー意図を `task` と分離して保持でき、誤解を減らせる
- AI が `owox` を使わずに勝手に進める経路を減らせる
- 前提資料や未解決判断が不足しているときに機械的に停止できる
- 人間向け正本と AI 専用運用データの責務分離を保てる
- 親子エージェント間の handoff を圧縮でき、低コンテキスト運用と相性がよい
- evidence ベースで完了判定できる
- CLI ごとの差分を adapter に閉じ込めたまま、共通の制御モデルを持てる

## リスク

- state と契約の種類が増え、初期実装が複雑になる
- `intent verify` や `drift audit` は完全自動化しにくく、人間確認との役割分担設計が必要になる
- CLI によって hook / plugin / command wrapping の強さが異なるため、強制度合いに差が出る
- collaboration profile を増やしすぎると設定複雑性が上がる
- CLI 固有の生成ディレクトリと `.owox/` の責務境界を adapter ごとに崩さないための生成規約が必要になる

## 未確定事項

- `intent contract` と `task contract` の保存形式を同一モデルにするか分離モデルにするか
- `decision ledger` を task 文書へ埋め込むか、別 artifact にするか
- `prerequisite enforcement` を hook 中心で実装するか、`owox` command wrapper 中心で実装するか
- `intent verify` のうち何を deterministic にし、何を human gate に残すか
- OpenCode、Claude Code、Codex、Copilot CLI の各 adapter でどこまで同じ強制点を実現できるか
- `.owox/` の標準ディレクトリ構成をどう定義するか
- 各 CLI 向け生成ディレクトリに残す最小定義をどこまでにするか

## 正式化先候補

- requirement: `owox mandatory execution`、`prerequisite enforcement`、`intent-driven workflow`、`decision ledger`、artifact storage boundary
- spec: workflow state machine、task / intent / handoff data model、verify / gate / guard / drift audit contracts、`.owox/` storage layout
- ADR: AI を自由記述 instruction で制御するのではなく、`owox` mandatory execution と prerequisite enforcement を中核に据え、AI 専用 artifact を `.owox/` に集約する判断

## 関連資料

- `../../requirements/REQ-harness-v2-foundation.md`
- `../../architecture.md`
- `../../integrations/ai-coding-clis.md`
- `../../validation.md`
- `../../specs/shared/SPEC-workflow-core-contracts.md`
- `../../specs/shared/SPEC-integration-adapter-contracts.md`
- `../../patterns/test-evidence-driven-validation.md`
