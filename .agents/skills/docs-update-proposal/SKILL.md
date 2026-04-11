---
name: docs-update-proposal
description: 設計草案、構成変更案、移行案を追加、更新、正規化するときに使用する
argument-hint: "topic=<提案テーマ> scope=<対象範囲> goal=<解決したい課題>"
---

## 目的

正式仕様の前段階にある設計草案や提案を、採否判断と正式化に使える形で記録する。

## 前提資料

- `docs/project/index.md`
- `docs/project/glossary/core.md`
- `docs/project/proposals/index.md`
- `.agents/skills/docs-update-proposal/references/proposal.template.md`
- `.agents/skills/docs-update-proposal/references/best-practices.md`
- 必要に応じて `docs/project/architecture.md`
- 関連する research / requirement / spec / ADR / pattern

## やること

1. 必要なら `request_user_input` で背景、提案内容、対象範囲、非目標、採否判断に必要な材料を確認する
2. 既存の `docs/project/proposals/active/` と `archive/` を確認し、重複や置換対象がないか調べる
3. 背景、提案内容、代替案、利点、リスク、未確定事項を整理する
4. `active/proposal-<topic>.md` を作成または更新する
5. `docs/project/proposals/index.md` の参照リストに active / archive と個票の更新が必要か確認する
6. 採用後に requirement / spec / ADR へ昇格すべき内容を整理する
7. 参照優先度を落とす proposal は `archive/` へ移し、index の更新要否も確認する

## ルール

- proposal は採用済み正本ではなく、採否判断前の草案として扱う
- 代替案と不採用理由を省略しない
- 未確定事項を曖昧にぼかさない
- ハーネス運用ルールを proposal に書かない

## 確認事項

- 背景、提案内容、代替案、利点、リスクがある
- 未確定事項が明示されている
- `docs/project/proposals/index.md` の更新要否を確認した
- requirement / spec / ADR への昇格候補を整理した
- active と archive の配置が妥当である