# プロジェクト資料

## 目的

`docs/project/` は、このプロジェクトの正本を置く場所です。要求、仕様、判断、用語、検証、外部連携、チーム資料をここで管理します。

## 読む順序

1. `glossary/core.md`
2. `requirements/REQ-harness-v2-foundation.md`
3. `architecture.md`
4. `integrations/ai-coding-clis.md`
5. `tech-stack.md`
6. `validation.md`
7. 対象カテゴリの `index.md`
8. 必要な個票

## 資料種別の使い分け

- `research/`: 技術調査、制約調査、実現性確認
- `proposals/`: 正式化前の設計草案、提案、移行案
- `requirements/`: 何を実現するか
- `specs/`: どう振る舞うか
- `adr/`: 重要判断と理由
- `patterns/`: 横断的に再利用する設計・実装パターン

## AI 参照導線

AI は通常、この index から `glossary/core.md`、`requirements/REQ-harness-v2-foundation.md`、`architecture.md`、`integrations/ai-coding-clis.md`、対象カテゴリ `index.md`、対象個票の順で参照します。archive は明示的に必要な場合だけ参照します。

## ハーネス全体の参照順

- 目的と境界を確認する: `requirements/REQ-harness-v2-foundation.md`
- 設計原則と責務分離を確認する: `architecture.md`
- CLI ごとの差分と接続境界を確認する: `integrations/ai-coding-clis.md`
- 実装前提を確認する: `tech-stack.md`
- 検証観点を確認する: `validation.md`
- 詳細化が必要な領域だけカテゴリ `index.md` と個票へ降りる

## 実装開始前の最小読書セット

- 共通契約を確認する: `specs/shared/SPEC-workflow-core-contracts.md`
- adapter 契約を確認する: `specs/shared/SPEC-integration-adapter-contracts.md`
- `core` 実装に入る前: `specs/core/SPEC-task-state-machine.md`, `specs/core/SPEC-policy-evaluation.md`
- `cli` 実装に入る前: `specs/cli/SPEC-command-surface.md`, `specs/cli/SPEC-generation-pipeline.md`
- 実装判断に迷ったら: `patterns/impl-adapter-boundary.md`
- 完了判定や検証で迷ったら: `patterns/test-evidence-driven-validation.md`

## 参照

- `glossary/index.md`: 用語集カテゴリの入口
- `glossary/core.md`: 必読の共通用語
- `requirements/index.md`: 要求カテゴリの入口
- `architecture.md`: 不変条件、責務分離、設計方針
- `requirements/REQ-harness-v2-foundation.md`: v2 要件定義
- `requirements/REQ-intent-governed-agent-control.md`: intent 契約、`owox` 必須利用、`.owox/` 境界の要求
- `integrations/ai-coding-clis.md`: AI coding CLI 連携仕様
- `integrations/index.md`: 外部連携カテゴリの入口
- `tech-stack.md`: 採用技術一覧
- `validation.md`: 検証方針
- `research/index.md`: 技術調査カテゴリの入口
- `proposals/index.md`: 設計草案カテゴリの入口
- `specs/index.md`: 仕様カテゴリの入口
- `specs/shared/SPEC-intent-governed-agent-control.md`: intent、decision ledger、mandatory `owox` execution、`.owox/` 境界の仕様
- `patterns/index.md`: パターンカテゴリの入口
- `adr/index.md`: 重要判断カテゴリの入口
- `teams/index.md`: チームガイドカテゴリの入口
