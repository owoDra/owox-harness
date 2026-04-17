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
- 4 CLI 向け managed artifact generation がある
- token budget 設定 / compact / split / validate がある
- suggestion provider abstraction がある
- external suggestion provider command 実行がある
- decision template export がある
- `migrate-v1` helper がある
- docs skeleton generation がある
- broken markdown link validate がある
- Changesets による release scripts がある

## テスト完了済み

- unit test: core state machine / policy
- integration test: cli command chain
- fixture test: existing project
- fixture test: monorepo
- fixture test: v1 migration
- snapshot-like fixed test: generated adapter/runtime artifacts
- token budget test
- external provider test

## 実機確認が必要

### Codex

- `.codex/config.toml` が実 runtime で読まれる
- `.codex/skills/owox/SKILL.md` が意図どおり参照される
- `.codex/hooks/pre-tool.sh` が期待どおり実行される
- `.codex/hooks/post-edit.sh` が実運用上問題ない

### Claude Code

- `CLAUDE.md` が意図どおり優先される
- `.claude/settings.json` が実 runtime で有効
- `.claude/subagents/*` が想定どおり使える
- `.claude/hooks/pre-command.sh` が期待どおり実行される

### OpenCode

- `AGENTS.md` / `opencode.json` が実 runtime で有効
- `.opencode/agents/*` が意図どおり参照される
- `.opencode/plugins/owox.json` が実 plugin 形式として有効
- command / agent routing が想定どおり動く

### Copilot CLI

- `.github/copilot-instructions.md` が想定どおり反映される
- `.github/agents/owox.agent.md` が使える
- `.github/skills/owox/SKILL.md` が使える
- `.github/hooks/pre-command.sh` が実 runtime で動く
- `.github/plugins/owox/plugin.json` の形式が実運用に合う

## suggestion provider 実連携確認

- `init.suggestionProvider: external` で command が実行される
- stdin JSON 契約が外部 provider で扱える
- stdout JSON 契約が外部 provider で返せる
- external provider failure 時に builtin fallback で継続できる

## migration 確認

- v1 project で `migrate-v1` が成功する
- `init.mode=existing_project_with_v1` が保持される
- migration 後に `validate` が通る
- 既存 docs を壊さずに generated artifacts が追加される

## docs / token budget 確認

- managed markdown documents が configured budget を超えない
- over-limit 時に compact または split される
- split された `part-N` 文書の導線が分かる
- docs skeleton が project に十分か確認する

## release 前確認

- `pnpm validate` が通る
- `pnpm build` が通る
- `changeset version` が通る
- publish 対象 package metadata が妥当
- repository URL / license / engines が正しい

## 本番投入判定

- 4 CLI のうち必要対象で実機確認済み
- consultative init が対象 project 類型で通る
- token budget 運用値が決まっている
- external provider の有無と fallback 方針が決まっている
- migration 対象 project で検証済み
- release 手順がチームで共有済み

## 未完了なら止める項目

- 実機 runtime で hook / plugin / subagent が未確認
- validate 失敗が残っている
- token budget 超過が残っている
- migration 後差分が説明できない
- external provider 契約が未確定
