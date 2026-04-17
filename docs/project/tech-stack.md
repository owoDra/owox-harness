# 技術スタック

## 目的

この文書は、`owox-harness` v2 の推奨技術スタックを定義します。ここでの内容は、v2 の初期実装を進めるための基準です。

## 前提

- npm package として配布する
- package 名は `@owox-harness/core` と `@owox-harness/cli` を使う
- web 開発向け profile を先に整備する
- 将来 profile を追加できる構造を重視する

## 採用スタック

| 技術名 | 採用スタック | バージョン方針 | 用途 | 備考 |
| --- | --- | --- | --- | --- |
| Node.js | 必須 | Active LTS 系 | 実行基盤 | npm 配布の前提 |
| TypeScript | 必須 | 安定最新版追随 | core / cli 実装 | 型で workflow を固定しやすい |
| pnpm workspace | 必須 | 安定最新版追随 | monorepo 管理 | package 管理と link が軽い |
| Turbo | 推奨 | 安定最新版追随 | build / test / lint orchestration | 初期は optional でもよい |
| Zod | 必須 | 安定最新版追随 | schema / config validation | `owox.harness.yaml` 検証 |
| YAML parser (`yaml`) | 必須 | 安定最新版追随 | yaml 読み書き | source of truth の入出力 |
| Commander もしくは CAC | 必須 | 安定最新版追随 | CLI 構築 | `@owox-harness/cli` の入口 |
| Vitest | 必須 | 安定最新版追随 | unit / snapshot / integration test | TS と相性がよい |
| Prettier | 必須 | 安定最新版追随 | Markdown / code format | 生成物整形 |
| ESLint | 必須 | 安定最新版追随 | lint | 実装品質の基礎 |
| Changesets | 推奨 | 安定最新版追随 | version / release 管理 | package 分割と相性がよい |
| tsup または unbuild | 推奨 | 安定最新版追随 | package build | CLI / library 出力 |

## package 構成案

### `@owox-harness/core`

責務:

- schema
- workflow model
- task state machine
- policy evaluation
- locale-independent internal model
- renderer interface
- subagent contract model

特徴:

- 可能な限り pure に寄せる
- file system や subprocess に依存しない

### `@owox-harness/cli`

責務:

- command entry points
- file IO
- subprocess 実行
- generation
- adapter integration
- locale rendering

特徴:

- core を呼ぶ薄い実行レイヤー
- CLI ごとの差異は adapter に集約する

## ディレクトリ構成の推奨

```text
packages/
  core/
  cli/
  profiles/
    web/
  adapters/
    codex/
    claude-code/
    opencode/
    copilot-cli/
  fixtures/
  templates/
  i18n/
docs/
```

## 実装開始時の package 優先順

1. `packages/core`
2. `packages/cli`
3. `packages/adapters/*`
4. `packages/profiles/*`
5. `templates/`, `i18n/`, `fixtures/`

この順序は、共通契約と判定ロジックを先に固め、CLI 差分を後から載せるための推奨順です。

## workspace scripts 方針

少なくとも次の責務を持つ script 群を用意することを推奨します。

- `build`: package build
- `test`: unit / integration / snapshot の入口
- `lint`: 静的検査
- `typecheck`: 型検査
- `validate`: harness / docs / generation の整合性確認

script 名は最終実装で多少変わってもよいですが、責務の分離は維持します。

## i18n 方針

- internal keys / hidden prompts / workflow states は英語を基本にする
- visible documents は locale renderer で描画する
- locale resources は code と分離して持つ

## profile 方針

初期 profile は `web` を優先します。少なくとも次のような拡張余地を残します。

- `web`
- `python`
- `rust`
- `go`
- `unity`
- `infra`

profile は主に次を切り替えます。

- verify コマンド
- docs 雛形
- task templates
- risk rules
- subagent defaults

## テストスタック方針

- unit: core の状態遷移と policy 判定
- snapshot: generated files と visible docs
- integration: generator + runtime tools
- e2e: fixture repo 上での init → task → verify → sync

## 依存関係で避けたいもの

- core からの heavy runtime 依存
- CLI 固有 SDK への過剰依存
- web profile を core に固定する設計
- locale 文字列を source code に散在させる実装

## 関連資料

- `requirements/REQ-harness-v2-foundation.md`
- `architecture.md`
- `specs/core/SPEC-task-state-machine.md`
- `specs/cli/SPEC-command-surface.md`
- `validation.md`
