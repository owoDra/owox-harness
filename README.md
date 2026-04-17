# owox-harness

`owox-harness` は、人間の意図を複数の AI コーディング CLI にまたがる再現性のある開発フローへ変換するメタハーネスです。

## 何ができるか

- `owox.harness.yaml` を正本として project 設定を管理できる
- `AGENTS.md`、`.agents/`、adapter 向け設定やルールファイルを生成できる
- Codex / Claude Code / OpenCode / Copilot CLI 向け生成物を出力できる
- task を状態遷移つきで管理できる
- `verify` / `guard` / `gate` で決定的な判定を実行できる
- parent-child handoff と report を生成できる
- 生成物の差分逸脱を `validate` で検知し、`sync` で再生成できる
- 相談型初期化で scan / suggest / confirm / materialize を段階実行できる
- 管理対象の Markdown 文書にトークン上限を設定できる
- 外部提案プロバイダーを command 経由で接続できる

## 含まれる package

- `@owox-harness/core`: workflow、policy、task、handoff の中核ロジック
- `@owox-harness/cli`: 設定、生成、検証、adapter 出力、CLI コマンド

## 導入方法

### 1. セットアップ

```bash
pnpm install
pnpm build
```

### 2. CLI の実行

ビルド済み CLI は次で使えます。

```bash
node packages/cli/dist/index.js --help
```

必要なら package の `bin` として `owox` で使える前提でも配布できます。

## 最短導入

### 一括初期化

```bash
node packages/cli/dist/index.js harness-init ./example --name example --locale ja
node packages/cli/dist/index.js validate ./example/owox.harness.yaml
```

これは次をまとめて行います。

- `owox.harness.yaml` 生成
- `.agents/` と `AGENTS.md` 生成
- 文書ひな型の生成
- adapter 向け生成物の生成
- validate

### 相談型初期化

```bash
node packages/cli/dist/index.js harness-init-start ./example --locale ja
node packages/cli/dist/index.js harness-init-scan ./example
node packages/cli/dist/index.js harness-init-suggest ./example
node packages/cli/dist/index.js harness-init-template ./example ./decisions.json
node packages/cli/dist/index.js harness-init-confirm ./example ./decisions.json
node packages/cli/dist/index.js harness-init-materialize ./example
```

相談型初期化は次の流れです。

1. セッションを作る
2. リポジトリを走査する
3. 提案を出す
4. 判断テンプレートを人間が編集する
5. 確認内容を反映する
6. 出力を確定する

## 主なコマンド

### 初期化

- `harness-init <rootDir>`: 一括初期化
- `harness-init-start <rootDir>`: 相談型初期化セッション作成
- `harness-init-scan <rootDir>`: リポジトリ走査
- `harness-init-suggest <rootDir>`: 提案生成
- `harness-init-template <rootDir> <outputPath>`: 判断テンプレート出力
- `harness-init-confirm <rootDir> <decisionsPath>`: 確認済みの判断を反映
- `harness-init-materialize <rootDir>`: 設定と生成物を出力
- `harness-init-resume <rootDir>`: セッション状態確認

### 生成と検証

- `sync <configPath>`: 生成物を再生成
- `validate <configPath>`: スキーマ、生成物の差分逸脱、文書リンク、トークン上限などを検証

### task 管理

- `task-create <configPath> <taskPath> <inputPath>`
- `task-update <configPath> <taskPath> <patchPath>`
- `task-transition <configPath> <taskPath> <nextState>`
- `task-evidence <configPath> <taskPath> <evidencePath>`
- `task-log <configPath> <taskPath> <entry>`
- `task-resolve-gate <configPath> <taskPath> <summary>`

### 判定

- `verify <configPath> <taskPath> <checksPath>`
- `guard <configPath> <inputPath>`
- `gate <configPath> <inputPath>`

### handoff

- `handoff-parent-to-child <configPath> <taskPath> <outputPath>`
- `handoff-child-to-parent <configPath> <taskPath> <outputPath> <inputPath>`

## 設定例

最小の `owox.harness.yaml` イメージです。

```yaml
project:
  name: example
  description: example harness configuration
  locale: ja
  profile: web

source:
  hiddenLanguage: en
  docsRoot: docs/project

init:
  mode: existing_project
  sourceOfTruthPolicy: hybrid
  managedArtifactsPolicy: safe_minimum
  suggestionProvider: builtin

generated:
  agentsDir: .agents
  taskDir: .agents/tasks

adapters:
  - codex
  - claude-code
  - opencode
  - copilot-cli

taskDefaults:
  requiredChecks:
    - pnpm validate
    - pnpm build
```

## 外部提案プロバイダー

外部提案プロバイダーを使う場合は command を設定できます。

```yaml
init:
  suggestionProvider: external
  externalSuggestionProvider:
    command: node
    args:
      - ./tools/owox-provider.mjs
    timeoutMs: 30000
```

プロバイダーは stdin で JSON を受け取り、stdout で提案配列を返します。失敗時は内蔵の代替処理が使われます。

## Token Budgets

管理対象の Markdown 文書にトークン上限を設定できます。

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

上限超過の管理対象 Markdown 文書は圧縮され、必要なら `part-N` に分割されます。`validate` はトークン上限超過も検知します。

## 現在の到達点

- 相談型初期化は legacy harness 共存 / monorepo / 既存文書 fixture で検証済み
- 生成される adapter / 実行環境向け出力の固定テストがある
- 外部提案プロバイダーの command 実行と判断テンプレート出力がある
- 文書ひな型は `requirements/specs/adr/patterns/validation/architecture/tech-stack` まで生成できる
- Markdown の壊れたリンク検証がある
- Changesets による version / publish 導線がある

## まだ主に残るもの

- 各 CLI 実行環境上でのフック / プラグイン / サブエージェント実機確認
- 外部提案プロバイダーの本番用実装
- 配布・公開時の最終運用確認

## 開発者向けコマンド

```bash
pnpm validate
pnpm build
pnpm test
pnpm release:version
pnpm release:publish
```

## 資料

- プロジェクト正本: `docs/project/index.md`
- エージェント向け project 定義: `.agents/project.md`
- 実機確認チェックリスト: `Checklist.md`
