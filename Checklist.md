# Checklist

## 実装完了済み

- pnpm workspace と `@owox-harness/core` / `@owox-harness/cli` がある
- task state machine がある
- `verify` / `guard` / `gate` がある
- handoff / report がある
- `owox.harness.yaml` schema がある
- `harness-init` がある
- consultative init がある
- `sync` / `validate` がある
- task lifecycle commands がある
- 4 CLI 向け生成物の生成がある
- トークン上限設定 / 圧縮 / 分割 / 検証がある
- 提案プロバイダーの抽象がある
- 外部提案プロバイダーの command 実行がある
- 判断テンプレート出力がある
- 文書ひな型の生成がある
- Markdown の壊れたリンク検証がある
- Changesets による release scripts がある

## テスト完了済み

- unit test: core state machine / policy
- integration test: cli command chain
- fixture test: existing project
- fixture test: monorepo
- 固定テスト: 生成される adapter / 実行環境向け出力
- トークン上限テスト
- 外部プロバイダーテスト

## 実機確認が必要

共通準備:

- 対象 CLI の最新版または検証対象バージョンを記録する
- 空の検証用 repo を 1 つ用意する
- `owox.harness.example.yaml` を元に初期化するか、`harness-init` で生成する
- `task-current.json` を `.owox/tasks/` に置き、hook が参照できる状態を作る
- 実行ログ、スクリーンショット、生成物差分、CLI バージョンを証跡として残す

### Codex

準備:

- `adapters: [codex]` で生成する
- `AGENTS.md`、`.codex/config.toml`、`.codex/skills/owox/SKILL.md`、`.codex/hooks/*.sh` の生成を確認する

確認手順:

1. Codex を対象 repo で起動し、初回コンテキストに `AGENTS.md` が取り込まれているか確認する
2. 軽い編集タスクを依頼し、`owox validate` を先に呼ぶ導線が働くか確認する
3. `task-current.json` を未充足状態にして編集を試み、`pre-tool.sh` により `task-check-prerequisites` が走るか確認する
4. `checks.json` を用意して編集後処理を起こし、`post-edit.sh` で `verify` と `drift-audit` が走るか確認する
5. hooks を無効化または失敗させ、skill と手動 command だけでも degrade できるか確認する

期待結果:

- `.codex/config.toml` が runtime で読まれる
- `.codex/skills/owox/SKILL.md` が参照され、`owox` コマンド導線が崩れない
- `.codex/hooks/pre-tool.sh` が前提不足時に停止または差し戻しを起こす
- `.codex/hooks/post-edit.sh` が `verify` / `drift-audit` を走らせ、失敗時に異常終了する
- hooks 非対応時も `owox` 手動実行で workflow を継続できる

残す証跡:

- Codex version
- hook 実行ログ
- 前提不足時の停止ログ
- 成功時の `.owox/drift-audits/*.json`

### Claude Code

準備:

- `adapters: [claude-code]` で生成する
- `CLAUDE.md`、`.claude/settings.json`、`.claude/agents/`、`.claude/subagents/`、`.claude/hooks/pre-command.sh` を確認する

確認手順:

1. Claude Code 起動時に `CLAUDE.md` が読み込まれ、`owox` 利用ルールが反映されるか確認する
2. `discovery` と `implementation` の subagent をそれぞれ呼び、想定 role で動くか確認する
3. `.owox/tasks/task-current.json` を未充足状態にしてコマンド実行し、`pre-command.sh` が前提不足を検出するか確認する
4. gate が必要な変更を依頼し、人間確認待ちへ落ちるか確認する
5. handoff markdown と `.owox/handoffs/*.json` が両方生成されるか確認する

期待結果:

- `CLAUDE.md` が意図どおり優先される
- `.claude/settings.json` が runtime で有効
- `.claude/subagents/*` が想定 role で呼ばれる
- `.claude/hooks/pre-command.sh` が期待どおり前提不足を止める
- subagent handoff が markdown / packet の両方で成立する

残す証跡:

- Claude Code version
- subagent invocation log
- hook 実行ログ
- handoff markdown と handoff packet

### OpenCode

準備:

- `adapters: [opencode]` で生成する
- `AGENTS.md`、`.opencode/agents/`、`.opencode/commands/`、`.opencode/plugins/owox.json` を確認する

確認手順:

1. OpenCode 起動時に `AGENTS.md` と `.opencode/` 配下の設定が反映されるか確認する
2. `owox agent` と `discovery agent` をそれぞれ呼び、routing が想定どおりか確認する
3. plugin の `preTool` が `owox validate` と `task-check-prerequisites` を実行するか確認する
4. `postEdit` で `owox sync` が走るか確認する
5. command 経由で `owox task ...`、`owox verify`、`owox drift-audit` が使えるか確認する

期待結果:

- `AGENTS.md` / `.opencode/` が実 runtime で有効
- `.opencode/agents/*` が意図どおり参照される
- `.opencode/plugins/owox.json` が実 plugin 形式として有効
- command / agent routing が想定どおり動く
- plugin による前提確認と同期が壊れない

残す証跡:

- OpenCode version
- plugin log
- agent routing の実行ログ
- `sync` 後の差分有無

### Copilot CLI

準備:

- `adapters: [copilot-cli]` で生成する
- `.github/copilot-instructions.md`、`.github/agents/owox.agent.md`、`.github/skills/owox/SKILL.md`、`.github/hooks/pre-command.sh`、`.github/plugins/owox/plugin.json` を確認する

確認手順:

1. Copilot CLI 起動時に instructions が反映されるか確認する
2. custom agent と skill が project-level precedence で使われるか確認する
3. `.github/hooks/pre-command.sh` が current working directory 前提で実行されるか確認する
4. `task-current.json` 未充足時に prerequisite block が働くか確認する
5. plugin と project-level files が競合したときに、意図した優先順位になるか確認する

期待結果:

- `.github/copilot-instructions.md` が想定どおり反映される
- `.github/agents/owox.agent.md` が使える
- `.github/skills/owox/SKILL.md` が使える
- `.github/hooks/pre-command.sh` が実 runtime で動く
- `.github/plugins/owox/plugin.json` の形式が実運用に合う
- project-level precedence による意図しない無効化が起きない

残す証跡:

- Copilot CLI version
- instructions 適用ログ
- hook 実行ログ
- precedence 検証メモ

### CLI 共通の合格条件

- rules file または instruction file が実際に効いている
- `owox validate` が開始前に呼ばれる
- 前提不足時に `task-check-prerequisites` で停止または差し戻しが起きる
- gate 必要時に AI が自走せず止まる
- 完了前に `verify` と `drift-audit` を実行できる
- `.owox/` に intent / decision / drift artifact が残る

## 提案プロバイダーの実連携確認

- `init.suggestionProvider: external` で command が実行される
- stdin の JSON 契約が外部プロバイダーで扱える
- stdout の JSON 契約が外部プロバイダーで返せる
- 外部プロバイダー失敗時に内蔵の代替処理で継続できる

## 文書 / トークン上限確認

- 管理対象の Markdown 文書が設定した上限を超えない
- 上限超過時に圧縮または分割される
- 分割された `part-N` 文書の導線が分かる
- 文書ひな型が project に十分か確認する

## release 前確認

- `pnpm validate` が通る
- `pnpm build` が通る
- `changeset version` が通る
- publish 対象 package metadata が妥当
- repository URL / license / engines が正しい

## 本番投入判定

- 4 CLI のうち必要対象で実機確認済み
- consultative init が対象 project 類型で通る
- トークン上限の運用値が決まっている
- 外部プロバイダーの有無と代替方針が決まっている
- release 手順がチームで共有済み

## 未完了なら止める項目

- 実機実行環境でフック / プラグイン / サブエージェントが未確認
- validate 失敗が残っている
- トークン上限超過が残っている
- 外部プロバイダー契約が未確定
