# Task

## 目的

プロジェクト・ハーネスのルールに従って自走で実装開始しても支障が出ない水準まで、`owox-harness` の正本資料を具体化する。

## 状態

completed

## 依頼内容

- プロジェクト・ハーネスのルールに従って自走で開発開始しても問題がないレベルに資料を整える

## 確定前提

- 進め方は `自走`
- visible documents は日本語で統一する
- 要求、仕様、パターン、検証の責務境界は維持する
- 既存の `requirements`、`architecture`、`integrations`、`shared specs` を起点に具体仕様を拡充する

## 未確定事項

- なし

## 対象範囲

- `docs/project/index.md`
- `docs/project/architecture.md`
- `docs/project/tech-stack.md`
- `docs/project/validation.md`
- `docs/project/specs/core/`
- `docs/project/specs/cli/`
- `docs/project/patterns/`
- 関連 index 文書

## 対象外

- 実装コード
- ADR の追加
- archive 資料の追加

## 守るべき不変条件

- 正本間の役割を混同しない
- `shared/` には横断契約、`core/` と `cli/` には package 固有仕様を書く
- パターンは仕様の代替ではなく、実装判断の再利用単位として書く

## 参照する正本

- `docs/project/index.md`
- `docs/project/requirements/REQ-harness-v2-foundation.md`
- `docs/project/architecture.md`
- `docs/project/integrations/ai-coding-clis.md`
- `docs/project/tech-stack.md`
- `docs/project/validation.md`
- `docs/project/specs/shared/SPEC-workflow-core-contracts.md`
- `docs/project/specs/shared/SPEC-integration-adapter-contracts.md`

## 今回読まなくてよい資料

- archive 配下の proposal / ADR

## 実施方針

- 自走で着手しやすいように、package ごとの初期仕様を足す
- 実装判断で迷いやすい点は pattern と validation に明示する
- index と相互参照を更新し、読み順をさらに具体化する

## 実施手順

1. 実装開始時に不足する仕様とパターンを洗い出す
2. `core` / `cli` の初期仕様を追加する
3. 再利用すべき実装 / テストパターンを追加する
4. `index`、`tech-stack`、`validation` の導線を更新する
5. ハーネス検証を実行する

## 検証項目

- `core` / `cli` に実装開始可能な最低限の仕様個票がある
- `patterns` に実装判断の共通化資料がある
- `index` から必要資料へ辿れる
- ハーネス検証スクリプトが通る

## 完了条件

- 自走実装開始に必要な資料が主要カテゴリへ配置されている
- 相互参照が更新されている
- 検証結果が task に記録されている

## 進捗記録

- 2026-04-17: 自走実装開始に足りない資料として、`core` / `cli` 個票、共通 pattern、実装前後の検証導線を補う方針を決めた。
- 2026-04-17: `core` と `cli` の初期仕様個票、adapter 境界と evidence 駆動検証の pattern 個票を追加し、`index` / `tech-stack` / `validation` の導線を更新した。
- 2026-04-17: 当時のハーネス検証スクリプトを実行し、整合性検証を完了した。

## 次に読むもの

- `docs/project/specs/core/index.md`
- `docs/project/specs/cli/index.md`
- `docs/project/patterns/index.md`
