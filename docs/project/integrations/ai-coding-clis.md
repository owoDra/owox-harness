# AI コーディング CLI 連携

## 目的

この文書は、`owox-harness` v2 が OpenCode、Claude Code、Codex、GitHub Copilot CLI と連携する際の仕様情報、差分、設計前提をまとめます。

## 対象と前提

- 対象日: 2026-04-17 時点の公式ドキュメントを前提にする
- `owox` は CLI の代替ではなく、CLI が利用する開発ツール基盤とする
- CLI ごとの差異は adapter に閉じ込める

## 共通前提

4 つの CLI すべてで、少なくとも次の接続面が確認できます。

- rules / instruction files
- skills または類似の reusable workflow
- hooks または event interception
- custom agents / subagents または類似機構
- MCP または外部 tool 接続

このため、v2 の共通戦略は次を基本にします。

1. `owox` の本体は CLI + MCP server として提供する
2. 各 CLI では skill / custom agent で `owox` を使う導線を与える
3. hooks は deterministic enforcement に限定して使う
4. rules files は短くし、重い手順は `owox` tools に寄せる

## 連携戦略の比較

| CLI | 主な rules | skill / agent | hooks / plugin | MCP / tools | v2 での主な役割 |
| --- | --- | --- | --- | --- | --- |
| Codex | `AGENTS.md`, `.codex/config.toml` | Skills | Hooks | MCP | skill で `owox` 導線、hooks で強制 |
| Claude Code | `CLAUDE.md`, `.claude/settings.json` | Skills, subagents | Hooks | MCP | subagent 活用の主力候補 |
| OpenCode | `AGENTS.md`, `opencode.json`, `.opencode/` | Skills, agents, commands | Plugins | MCP, custom tools | custom tool / command 連携が強い |
| Copilot CLI | custom instructions, project files | Custom agents, skills | Hooks, plugins | MCP | enterprise-friendly な配布単位を持つ |

## Codex

### 利用可能な主要拡張点

- `AGENTS.md` を rules file として使える
- Skills は `SKILL.md` を使う reusable workflow で、progressive disclosure で full content を必要時だけ読む
- Hooks は agentic loop の lifecycle に deterministic script を差し込める
- MCP servers は CLI と IDE extension の両方で使える
- project-scoped config は `.codex/config.toml` を使える

### v2 での設計方針

- rules は短い `AGENTS.md` を生成する
- `owox` を使う場面は skills に寄せる
- `verify`、`guard`、`gate` は hooks で強制する
- `owox` MCP server を optional で接続できるようにする

### 注意点

- Hooks は experimental である
- Windows support temporarily disabled とされているため、Codex hooks 依存を必須にしない
- hooks が使えない場合も skill + command で degrade できるようにする

## Claude Code

### 利用可能な主要拡張点

- `CLAUDE.md` は session start 時に context として読み込まれる
- Skills は reusable prompt-based workflows で、custom commands 相当も skills に統合されている
- Hooks は deterministic control 用で、shell command、HTTP endpoint、LLM prompt hooks を持つ
- Subagents は built-in と custom の両方を持つ
- MCP servers を接続できる
- Agent SDK は hooks、subagents、MCP、permissions、sessions を library として扱える

### v2 での設計方針

- `CLAUDE.md` は最小化し、`owox` 導線だけを書く
- custom subagents は v2 の parent / child 契約の有力な実装先とする
- hooks で `verify`、`guard`、`gate` を deterministic に強制する
- `owox` MCP server を優先接続候補とする

### 注意点

- `CLAUDE.md` は advisory な context であって enforced config ではない
- 長い instructions は token を消費しやすい
- v2 では `CLAUDE.md` の重責を避け、tool-first に寄せる

## OpenCode

### 利用可能な主要拡張点

- `AGENTS.md` を rules file として使える
- `/init` は repo を走査して `AGENTS.md` を生成または更新できる
- Agent skills は native `skill` tool から on-demand で読み込まれる
- Agents は primary agents と subagents を持つ
- Commands は `agent` と `subtask` を指定でき、subagent invocation を強制できる
- Plugins は event hook ベースで拡張できる
- Custom tools と MCP servers を扱える
- `.opencode` や `OPENCODE_CONFIG_DIR` で config を制御できる

### v2 での設計方針

- OpenCode では `owox` custom tools / commands 連携を重視する
- `agent` と `subtask` を利用して parent / child 契約へ寄せる
- plugins で guard / verify 系の enforcement を追加する
- `AGENTS.md` は短くし、rules の本体を `owox` に寄せる

### 注意点

- OpenCode 独自の command / agent / plugin モデルが強いので、adapter を厚めに設計する価値がある
- `.opencode` と custom config directory の precedence を前提にする

## GitHub Copilot CLI

### 利用可能な主要拡張点

- custom instructions を session start 時に読み込める
- custom agents を `.agent.md` で定義できる
- skills を `SKILL.md` ベースで追加できる
- hooks は key points で shell command を実行できる
- MCP servers を使える
- plugins は agents、skills、hooks、MCP をまとめて配布できる
- project-level custom agent / skill は plugin より優先される
- Copilot CLI は all Copilot plans で利用可能とされている

### v2 での設計方針

- Copilot CLI では plugin 配布と project-level generation の両方を検討する
- `owox` custom agent を用意し、specialized workflow を定義する
- hooks は policy-compliant execution の強制に使う
- project-level precedence を前提に、generated files が plugin を上書きしうることを明示する

### 注意点

- hooks は current working directory の `.github/hooks/` から読まれる前提がある
- plugin と project-level customizations の precedence を誤ると意図しない無効化が起きる

## v2 の adapter 共通方針

### 1. 生成物の基本

各 adapter は少なくとも次を生成対象にできます。

- short rules file
- `owox` を呼ぶ skill / custom agent / command
- `verify` / `guard` / `gate` を発火する hooks
- optional MCP server config

### 2. rules file の方針

rules file には次だけを書く方針にします。

- この project で `owox` を使うこと
- どの場面で `owox task` / `owox verify` / `owox handoff` を使うか
- どの操作が human gate を必要とするか

重い手順本文は rules file に書きません。

### 3. hook の方針

hooks は deterministic enforcement に限定します。主な用途は次です。

- prompt 受理時の task / gate 判定
- tool 実行前の guard
- edit / task 完了前の verify
- stop 前の continuation または block

### 4. subagent 方針

subagent 対応の強い CLI では、少なくとも次の役割を候補にします。

- discovery
- implementation
- review
- validation
- docs

subagent 非対応または弱い環境では、同じ input / output 契約を単独 agent workflow に落とします。

### 5. locale 方針

- visible documents と visible replies は project locale を使う
- internal keys、hidden prompts、adapter 内部 state は英語を使う

## v2 で優先して見る差分

| 観点 | Codex | Claude Code | OpenCode | Copilot CLI |
| --- | --- | --- | --- | --- |
| rules file の中心 | `AGENTS.md` | `CLAUDE.md` | `AGENTS.md` | custom instructions |
| skill の読み込み | on-demand | on-demand | on-demand | on-demand |
| subagent の強さ | 中 | 強 | 強 | 中 |
| deterministic hooks | あり | 強い | plugins で対応 | あり |
| MCP | あり | あり | あり | あり |
| packaging | config / skills | skills / plugins | config / plugins | plugins |

## `owox` 側で吸収すべき差分

- rules file 名と配置
- hook config 形式
- custom agent / subagent の定義形式
- MCP config 形式
- command / tool invocation の方法
- plugin / project-level precedence

## 関連資料

- `../requirements/REQ-harness-v2-foundation.md`
- `../specs/shared/SPEC-integration-adapter-contracts.md`
- `../specs/shared/SPEC-workflow-core-contracts.md`
- `../architecture.md`
- `../validation.md`
