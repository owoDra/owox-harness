# Task

## 目的

`owox-harness` v2 を本番運用に近い水準まで進め、source schema、generation pipeline、runtime tools、adapter generation、検証まで含む実装基盤を整える。

## 状態

in_progress

## 依頼内容

- v2 の開発を開始する

## 確定前提

- 進め方は `自走`
- `packages/core` を先に整備し、その上に `packages/cli` を載せる
- 最小土台は導入済みなので、次は source/generation/runtime/adapters を拡張する

## 未確定事項

- plugin / MCP server の配布粒度

## 対象範囲

- `packages/core/`
- `packages/cli/`
- fixture と integration test
- 必要な docs 更新

## 対象外

- 完全な MCP server 実装
- 外部サービス公開や release automation

## 守るべき不変条件

- source of truth と generated artifacts の責務を混同しない
- CLI 固有差分を core に持ち込まない
- hidden context の内部キーは英語ベースで保つ
- CLI 固有差分は adapter renderer に閉じ込める
- source から generated artifacts を再生成できる状態を維持する

## 参照する正本

- `docs/project/index.md`
- `docs/project/glossary/core.md`
- `docs/project/requirements/REQ-harness-v2-foundation.md`
- `docs/project/requirements/REQ-intent-governed-agent-control.md`
- `docs/project/architecture.md`
- `docs/project/tech-stack.md`
- `docs/project/validation.md`
- `docs/project/specs/shared/SPEC-workflow-core-contracts.md`
- `docs/project/specs/shared/SPEC-intent-governed-agent-control.md`
- `docs/project/specs/shared/SPEC-integration-adapter-contracts.md`
- `docs/project/specs/core/SPEC-task-state-machine.md`
- `docs/project/specs/core/SPEC-policy-evaluation.md`
- `docs/project/specs/cli/SPEC-command-surface.md`
- `docs/project/specs/cli/SPEC-generation-pipeline.md`
- `docs/project/patterns/impl-adapter-boundary.md`
- `docs/project/patterns/test-evidence-driven-validation.md`

## 今回読まなくてよい資料

- archive 配下の資料

## 実施方針

- core では workflow 契約、policy、handoff、task 文脈モデルを純粋ロジックとして拡張する
- cli では `harness-init`、`task`、`verify`、`guard`、`gate`、`handoff`、`sync`、`validate` を実装する
- `owox.harness.yaml` を source of truth として扱う schema と internal model を整える
- 4 CLI 向け generated artifacts を adapter renderer で出力する
- fixture と integration test で generation idempotency と validate を確認する

## 実施手順

1. 現状実装と spec の差分を埋める設計に更新する
2. source schema、internal model、generation pipeline を実装する
3. runtime commands と task / handoff 管理を拡張する
4. 4 CLI 向け adapter renderer を実装する
5. fixture / integration / snapshot 相当の検証を追加する
6. lint / typecheck / test / build を実行し、結果を記録する

## 検証項目

- state machine が spec どおりの遷移のみ許可する
- verify / guard / gate / handoff が spec どおりの契約を返す
- `harness-init` と `sync` が source から generated artifacts を出力できる
- `validate` が schema、配置、生成差分、adapter 出力を検査できる
- 4 CLI 向け generated artifacts が出力される
- 再生成で無駄な差分が出ない

## 完了条件

- source schema、generation、runtime commands、adapter generation が実装されている
- core / cli に対する unit / integration test が追加されている
- 実行した検証結果が task に記録されている

## 進捗記録

- 2026-04-17: v2 開発開始要求を受け、docs 正本と実装前提を確認した。
- 2026-04-17: 初回スコープを `core + cli の最小土台実装` に定義した。
- 2026-04-17: pnpm workspace、TypeScript、Vitest、ESLint の最小構成を追加し、`@owox-harness/core` と `@owox-harness/cli` を新設した。
- 2026-04-17: `@owox-harness/core` に task state machine と policy evaluation を実装し、`@owox-harness/cli` に `validate`、`task-transition`、`verify`、`guard`、`gate` の最小入口を追加した。
- 2026-04-17: `pnpm validate` と `pnpm build` を実行し、workspace の lint / typecheck / test / build が通ることを確認した。
- 2026-04-17: 要求を本番運用レベルまで拡張し、source schema、generation pipeline、runtime tools、adapter generation、fixtures を含むスコープへ更新した。
- 2026-04-17: `owox.harness.yaml` schema、managed artifact generator、`harness-init`、`sync`、`handoff`、task lifecycle commands を実装し、4 CLI 向け generated files を追加した。
- 2026-04-17: fixture ベースの integration test を追加し、managed file drift の検知と修復、handoff 出力、task workflow を検証した。
- 2026-04-17: consultative `harness-init` の要求、仕様、ADR を追加し、scan / suggest / confirm / materialize / resume を正本化した。
- 2026-04-17: init session、repo scan、reference classification、suggestion 生成、confirmed decision の materialize を CLI 実装へ追加した。
- 2026-04-17: consultative init workflow の integration test を追加し、README に段階実行コマンドを記載した。
- 2026-04-17: managed markdown documents の token budget を要件、仕様、ADR に追加し、`owox.harness.yaml` で default / override を設定できるようにした。
- 2026-04-17: generation 時の compact / split と validate 時の token_limit 検知を実装し、low-budget 時の分割テストを追加した。
- 2026-04-17: adapter 生成物を hook / subagent / plugin レベルまで拡張し、Codex / Claude / OpenCode / Copilot の managed runtime files を増やした。
- 2026-04-17: fixture ベースで monorepo scan と既存 docs 保持の end-to-end tests を追加し、adapter 生成と consultative init を通しで検証した。
- 2026-04-17: `validate` に init session 完全性検査を追加し、consultative init の検証を強化した。
- 2026-04-17: Changesets 設定と release scripts を追加し、version / publish の運用導線を整えた。
- 2026-04-17: suggestion provider 抽象を追加し、builtin provider と external provider placeholder を切り替え可能にした。
- 2026-04-17: generated artifacts と suggestion 出力の固定テストを追加し、adapter/runtime files の代表出力を回帰検知できるようにした。
- 2026-04-17: external suggestion provider command 実行と decision template export を追加した。
- 2026-04-17: docs ingestion を再帰探索に拡張し、docs skeleton を拡充、broken markdown link を validate できるようにした。
- 2026-04-19: `.owox/` を AI 専用 artifact の保存先として実装へ反映し、task モデルへ intent / decision 前提、handoff packet、verify 二層化を追加した。
- 2026-04-19: `pnpm typecheck`、`pnpm test`、`pnpm build` が通ることを確認した。
- 2026-04-19: `README.md` と `owox.harness.example.yaml` を追加し、repo 内の運用説明を `.owox` 前提へ揃えた。

## 次に読むもの

- `docs/project/specs/core/SPEC-task-state-machine.md`
- `docs/project/specs/core/SPEC-policy-evaluation.md`
- `docs/project/specs/cli/SPEC-command-surface.md`
- `docs/project/specs/cli/SPEC-generation-pipeline.md`
