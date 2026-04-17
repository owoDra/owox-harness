# owox-harness

`owox-harness` は、人間の意図を複数の AI コーディング CLI にまたがる再現性のある開発フローへ変換するメタハーネスです。

## 概要

- `core`: 環境に依存しない workflow、policy、契約モデルの中核ロジック
- `cli`: コマンド入口、file IO、生成、adapter 向け連携を担う実行レイヤー

## v2 実装状況

- `owox.harness.yaml` を source of truth とする schema を実装済み
- `harness-init`, `sync`, `validate`, `task-*`, `verify`, `guard`, `gate`, `handoff-*` を実装済み
- consultative `harness-init-start` / `scan` / `suggest` / `confirm` / `materialize` / `resume` workflow を実装済み
- managed markdown documents の token budget 設定、compact、split、validate を実装済み
- Codex / Claude Code / OpenCode / Copilot CLI 向け managed artifacts を生成可能
- Codex hooks、Claude subagents/hooks、OpenCode plugins/agents、Copilot plugin manifest まで生成可能
- consultative init は v1 migration / monorepo / existing docs fixture で検証済み
- Changesets による version / publish 導線を追加済み
- suggestion provider 抽象を追加し、将来の実 AI runtime 連携を差し替え可能にした
- generated adapter/runtime artifacts の固定テストを追加済み
- external suggestion provider command 実行、decision template export、`migrate-v1` helper を実装済み
- docs skeleton を requirement/spec/adr/pattern/validation まで拡張し、broken link validate を追加済み
- generation drift を `validate` で検知し、`sync` で再生成可能

## クイックスタート

```bash
pnpm install
pnpm build
node packages/cli/dist/index.js harness-init ./example --name example --locale ja
node packages/cli/dist/index.js validate ./example/owox.harness.yaml
```

## Consultative Init

```bash
node packages/cli/dist/index.js harness-init-start ./example --locale ja
node packages/cli/dist/index.js harness-init-scan ./example
node packages/cli/dist/index.js harness-init-suggest ./example
node packages/cli/dist/index.js harness-init-confirm ./example ./decisions.json
node packages/cli/dist/index.js harness-init-materialize ./example
```

`harness-init` は一括実行、`harness-init-start` 以降は相談型の段階実行に使えます。

## Token Budgets

`owox.harness.yaml` で managed markdown documents の token budget を設定できます。

```yaml
contentBudgets:
  documents:
    defaultMaxTokens: 800
    splitThreshold: 1200
    trimOptionalSections: true
    overrides:
      - path: AGENTS.md
        maxTokens: 400
      - pathPrefix: docs/project/
        maxTokens: 700
```

over-limit の managed markdown documents は compact され、必要なら `part-N` に分割されます。`validate` は token over-limit も検知します。

## 資料

- プロジェクト正本: `docs/project/index.md`
- エージェント向け project 定義: `.agents/project.md`
