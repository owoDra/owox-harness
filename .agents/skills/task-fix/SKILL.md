---
name: task-fix
description: 不具合修正、レビュー指摘対応、失敗修正が主目的の task を開始し、原因調査から回帰確認まで進めるときに使用する
argument-hint: "goal=<何を直すか> mode=<agent-led|collab-led>"
---

## 目的

症状の確認、原因特定、修正、回帰確認を行い、必要な正本更新まで含めて修正を完了させる。

## 前提資料

- `.agents/project.md`
- `.agents/skills/_shared/task-template.md`
- `.agents/skills/_shared/document-update-checklist.md`
- `.agents/skills/_shared/execution-modes.md`
- `docs/project/index.md`
- `docs/project/glossary/core.md`
- `docs/project/architecture.md` が存在する場合は参照する
- 関連 requirement / spec / ADR / validation / code / test

## やること

1. 対象 `.agents/tasks/task-*.md` を作成または更新し、症状、再現条件、停止条件、回帰確認方法を明文化する
2. 必要なら `request_user_input` で症状の優先順位、互換性への影響許容、完了条件を確認する
3. 症状を再現または確認する
4. 原因候補を絞り、根本原因を特定する
5. 最小限の修正を行い、関連テストと回帰確認を実施する
6. 必要な正本更新要否を確認し、task に記録する

## ルール

- 再現または症状確認なしに修正を始めない
- 症状、原因、修正、回帰確認を分けて記録する
- 仕様問題を実装だけで隠さない
- 高リスク変更が必要なら `request_user_input` を使う

## 確認事項

- 症状と再現条件が明確である
- 原因が整理されている
- 回帰確認方法と結果が残っている
- 正本更新の要否を確認した