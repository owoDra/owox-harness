# アーキテクチャ

## 目的

この文書は、`owox-harness` v2 の不変条件、責務分離、設計方針を定義します。

## アーキテクチャ要約

`owox-harness` v2 は、generator-driven / workflow-driven / subagent-native なメタハーネスです。主役は `owox` の正本レイヤーと実行用ツールであり、`.owox/`、各 CLI 向け rules file、各 CLI 向け生成ディレクトリはそれぞれ責務の異なる生成物または管理対象です。

## 不変条件

### INV-1. 正本は生成物ではない

次は正本ではありません。

- `.owox/`
- 各 CLI 向け rules file
- 各 CLI 向け生成ディレクトリ
- CLI 向け adapter files
- task 雛形
- docs 雛形

正本は、少なくとも次です。

- `owox.harness.yaml`
- code
- schema
- templates
- language resources
- adapter definitions
- profiles

### INV-2. visible と hidden を分離する

- visible documents と visible outputs は project locale に従う
- hidden context と内部キーは英語を基本とする
- AI が読む rules、skills、agents、handoff などの AI-facing Markdown は project locale に関係なく英語で保つ
- `.owox/` 配下の runtime artifact は可能な限り `owox` CLI 経由で参照し、agent が直接読む前提を避ける
- hidden context や runtime artifact は `docs/project/` ではなく `.owox/` に置く

### INV-3. AI に任せるのは判断と補完である

初期化、状態遷移、検証、handoff など、壊れやすい処理は `owox` が決定的に扱います。AI は主に選択、補完、要約、提案を担います。

### INV-4. CLI 差分は adapter に閉じ込める

CLI ごとの hooks、skills、custom agents、MCP、設定差分は adapter に集約し、core workflow に散らさないことを原則とします。

### INV-5. サブエージェントは first-class workflow である

サブエージェント活用は追加機能ではなく、v2 の主要 workflow の一部として扱います。

### INV-6. 代替動作を持つ

特定 CLI で subagent や hook が弱い場合でも、task 契約と verify 契約は保持できる必要があります。

### INV-7. AI 専用 artifact は `.owox/` に集約する

人間向け正本は `docs/project/` に保ち、AI 専用の hidden context、runtime state、ledger、packet、evidence index は `.owox/` に集約します。各 CLI 向け設定や skill / agent 定義は CLI 固有の生成ディレクトリまたは設定ファイルへ出力します。

## 責務分離

### 1. Source Layer

役割:

- 正本の保持
- schema と policy の定義
- language resources と profiles の定義
- adapter definitions の保持

主な構成要素:

- `owox.harness.yaml`
- schema
- templates
- built-in profiles
- i18n resources

### 2. Generator Layer

役割:

- 正本から生成物を構築する
- project 初期化を機械化する
- CLI ごとの配布物を生成する

主な構成要素:

- `harness-init`
- generators
- renderers
- legacy file coexistence rules

### 3. Runtime Tool Layer

役割:

- AI エージェントが呼ぶ決定的ツールを提供する
- workflow を状態遷移で進める
- verify / guard / gate / handoff / intent / decision / prerequisite / drift audit を担う

主な構成要素:

- `intent`
- `task`
- `verify`
- `guard`
- `gate`
- `handoff`
- `drift-audit`
- `sync`
- `validate`

### 4. Agent Interface Layer

役割:

- 各 CLI から `owox` を自然に使わせる
- tool 呼び出しの導線を用意する
- deterministic enforcement を差し込む

主な構成要素:

- skills
- custom agents / subagents
- MCP server
- hooks
- CLI-specific config
- command wrappers

### 5. Generated Project Harness Layer

役割:

- 実プロジェクトで AI が参照する成果物を提供する
- 人間と AI の共同運用で使うファイル群を出力する

主な構成要素:

- `.owox/`
- CLI 固有の rules file
- CLI 固有の skill / agent / config 定義
- intent / decision / state / packet artifact
- 文書ひな型
- CLI adapter files

## 設計方針

### DP-1. generator-driven

手書きのハーネス運用データではなく、code と設定から機械生成する設計を採ります。

### DP-2. workflow-driven

instructions のみで task を進めるのではなく、状態遷移と決定的ツールによって進めます。

### DP-3. tool-first

skill は詳細手順の本文ではなく、`owox` をいつどう使うかを示す導線に寄せます。

### DP-4. deterministic where possible

規則で決まるものは deterministic に評価します。判断が必要なものだけを AI に委ねます。

### DP-5. human-governed

人間の最終判断が必要な局面は gate として明示します。特に設計変更、危険操作、外部仕様変更、完了判断は人間主導を保ちます。

### DP-6. intent above task

task 実行契約の前に、ユーザー意図を保持する `intent` を置きます。task は `intent` を欠いたまま進めません。

### DP-7. subagent contract first

サブエージェントは単なる便宜ではなく、明示的な input / output 契約と責任境界を持つものとして設計します。

### DP-8. locale-aware rendering

内部表現を英語で保ちつつ、表示物は locale ごとに描画します。

### DP-9. profile extensibility

初期リリースは web 開発を優先しつつ、将来の profile 追加を前提にします。web 固有ロジックを core に焼き込みすぎないことを重視します。

### DP-10. hidden storage boundary

人間が読む正本と AI 専用運用データを混在させず、`docs/project/` と `.owox/` の責務境界を validate で維持します。

## データフローの基本

1. `owox.harness.yaml` を正本として読む
2. `harness-init` が source を検証して生成物を出力する
3. 各 CLI は generated files / skills / hooks / MCP を通じて `owox` を利用する
4. AI は task を進める際に `owox task`, `owox verify`, `owox handoff` などを呼ぶ
5. `owox` は intent / decision / state / evidence / gate を `.owox/` 上で更新する
6. 最終的な visible artifacts は locale に応じて出力される

## 責務の境界でやらないこと

- 各 CLI の会話履歴や UI を再実装しない
- 生成物を手書き正本として運用しない
- CLI 個別事情を core に持ち込まない
- AI に毎回長い instructions を読ませる前提にしない
- AI 専用 artifact を `docs/project/` へ混在させない

## 関連資料

- `requirements/REQ-harness-v2-foundation.md`
- `requirements/REQ-intent-governed-agent-control.md`
- `specs/index.md`
- `specs/shared/SPEC-workflow-core-contracts.md`
- `specs/shared/SPEC-intent-governed-agent-control.md`
- `specs/shared/SPEC-integration-adapter-contracts.md`
- `tech-stack.md`
- `validation.md`
- `glossary/core.md`
- `integrations/ai-coding-clis.md`
