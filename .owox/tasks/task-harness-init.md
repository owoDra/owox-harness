# Task

## 目的

placeholder の `.owox/project.md` を確定し、後続 task を始められる最低限の正本を初期化する。

## 状態

completed

## 依頼内容

`harness-init`

## 確定前提

- Phase 1: `Name` = `owox-harness` (`confirmed`)
- Phase 1: `Description` は確定済み。`project.md` では英語化して記載する (`confirmed`)
- Phase 1: `Language` = `English` (`confirmed`)
- Phase 1: `Kind` = `monorepo` (`confirmed`)
- Phase 1: `Subprojects` = `core`, `cli` (`confirmed`)
- Phase 1: `Teams` = `none` (`none`)
- Phase 1: `Integrations` = `opencode`, `claude-code`, `codex`, `copilot-cli` (`confirmed`)
- Phase 2: glossary は既存 `docs/project/glossary/core.md` を継続利用し、今回の追加は不要 (`none`)
- Phase 2: tech-stack は既存 `docs/project/tech-stack.md` を継続利用し、今回の追加は不要 (`none`)
- Phase 4: architecture は既存 `docs/project/architecture.md` を継続利用する (`confirmed`)
- Phase 4: validation は既存 `docs/project/validation.md` を継続利用する (`confirmed`)
- Phase 5: team guide は作成しない (`none`)

## 未確定事項

- なし

## 対象範囲

- `.owox/project.md`
- `.owox/tasks/task-harness-init.md`
- `docs/project/` の最低限の正本

## 対象外

- 実装コードの追加や変更
- 初期化と無関係な docs の全面改訂

## 守るべき不変条件

- `none` と `tbd` を混同しない
- `docs/project/` にはプロジェクト正本だけを書く
- placeholder を確定するまでは project 固有情報として扱わない

## 参照する正本

- `docs/project/index.md`
- `docs/project/glossary/core.md`
- `docs/project/architecture.md`
- `docs/project/tech-stack.md`
- `docs/project/validation.md`
- `docs/project/teams/index.md`
- `docs/project/integrations/index.md`

## 今回読まなくてよい資料

- archive 配下の資料

## 実施方針

- 固定アンケートに沿って順に確認する
- 回答結果を task に `confirmed` / `none` / `tbd` で記録する
- 必要最小限の正本だけを初期化する

## 実施手順

1. 既存指示と固定アンケートを確認する
2. Phase 1 から順にユーザーへ確認する
3. `.owox/project.md` と必要な正本を更新する
4. `harness-validation` で整合性確認する

## 検証項目

- `.owox/project.md` の placeholder が確定値に置き換わっている
- 未確認の必須項目が残っていない
- `none` と `tbd` が分離されている

## 完了条件

- `.owox/project.md` が確定している
- 最低限必要な正本が初期化されている
- 初期化内容を task に反映している
- 整合性確認が完了している

## 進捗記録

- 2026-04-17: `harness-init` 開始。project 指示、既存 docs、固定アンケートを確認した。
- 2026-04-17: Phase 1-5 の回答を反映し、`project.md`、subproject specs 入口、integration 個票の初期化を開始した。
- 2026-04-17: `README.md` を追加し、当時のハーネス検証スクリプトで整合性確認を完了した。

## 次に読むもの

- `docs/project/index.md`
- `docs/project/integrations/ai-coding-clis.md`
